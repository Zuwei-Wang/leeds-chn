from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json

app = FastAPI()

# 解决前端跨域问题（必须在路由定义前添加）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本地调试全部放开，上线后改成具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 从 shops.json 读取数据
def load_shops_data():
    try:
        with open('data/shops.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"读取 shops.json 出错: {e}")
        return []

# 从 JSON 文件加载数据
shops = load_shops_data()

@app.get("/")
def root():
    """根路径"""
    return {"message": "利兹留学生网 API", "shops_count": len(shops)}

@app.get("/ping")
def ping():
    """测试接口"""
    return {"message": "pong", "shops_count": len(shops)}

@app.get("/api/shops")
def get_shops() -> List[dict]:
    """获取所有商家信息"""
    return shops

@app.get("/api/shops/{shop_id}")
def get_shop_by_id(shop_id: str):
    """根据 ID 获取单个商家信息"""
    shop = next((s for s in shops if s.get("id") == shop_id), None)
    if shop:
        return shop
    return {"error": "商家不存在", "id": shop_id}

@app.get("/api/shops/category/{category}")
def get_shops_by_category(category: str):
    """根据分类获取商家列表"""
    filtered = [s for s in shops if s.get("category") == category]
    return filtered
