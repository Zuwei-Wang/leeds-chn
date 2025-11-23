# MongoDB 集成指南

## 📝 准备工作

### 1. 注册 MongoDB Atlas（免费）

1. 访问 https://www.mongodb.com/cloud/atlas/register
2. 注册账号（可以用 Google 账号）
3. 创建免费集群（选择离你最近的区域）
4. 等待集群创建完成（约 3-5 分钟）

### 2. 配置数据库访问

#### 创建数据库用户
1. 进入 "Database Access" 菜单
2. 点击 "Add New Database User"
3. 选择 "Password" 认证方式
4. 设置用户名和密码（记住这些信息！）
5. 权限选择 "Atlas Admin" 或 "Read and write to any database"
6. 点击 "Add User"

#### 配置网络访问
1. 进入 "Network Access" 菜单
2. 点击 "Add IP Address"
3. 选择 "Allow Access from Anywhere" (0.0.0.0/0)
   - 生产环境建议只添加服务器 IP
4. 点击 "Confirm"

### 3. 获取连接字符串

1. 回到 "Database" 页面
2. 点击 "Connect" 按钮
3. 选择 "Drivers"
4. 选择 Python 和版本
5. 复制连接字符串，格式类似：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## 🚀 配置项目

### 1. 创建 .env 文件

```bash
# 复制示例配置
cp .env.example .env
```

### 2. 编辑 .env 文件

```bash
# 使用你喜欢的编辑器
code .env
# 或
nano .env
```

填写你的 MongoDB 信息：
```env
MONGODB_URL=mongodb+srv://你的用户名:你的密码@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=leeds_chn
ENVIRONMENT=development
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=*
```

⚠️ **注意**: 
- 将 `<username>` 替换为你创建的数据库用户名
- 将 `<password>` 替换为你设置的密码
- 将 `cluster0.xxxxx` 替换为你的集群地址

## 📦 数据迁移

### 运行迁移脚本

```bash
# 将 JSON 数据导入 MongoDB
python migrate_to_mongodb.py
```

你会看到类似的输出：
```
==================================================
开始数据迁移: JSON → MongoDB
==================================================

📖 读取 data/shops.json...
✅ 成功读取 30 条商家数据

🔌 连接到 MongoDB...
✅ 成功连接到数据库: leeds_chn

💾 导入数据到 MongoDB...
✅ 数据导入完成!
   - 新增: 30 条
   - 更新: 0 条
   - 总计: 30 条

🔍 创建索引...
✅ 索引创建完成

✅ 数据迁移成功!
```

## 🎯 启动 MongoDB 版本后端

### 方式 1: 直接运行
```bash
python main_mongodb.py
```

### 方式 2: 使用 uvicorn
```bash
uvicorn main_mongodb:app --reload --host 0.0.0.0 --port 8000
```

### 验证运行
```bash
# 测试 ping
curl http://localhost:8000/ping

# 获取所有商家
curl http://localhost:8000/api/shops

# 搜索商家
curl "http://localhost:8000/api/search?q=私厨"

# 查看统计
curl http://localhost:8000/api/stats
```

## 📚 API 文档

启动服务器后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔄 切换版本

### 使用 JSON 版本（当前）
```bash
# 停止 MongoDB 版本
# 启动 JSON 版本
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 使用 MongoDB 版本
```bash
# 停止 JSON 版本
# 启动 MongoDB 版本
uvicorn main_mongodb:app --reload --host 0.0.0.0 --port 8000
```

或者直接：
```bash
python main_mongodb.py
```

## 🆕 新功能

MongoDB 版本新增的功能：

### 1. 搜索 API
```bash
# 全文搜索
curl "http://localhost:8000/api/search?q=火锅"

# 按分类搜索
curl "http://localhost:8000/api/search?q=私厨&category=food"

# 限制结果数量
curl "http://localhost:8000/api/search?q=KTV&limit=10"
```

### 2. 统计 API
```bash
curl http://localhost:8000/api/stats
```

返回示例：
```json
{
  "total": 30,
  "by_category": {
    "food": 15,
    "entertainment": 8,
    "service": 7
  },
  "by_type": {
    "私厨": 12,
    "KTV": 5,
    "理发": 3
  }
}
```

## 🔧 常见问题

### 问题 1: 连接失败
```
❌ MongoDB 连接失败: ...
```

**解决方案:**
1. 检查 `.env` 文件中的 `MONGODB_URL` 是否正确
2. 确认用户名和密码正确
3. 确认已添加 IP 到白名单（0.0.0.0/0）
4. 检查网络连接

### 问题 2: 认证失败
```
Authentication failed
```

**解决方案:**
1. 确认数据库用户已创建
2. 检查用户名和密码是否正确
3. 密码中如果有特殊字符，需要进行 URL 编码

### 问题 3: 数据库为空
```
shops_count: 0
```

**解决方案:**
运行迁移脚本：
```bash
python migrate_to_mongodb.py
```

## 📊 数据管理

### 查看数据库内容

使用 MongoDB Compass（推荐）：
1. 下载安装: https://www.mongodb.com/try/download/compass
2. 使用连接字符串连接
3. 可视化查看和编辑数据

### 重新导入数据
```bash
# 会提示是否清空现有数据
python migrate_to_mongodb.py
```

### 导出数据
```bash
# 使用 mongodump（需要安装 MongoDB 工具）
mongodump --uri="你的连接字符串" --out=./backup
```

## 🚀 生产环境部署

### 1. 更新 .env
```env
ENVIRONMENT=production
CORS_ORIGINS=https://lzlxs.co.uk
```

### 2. 使用 systemd 或 Docker 部署

### 3. 定期备份数据

## 📖 资源链接

- MongoDB Atlas 文档: https://docs.atlas.mongodb.com/
- Motor 文档: https://motor.readthedocs.io/
- FastAPI 文档: https://fastapi.tiangolo.com/
