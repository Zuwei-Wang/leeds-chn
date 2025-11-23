#!/bin/bash
# 快速启动脚本 - MongoDB 版本

echo "🚀 启动 MongoDB 版本后端..."

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件"
    echo "请先创建 .env 文件并配置 MongoDB 连接"
    echo "参考: .env.example"
    exit 1
fi

# 停止可能运行的服务
lsof -ti:8000 | xargs kill -9 2>/dev/null

# 启动服务
cd "$(dirname "$0")"
uvicorn backend.main_mongodb:app --reload --host 0.0.0.0 --port 8000
