/**
 * Google Sheet 数据加载器
 * 从 Google Sheet 公开分享的 CSV 中加载数据并转换为 JSON
 */

// Google Sheet 配置 - 替换为你的实际 Sheet ID 和 tab ID
const GOOGLE_SHEET_CONFIG = {
  // 你的 Sheet ID（从分享链接中提取）
  spreadsheetId: '1pxvB5gZaDDA3Qst5kdHpxf3aZFMy_hwCAL0-aiRg5XQ',
  // 如果有多个 Sheet，可以指定 gid（默认 0 是第一个 Sheet）
  tabId: 0,
  // 使用本地 fallback 数据（当 Google Sheet 加载失败时）
  useFallback: true,
  fallbackUrl: 'data/shops.json'
};

/**
 * 解析 CSV 数据为对象数组
 * @param {string} csvText - CSV 文本
 * @returns {array} 对象数组
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // 第一行是列标题
  const headers = parseCSVLine(lines[0]);
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index] ? values[index].trim() : '';
    });
    // 只有在至少有一个非空字段时才添加对象
    if (Object.values(obj).some(v => v !== '')) {
      data.push(obj);
    }
  }

  return data;
}

/**
 * 解析 CSV 行，处理带引号的字段
 * @param {string} line - CSV 行
 * @returns {array} 字段数组
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * 从 CSV 数据转换为原始店铺数据格式
 * 假设 CSV 列为：id, category, type, name, address, contact_wechat, contact_phone, description, services, open_time, images, tags, last_update
 */
function convertCSVToShopsFormat(csvData) {
  return csvData.map(row => ({
    id: row.id || '',
    category: row.category || '',
    type: row.type || '',
    name: row.name || '',
    address: row.address || '',
    contact: {
      wechat: row.contact_wechat || '',
      phone: row.contact_phone || ''
    },
    description: row.description || '',
    services: row.services || '',
    open_time: row.open_time || '',
    images: row.images ? row.images.split(',').map(s => s.trim()).filter(Boolean) : [],
    tags: row.tags || '',
    last_update: row.last_update || ''
  }));
}

/**
 * 从 Google Sheet 加载数据
 */
async function loadFromGoogleSheet() {
  try {
    const { spreadsheetId, tabId } = GOOGLE_SHEET_CONFIG;
    // 构建 CSV 导出 URL
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${tabId}`;

    console.log('正在从 Google Sheet 加载数据...');
    const response = await fetch(csvUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const csvText = await response.text();
    const csvData = parseCSV(csvText);
    const shopsData = convertCSVToShopsFormat(csvData);

    console.log(`成功从 Google Sheet 加载 ${shopsData.length} 条数据`);
    return shopsData;
  } catch (err) {
    console.error('从 Google Sheet 加载数据失败:', err);
    return null;
  }
}

/**
 * 从本地 JSON 加载 fallback 数据
 */
async function loadFromLocalJSON() {
  try {
    const response = await fetch(GOOGLE_SHEET_CONFIG.fallbackUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log('使用本地 JSON fallback 数据');
    return data;
  } catch (err) {
    console.error('从本地 JSON 加载数据失败:', err);
    return [];
  }
}

/**
 * 加载商家数据 - 先尝试 Google Sheet，失败则使用本地 JSON
 */
async function loadShopsFromGoogleSheet() {
  let data = await loadFromGoogleSheet();

  // 如果 Google Sheet 加载失败，使用本地 fallback
  if (!data || data.length === 0) {
    if (GOOGLE_SHEET_CONFIG.useFallback) {
      data = await loadFromLocalJSON();
    } else {
      data = [];
    }
  }

  return data;
}
