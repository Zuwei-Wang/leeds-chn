# 利兹留学生网 - 项目结构

## 📁 目录结构

```
leeds-chn/
├── 📄 前端文件（HTML）
│   ├── index.html              # 首页
│   ├── food.html               # 餐饮列表
│   ├── entertainment.html      # 娱乐列表
│   ├── service.html            # 服务列表
│   ├── search.html             # 搜索页
│   ├── details.html            # 商家详情页
│   ├── contact.html            # 联系页面
│   └── legal.html              # 法律声明
│
├── 📁 assets/                  # 前端资源
│   ├── css/
│   │   └── style.css           # 全局样式
│   ├── js/
│   │   ├── config.js           # API 配置（自动检测环境）
│   │   └── main.js             # 主要前端逻辑
│   ├── images/                 # 商家图片（按 ID 分类）
│   │   ├── 001/
│   │   ├── 002/
│   │   └── ...
│   └── banners/                # 轮播图
│
├── 📁 backend/                 # 后端代码
│   ├── main.py                 # JSON 版本后端（当前使用）
│   ├── main_mongodb.py         # MongoDB 版本后端
│   └── database.py             # 数据库连接管理
│
├── 📁 data/                    # 数据文件
│   └── shops.json              # 商家数据（JSON 格式）
│
├── 📁 scripts/                 # 脚本工具
│   ├── migrate_to_mongodb.py  # 数据迁移脚本
│   └── verify-integration.sh  # 集成验证脚本
│
├── 📁 tests/                   # 测试文件
│   └── test-api.html           # API 测试页面
│
├── 📁 docs/                    # 文档
│   ├── BACKEND_INTEGRATION.md  # 后端集成文档
│   ├── MONGODB_SETUP.md        # MongoDB 设置指南
│   ├── MONGODB_QUICKSTART.md   # MongoDB 快速开始
│   └── NEXT_STEPS.md           # 下一步计划
│
├── 📄 配置文件
│   ├── .env                    # 环境变量（敏感信息，不提交）
│   ├── .env.example            # 环境变量示例
│   ├── .gitignore              # Git 忽略规则
│   ├── robots.txt              # 搜索引擎规则
│   ├── sitemap.xml             # 站点地图
│   └── CNAME                   # 域名配置
│
├── 📄 启动脚本
│   ├── start-json.sh           # 启动 JSON 版本后端
│   └── start-mongodb.sh        # 启动 MongoDB 版本后端
│
└── 📄 README.md                # 项目说明

```

## 🚀 快速启动

### 方式 1: JSON 版本（无需数据库）
```bash
./start-json.sh
```

### 方式 2: MongoDB 版本（需要配置）
```bash
# 1. 编辑 .env 文件，填写 MongoDB 密码
code .env

# 2. 迁移数据到 MongoDB
python scripts/migrate_to_mongodb.py

# 3. 启动服务
./start-mongodb.sh
```

## 📝 下一步操作

### 1️⃣ 配置 MongoDB（如果使用 MongoDB 版本）

编辑 `.env` 文件，将 `<db_password>` 替换为你的实际密码：
```bash
code .env
```

### 2️⃣ 选择并启动后端

**选项 A: JSON 版本（推荐先用这个）**
```bash
./start-json.sh
```

**选项 B: MongoDB 版本**
```bash
# 先迁移数据
python scripts/migrate_to_mongodb.py

# 再启动服务
./start-mongodb.sh
```

### 3️⃣ 测试

打开浏览器访问：
- 前端: http://localhost:5500/
- API 测试: http://localhost:5500/tests/test-api.html
- API 文档: http://localhost:8000/docs

## 📚 重要文件说明

| 文件 | 说明 |
|------|------|
| `backend/main.py` | 当前使用的后端（读取 JSON） |
| `backend/main_mongodb.py` | MongoDB 版本后端 |
| `assets/js/config.js` | API 配置，自动检测开发/生产环境 |
| `data/shops.json` | 商家数据源 |
| `.env` | 环境变量配置（**需要手动填写密码**） |
| `scripts/migrate_to_mongodb.py` | 数据迁移工具 |

## ⚠️ 注意事项

1. `.env` 文件包含敏感信息，已添加到 `.gitignore`，不会被提交
2. 修改 `shops.json` 后，JSON 版本会自动生效，MongoDB 版本需要重新迁移
3. 两个后端版本 API 接口完全兼容，前端无需修改
4. MongoDB 版本新增了搜索和统计功能

## 🔧 常用命令

```bash
# 查看后端是否运行
curl http://localhost:8000/ping

# 停止后端服务
lsof -ti:8000 | xargs kill -9

# 验证集成
bash scripts/verify-integration.sh

# 查看 MongoDB 数据
python scripts/migrate_to_mongodb.py
```

## 📖 详细文档

- MongoDB 设置: `docs/MONGODB_SETUP.md`
- 后端集成: `docs/BACKEND_INTEGRATION.md`
- 下一步计划: `docs/NEXT_STEPS.md`
