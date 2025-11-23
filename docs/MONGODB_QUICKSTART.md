# 🎯 MongoDB 快速开始

你现在正在注册 MongoDB，完成后按照以下步骤操作：

## ✅ 步骤 1: 获取连接信息（MongoDB Atlas）

注册完成后，你需要：

1. **创建数据库用户**
   - 进入 "Database Access"
   - 添加新用户，设置用户名和密码
   - 记住这些信息！

2. **配置网络访问**
   - 进入 "Network Access"
   - 添加 IP: `0.0.0.0/0`（允许所有访问）

3. **获取连接字符串**
   - 点击 "Connect" → "Drivers"
   - 复制连接字符串

## ✅ 步骤 2: 配置项目

```bash
# 1. 创建配置文件
cp .env.example .env

# 2. 编辑配置文件
code .env   # 或使用其他编辑器
```

在 `.env` 文件中填写你的连接信息：
```env
MONGODB_URL=mongodb+srv://你的用户名:你的密码@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=leeds_chn
```

## ✅ 步骤 3: 迁移数据

```bash
# 运行迁移脚本，将 JSON 数据导入 MongoDB
python migrate_to_mongodb.py
```

预期输出：
```
✅ 成功读取 30 条商家数据
✅ 成功连接到数据库
✅ 数据导入完成!
```

## ✅ 步骤 4: 启动 MongoDB 版本后端

```bash
# 先停止当前的 JSON 版本（如果在运行）
# Ctrl+C 或:
lsof -ti:8000 | xargs kill -9

# 启动 MongoDB 版本
python main_mongodb.py
```

## ✅ 步骤 5: 验证

```bash
# 测试接口
curl http://localhost:8000/ping

# 应该看到: {"message":"pong","shops_count":30,"database":"MongoDB"}
```

## 🎉 完成！

现在你的网站已经连接到 MongoDB 云数据库了！

### 新增功能

1. **搜索 API**: 
   ```bash
   curl "http://localhost:8000/api/search?q=私厨"
   ```

2. **统计 API**: 
   ```bash
   curl http://localhost:8000/api/stats
   ```

3. **API 文档**: 
   打开浏览器访问 http://localhost:8000/docs

---

## 📚 详细文档

- 完整设置指南: `MONGODB_SETUP.md`
- 已安装的包: `motor`, `pymongo`, `python-dotenv`
- 新文件:
  - `database.py` - 数据库连接管理
  - `main_mongodb.py` - MongoDB 版本后端
  - `migrate_to_mongodb.py` - 数据迁移脚本
  - `.env.example` - 配置模板

---

## ⚠️ 重要提示

1. **不要提交 `.env` 文件到 Git**（已添加到 .gitignore）
2. **密码中的特殊字符需要 URL 编码**
3. **生产环境记得修改 CORS 配置**

---

## 🆘 遇到问题？

查看 `MONGODB_SETUP.md` 的"常见问题"部分，或提供错误信息以获得帮助。
