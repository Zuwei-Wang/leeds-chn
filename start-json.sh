#!/bin/bash
# 快速启动脚本 - JSON 版本

echo "🚀 启动 JSON 版本后端..."

# 停止可能运行的服务
lsof -ti:8000 | xargs kill -9 2>/dev/null

# 启动服务
cd "$(dirname "$0")"
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
