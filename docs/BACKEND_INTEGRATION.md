# 后端接入问题诊断与解决

## 📋 已发现并修复的问题

### 1. ✅ CORS 中间件配置问题
**问题**: CORS 中间件添加在路由定义之后
**影响**: 前端请求会被浏览器拦截
**解决**: 将 `app.add_middleware()` 移到所有路由定义之前

### 2. ✅ 后端从 JSON 文件读取数据
**问题**: 后端没有读取 `data/shops.json`，而是使用硬编码的测试数据
**影响**: 后端返回的数据不完整
**解决**: 添加 `load_shops_data()` 函数从 JSON 文件加载数据

### 3. ✅ 前端仍使用本地 JSON
**问题**: `main.js` 和 `details.html` 仍然直接读取本地 JSON 文件
**影响**: 无法使用后端 API
**解决**: 修改前端代码，优先调用 API，失败时降级到本地 JSON

### 4. ✅ 缺少单个商家查询接口
**问题**: 详情页需要单独获取商家信息，但缺少对应 API
**影响**: 详情页加载效率低
**解决**: 添加 `/api/shops/{shop_id}` 接口

### 5. ✅ 缺少分类查询接口
**问题**: 分类页面需要按分类筛选，但缺少对应 API
**影响**: 前端需要获取全部数据再筛选
**解决**: 添加 `/api/shops/category/{category}` 接口

### 6. ✅ API 地址硬编码
**问题**: API 地址直接写在代码中，不便于切换环境
**影响**: 开发和生产环境需要手动修改代码
**解决**: 创建 `config.js` 自动检测环境并配置 API 地址

## 🚀 已完成的改进

### 后端 (main.py)
- ✅ 修正 CORS 中间件位置
- ✅ 从 `data/shops.json` 读取数据
- ✅ 添加 `/api/shops` - 获取所有商家
- ✅ 添加 `/api/shops/{shop_id}` - 获取单个商家
- ✅ 添加 `/api/shops/category/{category}` - 按分类获取
- ✅ 添加 `/ping` 测试接口

### 前端 (assets/js/)
- ✅ 创建 `config.js` - API 配置管理
- ✅ 修改 `main.js` - 优先使用 API，支持降级
- ✅ 修改 `details.html` - 使用单个商家 API

### 测试
- ✅ 创建 `test-api.html` - API 测试页面

## 🧪 如何测试

### 1. 启动后端
```bash
# 在项目根目录运行
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 测试 API
```bash
# 测试 ping
curl http://localhost:8000/ping

# 获取所有商家
curl http://localhost:8000/api/shops

# 获取单个商家
curl http://localhost:8000/api/shops/chef_001

# 按分类获取
curl http://localhost:8000/api/shops/category/food
```

### 3. 打开测试页面
在浏览器中打开: `http://localhost:5500/test-api.html`

或使用 Live Server 打开项目，然后访问测试页面

## ⚠️ 需要注意的问题

### 当前已知问题
1. **服务器启动方式**: 
   - 目前使用 `nohup` 后台启动
   - 建议使用 `--reload` 模式开发，生产环境用 systemd 或 Docker

2. **数据同步**: 
   - 后端读取 JSON 文件后缓存在内存
   - 如果修改 JSON 文件，需要重启后端才能生效
   - 未来建议接入 MongoDB 数据库

3. **生产环境配置**:
   - CORS 设置为 `allow_origins=["*"]` 仅用于开发
   - 上线时需要改为具体域名: `allow_origins=["https://lzlxs.co.uk"]`

4. **API 地址配置**:
   - `config.js` 会自动检测环境
   - 生产环境需要修改 `CONFIG.production.apiBaseUrl`

## 📝 下一步建议

### 短期优化
- [ ] 添加数据验证和错误处理
- [ ] 添加搜索接口 `/api/search?q=xxx`
- [ ] 添加 API 文档 (Swagger UI)
- [ ] 实现数据热重载（监听 JSON 文件变化）

### 中期改进
- [ ] 接入 MongoDB 数据库
- [ ] 添加管理后台
- [ ] 实现数据缓存（Redis）
- [ ] 添加图片上传功能

### 长期规划
- [ ] 用户认证系统
- [ ] 商家自主管理
- [ ] 评论和评分系统
- [ ] 数据分析和统计

## 🔍 调试技巧

### 查看后端日志
```bash
# 如果使用 nohup 启动
tail -f /tmp/fastapi.log

# 如果使用 --reload 启动
# 日志会直接输出到终端
```

### 查看后端进程
```bash
# 查看是否在运行
ps aux | grep uvicorn

# 查看端口占用
lsof -i:8000
```

### 前端调试
- 打开浏览器开发者工具 (F12)
- 查看 Console 标签页的日志
- 查看 Network 标签页的请求详情
- 检查是否有 CORS 错误

## ✅ 验证清单

- [x] 后端成功启动
- [x] `/ping` 接口返回正常
- [x] `/api/shops` 返回所有商家数据
- [x] `/api/shops/{id}` 返回单个商家
- [x] `/api/shops/category/{category}` 按分类筛选
- [x] 前端 `loadShops()` 能从 API 获取数据
- [x] 配置文件能自动检测环境
- [x] 降级机制正常工作（API 失败时使用本地 JSON）
- [ ] 测试页面所有功能正常
- [ ] 首页能正常显示商家
- [ ] 分类页能正常显示商家
- [ ] 详情页能正常显示商家信息
- [ ] 搜索功能正常工作
