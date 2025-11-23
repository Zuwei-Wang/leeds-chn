# leeds-chn 利兹留学生网

## 项目介绍
该网站汇集了利兹留学生所需要的所有服务，与传统华人网不同的是该网站更加面向短期留学的学生。网站包含私厨，餐饮，娱乐，社交等活动。

## 技术栈
- 🎨 **前端**: HTML5 + CSS3 + Vanilla JavaScript
- ⚙️ **后端**: FastAPI + Python 3.11
- 💾 **数据库**: MongoDB Atlas（云数据库） / JSON 文件
- 📱 **响应式设计**，支持移动端和桌面端
- 🔒 **隐私保护**，无 Cookie 跟踪

## 🚀 快速开始

### 前端（静态网站）
```bash
# 使用任何 HTTP 服务器
python3 -m http.server 5500

# 或使用 VS Code Live Server 插件
```

### 后端 API

**选项 1: JSON 版本（无需数据库）**
```bash
./start-json.sh
```

**选项 2: MongoDB 版本**
```bash
# 1. 配置 .env 文件
code .env

# 2. 迁移数据
python scripts/migrate_to_mongodb.py

# 3. 启动服务
./start-mongodb.sh
```

## 📁 项目结构

详见 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

```
leeds-chn/
├── 前端文件（HTML + CSS + JS）
├── backend/          # 后端代码
├── data/            # 数据文件
├── scripts/         # 工具脚本
├── tests/           # 测试文件
└── docs/            # 文档
```

## 数据管理
所有商家数据存储在 `data/shops.json` 文件中。新增商家信息请编辑此文件。

### 数据格式示例：
```json
{
  "id": "shop_001",
  "category": "food",
  "type": "私厨",
  "name": "店铺名称",
  "address": "地址",
  "contact": {
    "wechat": "微信号",
    "phone": "电话"
  },
  "description": "描述",
  "services": "服务内容",
  "open_time": "营业时间",
  "images": ["image1.jpg"],
  "tags": "标签",
  "last_update": "2025/11/20"
}
```

## 网站地址
🌐 [lzlxs.co.uk](https://lzlxs.co.uk)

---
目前商家信息正在补充，投稿请联系。
利兹留学生网制作资源整合，不涉及违法犯罪等活动，将有着**严格**的审核。
