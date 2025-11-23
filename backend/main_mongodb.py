from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import connect_to_mongo, close_mongo_connection, get_database

# 加载环境变量
load_dotenv()

# 生命周期管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时连接数据库
    await connect_to_mongo()
    yield
    # 关闭时断开连接
    await close_mongo_connection()

app = FastAPI(
    title="利兹留学生网 API",
    description="基于 MongoDB 的商家信息 API",
    version="2.0.0",
    lifespan=lifespan
)

# CORS 配置
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== API 路由 ====================

@app.get("/")
async def root():
    """根路径"""
    db = get_database()
    if db is None:
        return {"message": "利兹留学生网 API (MongoDB 未连接)", "version": "2.0.0"}
    
    count = await db.shops.count_documents({})
    return {
        "message": "利兹留学生网 API",
        "version": "2.0.0",
        "database": "MongoDB",
        "shops_count": count
    }

@app.get("/ping")
async def ping():
    """健康检查"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="数据库未连接")
    
    count = await db.shops.count_documents({})
    return {"message": "pong", "shops_count": count, "database": "MongoDB"}

@app.get("/api/shops")
async def get_shops() -> List[dict]:
    """获取所有商家"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="数据库未连接")
    
    shops = await db.shops.find().to_list(length=None)
    
    # 移除 MongoDB 的 _id 字段
    for shop in shops:
        shop.pop('_id', None)
    
    return shops

@app.get("/api/shops/{shop_id}")
async def get_shop_by_id(shop_id: str):
    """根据 ID 获取单个商家"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="数据库未连接")
    
    shop = await db.shops.find_one({"id": shop_id})
    
    if not shop:
        raise HTTPException(status_code=404, detail=f"商家不存在: {shop_id}")
    
    # 移除 MongoDB 的 _id 字段
    shop.pop('_id', None)
    return shop

@app.get("/api/shops/category/{category}")
async def get_shops_by_category(category: str):
    """根据分类获取商家"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="数据库未连接")
    
    shops = await db.shops.find({"category": category}).to_list(length=None)
    
    # 移除 MongoDB 的 _id 字段
    for shop in shops:
        shop.pop('_id', None)
    
    return shops

@app.get("/api/search")
async def search_shops(
    q: str,
    category: Optional[str] = None,
    limit: int = 50
):
    """
    搜索商家
    
    参数:
    - q: 搜索关键词（搜索名称、标签、服务等）
    - category: 可选，按分类过滤
    - limit: 返回结果数量限制，默认 50
    """
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="数据库未连接")
    
    if not q or len(q.strip()) == 0:
        raise HTTPException(status_code=400, detail="搜索关键词不能为空")
    
    query = q.lower()
    
    # 构建查询条件
    search_filter = {
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"tags": {"$regex": query, "$options": "i"}},
            {"services": {"$regex": query, "$options": "i"}},
            {"type": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
        ]
    }
    
    # 如果指定了分类，添加分类过滤
    if category:
        search_filter["category"] = category
    
    shops = await db.shops.find(search_filter).limit(limit).to_list(length=limit)
    
    # 移除 MongoDB 的 _id 字段
    for shop in shops:
        shop.pop('_id', None)
    
    return {
        "query": q,
        "category": category,
        "count": len(shops),
        "results": shops
    }

@app.get("/api/stats")
async def get_stats():
    """获取统计信息"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="数据库未连接")
    
    total = await db.shops.count_documents({})
    
    # 按分类统计
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    category_stats = await db.shops.aggregate(pipeline).to_list(length=None)
    
    # 按类型统计
    pipeline = [
        {"$group": {"_id": "$type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    type_stats = await db.shops.aggregate(pipeline).to_list(length=None)
    
    return {
        "total": total,
        "by_category": {item["_id"]: item["count"] for item in category_stats},
        "by_type": {item["_id"]: item["count"] for item in type_stats}
    }

# ==================== 开发环境运行 ====================
if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    print(f"🚀 启动服务器: http://{host}:{port}")
    print(f"📚 API 文档: http://{host}:{port}/docs")
    
    uvicorn.run(
        "main_mongodb:app",
        host=host,
        port=port,
        reload=True
    )
