// API 配置文件
// 根据环境自动切换 API 地址

const CONFIG = {
  // 开发环境：本地后端
  development: {
    apiBaseUrl: 'http://localhost:8000',
  },
  // 生产环境：实际域名（部署后修改）
  production: {
    apiBaseUrl: 'https://lzlxs.co.uk',  // 部署后改为实际后端地址
  }
};

// 自动检测环境
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.port === '5500';  // Live Server 默认端口

const currentConfig = isDevelopment ? CONFIG.development : CONFIG.production;

// 导出配置
window.API_CONFIG = {
  baseUrl: currentConfig.apiBaseUrl,
  endpoints: {
    shops: `${currentConfig.apiBaseUrl}/api/shops`,
    shopById: (id) => `${currentConfig.apiBaseUrl}/api/shops/${encodeURIComponent(id)}`,
    shopsByCategory: (category) => `${currentConfig.apiBaseUrl}/api/shops/category/${category}`,
  },
  // 本地 JSON fallback
  fallback: {
    shops: 'data/shops.json'
  }
};

console.log(`当前环境: ${isDevelopment ? '开发' : '生产'}`, window.API_CONFIG);
