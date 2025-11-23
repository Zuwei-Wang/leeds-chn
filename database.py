import os
from dotenv import load_dotenv
from pymongo import MongoClient

# 读取 .env
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB_NAME", "leeds-chn")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set. Check your .env file.")

# 用 Atlas 的 URI 连接，而不是 localhost
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

shops_collection = db["shops"]
