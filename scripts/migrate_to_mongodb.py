#!/usr/bin/env python3
"""
数据迁移脚本：从 JSON 文件导入数据到 MongoDB
运行方式: python migrate_to_mongodb.py
"""

import json
import sys
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# 加载环境变量
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "leeds_chn")
JSON_FILE = "data/shops.json"

def migrate_data():
    """迁移数据从 JSON 到 MongoDB"""
    
    if not MONGODB_URL:
        print("❌ 错误: 未找到 MONGODB_URL 环境变量")
        print("请先创建 .env 文件并配置 MongoDB 连接")
        sys.exit(1)
    
    print("=" * 50)
    print("开始数据迁移: JSON → MongoDB")
    print("=" * 50)
    
    # 1. 读取 JSON 数据
    print(f"\n📖 读取 {JSON_FILE}...")
    try:
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            shops_data = json.load(f)
        print(f"✅ 成功读取 {len(shops_data)} 条商家数据")
    except Exception as e:
        print(f"❌ 读取 JSON 失败: {e}")
        sys.exit(1)
    
    # 2. 连接 MongoDB
    print(f"\n🔌 连接到 MongoDB...")
    try:
        client = MongoClient(MONGODB_URL)
        db = client[MONGODB_DB_NAME]
        # 测试连接
        db.command("ping")
        print(f"✅ 成功连接到数据库: {MONGODB_DB_NAME}")
    except Exception as e:
        print(f"❌ MongoDB 连接失败: {e}")
        sys.exit(1)
    
    # 3. 清空现有数据（可选）
    collection = db["shops"]
    existing_count = collection.count_documents({})
    
    if existing_count > 0:
        response = input(f"\n⚠️  数据库中已有 {existing_count} 条数据，是否清空? (y/N): ")
        if response.lower() == 'y':
            collection.delete_many({})
            print("🗑️  已清空现有数据")
        else:
            print("📝 将追加新数据（相同 id 会被更新）")
    
    # 4. 插入数据
    print(f"\n💾 导入数据到 MongoDB...")
    try:
        # 使用 upsert 避免重复
        inserted = 0
        updated = 0
        
        for shop in shops_data:
            result = collection.update_one(
                {"id": shop["id"]},  # 匹配条件
                {"$set": shop},       # 更新内容
                upsert=True           # 不存在则插入
            )
            
            if result.upserted_id:
                inserted += 1
            elif result.modified_count > 0:
                updated += 1
        
        print(f"✅ 数据导入完成!")
        print(f"   - 新增: {inserted} 条")
        print(f"   - 更新: {updated} 条")
        print(f"   - 总计: {collection.count_documents({})} 条")
        
    except Exception as e:
        print(f"❌ 数据导入失败: {e}")
        sys.exit(1)
    
    # 5. 创建索引
    print(f"\n🔍 创建索引...")
    try:
        # 为常用查询字段创建索引
        collection.create_index("id", unique=True)
        collection.create_index("category")
        collection.create_index("type")
        collection.create_index("name")
        print("✅ 索引创建完成")
    except Exception as e:
        print(f"⚠️  索引创建警告: {e}")
    
    # 6. 验证数据
    print(f"\n✅ 数据迁移成功!")
    print(f"\n📊 数据库统计:")
    print(f"   - 数据库: {MONGODB_DB_NAME}")
    print(f"   - 集合: shops")
    print(f"   - 文档数: {collection.count_documents({})}")
    
    # 显示示例数据
    print(f"\n📄 示例数据:")
    sample = collection.find_one()
    if sample:
        sample.pop('_id', None)  # 移除 MongoDB 的 _id 字段
        print(json.dumps(sample, ensure_ascii=False, indent=2)[:300] + "...")
    
    client.close()
    print(f"\n🎉 迁移完成！现在可以启动使用 MongoDB 的后端了")
    print(f"   运行: python main_mongodb.py")

if __name__ == "__main__":
    migrate_data()
