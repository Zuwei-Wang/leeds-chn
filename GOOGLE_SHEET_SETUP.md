# Google Sheet 数据集成指南

## 概述
网站现已支持从 Google Sheet 读取商家数据，无需手动修改 JSON 文件。

## 设置步骤

### 1. 创建 Google Sheet
- 访问 [Google Sheets](https://sheets.google.com)
- 创建新的 Sheet，设置以下列标题（必须完全匹配）：

```
id | category | type | name | address | wechat | phone | description | services | open_time | images | tags | last_update
```

### 2. 填充数据
在每一行添加你的商家信息。例如：

| id | category | type | name | address | wechat | phone | description | services | open_time | images | tags | last_update |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| chef_001 | food | 私厨 | 一日三餐 | | | | 家常菜 | | 12pm-2.30am | chef_001-1.jpg | 家常菜 | 2025/11/19 |

### 3. 共享 Sheet
- 点击右上角的"分享"
- 选择"更改"并设置为"任何有链接的人都可以查看"
- 复制分享链接

### 4. 获取 Sheet ID
从分享链接中提取 `spreadsheetId`：
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit?usp=sharing
```

### 5. 更新配置
编辑 `assets/js/google-sheet-loader.js` 中的配置：

```javascript
const GOOGLE_SHEET_CONFIG = {
  spreadsheetId: 'YOUR_SHEET_ID_HERE',  // 替换为你的 Sheet ID
  tabId: 0,  // 第一个 Sheet（0），如有多个 Sheet 则按顺序 0, 1, 2...
  useFallback: true,  // 启用本地 JSON fallback
  fallbackUrl: 'data/shops.json'
};
```

### 6. 导出为 CSV（获取 Sheet ID）
如果需要确认 Sheet 是否可访问，可以在浏览器中打开以下 URL：
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv&gid={TAB_ID}
```
- 替换 `{SPREADSHEET_ID}` 为你的 Sheet ID
- `{TAB_ID}` 通常为 `0`（第一个 Sheet）

## 列说明

| 列名 | 说明 | 示例 |
|---|---|---|
| id | 唯一标识符，用于详情页 URL | `chef_001` |
| category | 分类：food, entertainment, service | `food` |
| type | 类型 | `私厨`, `派对`, `服务` |
| name | 商家名称 | `一日三餐` |
| address | 地址 | `LS1 6PU` |
| wechat | 微信号 | `thewayfo2eve2` |
| phone | 电话号码 | `+44 7474534239` |
| description | 描述 | `家常菜、小吃、特色菜` |
| services | 服务说明 | `堂食、外卖、配送` |
| open_time | 营业时间 | `12pm-2.30am` |
| images | 图片文件名（逗号分隔） | `chef_001-1.jpg, chef_001-2.jpg` |
| tags | 标签（逗号分隔） | `家常菜, 深夜外卖` |
| last_update | 最后更新日期 | `2025/11/19` |

## 多个 Sheet 的支持
如果 Google Sheet 中有多个 Sheet 标签页：
- 第一个 Sheet（左边）：`tabId: 0`
- 第二个 Sheet：`tabId: 1`
- 以此类推

在 `google-sheet-loader.js` 中修改 `tabId` 即可切换。

## 数据更新
- 修改 Google Sheet 中的数据后，网站会在下次页面刷新时自动加载最新数据
- 数据在浏览器中会被缓存，刷新页面强制加载新数据

## Fallback 机制
- 如果 Google Sheet 加载失败（网络问题、链接错误等），系统会自动使用本地 `data/shops.json`
- 确保始终保持本地 JSON 文件作为备份

## 常见问题

### Q: 数据不更新？
A: 尝试硬刷新浏览器（Ctrl+Shift+R 或 Cmd+Shift+R），清除缓存。

### Q: 导出 URL 显示"Page not found"？
A: 检查 Sheet 是否真的设置为公开共享，且链接是否正确。

### Q: 某些商家不显示？
A: 检查是否填写了 `id`, `category`, `type`, `name` 等必要字段。

## 当前配置
你的 Sheet ID：`2PACX-1vQZQ63MtTpknlpAKrwRuCSaH99XnqQRHYAAoryc6yj_rDJud72Kguv_9cTnhVQbB_OsZo-WfXcNdZnK`

## 下一步
1. 验证你的 Google Sheet 是否可以通过以下 URL 访问（应该显示 CSV）：
   ```
   https://docs.google.com/spreadsheets/d/2PACX-1vQZQ63MtTpknlpAKrwRuCSaH99XnqQRHYAAoryc6yj_rDJud72Kguv_9cTnhVQbB_OsZo-WfXcNdZnK/export?format=csv&gid=0
   ```

2. 如果 URL 能正常访问，网站会自动从 Google Sheet 读取数据
