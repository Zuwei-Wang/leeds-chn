# 数据库配置和连接
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# MongoDB 配置
MONGODB_URL = os.getenv("MONGODB_URL", "")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "leeds_chn")

# 全局数据库客户端
mongodb_client: AsyncIOMotorClient = None
database = None

async def connect_to_mongo():
    """连接到 MongoDB"""
    global mongodb_client, database
    try:
        mongodb_client = AsyncIOMotorClient(MONGODB_URL)
        database = mongodb_client[MONGODB_DB_NAME]
        # 测试连接
        await database.command("ping")
        print(f"✅ 成功连接到 MongoDB: {MONGODB_DB_NAME}")
        return True
    except Exception as e:
        print(f"❌ MongoDB 连接失败: {e}")
        return False

async def close_mongo_connection():
    """关闭 MongoDB 连接"""
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        print("MongoDB 连接已关闭")

def get_database():
    """获取数据库实例"""
    return database

# 同步版本（用于数据迁移脚本）
def get_sync_database():
    """获取同步数据库连接（用于脚本）"""
    client = MongoClient(MONGODB_URL)
    return client[MONGODB_DB_NAME]
