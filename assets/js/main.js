// assets/js/main.js

// 数据文件路径（本地 fallback）
const DATA_URL = 'data/shops.json';

// 娱乐页额外要包含的 type（之后可以自己往里加）
const ENTERTAINMENT_EXTRA_TYPES = ['KTV'];

// 全局数据缓存
let cachedShopsData = null;

/**
 * 读取全部商家数据
 * 优先从 Google Sheet 读取，失败则从本地 JSON 读取
 */
async function loadShops() {
  // 如果数据已缓存，直接返回
  if (cachedShopsData !== null) {
    return cachedShopsData;
  }

  try {
    // 尝试从 Google Sheet 加载
    let data = await loadShopsFromGoogleSheet();
    
    if (!data || data.length === 0) {
      // fallback 到本地 JSON
      // const res = await fetch(DATA_URL);
      // if (!res.ok) {
      //   throw new Error('加载数据失败：' + res.status);
      // }
      // data = await res.json();
      console.warn('Google Sheet 和本地 JSON 都无法加载数据');
      data = [];
    }

    cachedShopsData = Array.isArray(data) ? data : [];
    return cachedShopsData;
  } catch (err) {
    console.error('加载商家数据出错:', err);
    // 最终 fallback：从本地 JSON 加载
    // try {
    //   const res = await fetch(DATA_URL);
    //   if (res.ok) {
    //     const data = await res.json();
    //     cachedShopsData = Array.isArray(data) ? data : [];
    //     return cachedShopsData;
    //   }
    // } catch (fallbackErr) {
    //   console.error('本地 JSON 加载也失败:', fallbackErr);
    // }
    return [];
  }
}

// 从数组中随机抽取 count 个元素（不重复）
// 如果数量不够，就全给你
function pickRandomItems(list, count) {
  const arr = [...list];
  // 简单洗牌
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}

/**
 * 工具：生成详情页链接
 */
function buildDetailUrl(id) {
  return `details.html?id=${encodeURIComponent(id)}`;
}

/**
 * 工具：解析 tags
 */
function parseTags(tagsStr) {
  if (!tagsStr) return [];
  return tagsStr
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

/**
 * 工具：解析 images
 * 例如 "chef_001-1.jpg, chef_001-2.jpg"
 */
function parseImages(imagesStr) {
  if (!imagesStr) return [];
  return imagesStr
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * 生成列表里的卡片 HTML
 */
function createCard(shop) {
  const tags = parseTags(shop.tags);

  return `
    <div class="card">
      <div>
        <div class="card-title">${shop.name || ''}</div>
        <div class="card-type">
          ${shop.category ? `<span class="badge">${shop.category}</span>` : ''}
          ${shop.type || ''}
        </div>

        ${
          shop.description
            ? `<div class="card-desc">${shop.description}</div>`
            : ''
        }

        ${
          tags.length
            ? `<div class="card-tags">标签：${tags.join(' / ')}</div>`
            : ''
        }

        ${
          shop.open_time
            ? `<div class="card-meta">营业时间：${shop.open_time}</div>`
            : ''
        }
      </div>

      <a class="detail-link" href="${buildDetailUrl(shop.id)}">查看详情 →</a>
    </div>
  `;
}

/**
 * 首页初始化：
 * - 食品推荐
 * - 娱乐推荐
 * - 服务推荐（如果首页有这个区块）
 */
// 首页初始化：随机推荐
async function initHomePage() {
  const foodEl = document.getElementById('food-list-home');
  const entEl = document.getElementById('ent-list-home');
  const svcEl  = document.getElementById('service-list-home');

  // 如果不是首页，直接返回
  if (!foodEl && !entEl && !svcEl) return;

  const data = await loadShops();

  // 先按类别拆出来
  const allFoods = data.filter(i => i.category === 'food');
  const allEnts = data.filter(
    i => i.category === 'entertainment' || ENTERTAINMENT_EXTRA_TYPES.includes(i.type)
  );
  const allServices = data.filter(i => i.category === 'service');

  // 再随机抽取要展示的数量
  const foods = pickRandomItems(allFoods, 4);      // 首页餐饮显示最多 4 家
  const ents = pickRandomItems(allEnts, 4);        // 娱乐最多 4 家
  const services = pickRandomItems(allServices, 4);// 服务最多 4 家

  if (foodEl) {
    foodEl.innerHTML = foods.length
      ? foods.map(createCard).join('')
      : '<p>暂未收录餐饮信息。</p>';
  }

  if (entEl) {
    entEl.innerHTML = ents.length
      ? ents.map(createCard).join('')
      : '<p>暂未收录娱乐信息。</p>';
  }

  if (svcEl) {
    svcEl.innerHTML = services.length
      ? services.map(createCard).join('')
      : '<p>暂未收录服务信息。</p>';
  }
}


/**
 * 分类列表页初始化
 * targetCategory: 'food' | 'entertainment' | 'service' 等
 */
async function initCategoryPage(targetCategory) {
  const listEl = document.getElementById('category-list');
  const searchInput = document.getElementById('search-input');

  if (!listEl) return;

  const data = await loadShops();

  // 可扩展分类逻辑
  let current = data.filter(item => {
    if (targetCategory === 'entertainment') {
      // 娱乐页：category = entertainment
      // 或者 type 属于 ENTERTAINMENT_EXTRA_TYPES（比如 KTV）
      return (
        item.category === 'entertainment' ||
        ENTERTAINMENT_EXTRA_TYPES.includes(item.type)
      );
    }

    // 其他页：直接按 category 匹配
    return item.category === targetCategory;
  });

  function render(filterText = '') {
    const q = filterText.trim().toLowerCase();

    const filtered = current.filter(item => {
      if (!q) return true;
      const haystack = [
        item.name || '',
        item.type || '',
        item.tags || '',
        item.description || ''
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    listEl.innerHTML = filtered.length
      ? filtered.map(createCard).join('')
      : '<p>没有找到符合条件的结果。</p>';
  }

  // 初次渲染
  render();

  // 搜索
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      render(searchInput.value);
    });
  }
}

/**
 * 详情页初始化
 * 支持：
 * - wechat / phone
 * - 多张图片
 * - 菜单图片或 PDF
 *
 * 需要在 shops.json 里可选新增字段：
 * - "menu": "chef_001-menu.jpg" 或 "chef_001-menu.pdf"
 */
async function initDetailsPage() {
  const container = document.getElementById('detail-container');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    container.innerHTML = '<p>无效的商家 ID。</p>';
    return;
  }

  const data = await loadShops();
  const shop = data.find(item => item.id === id);
  if (!shop) {
    container.innerHTML = '<p>未找到对应商家。</p>';
    return;
  }

  const tags = parseTags(shop.tags);
  const images = parseImages(shop.images);
  const menu = shop.menu || '';

  let imagesHtml = '';
  if (images.length) {
    // 根据 shop.id 和图片名拼接路径，去掉原有扩展并统一使用 .jpg
    const shortId = (shop.id || '').split('_').pop();
    const imgs = images
      .map(imgName => {
        const base = imgName.replace(/\.[^/.]+$/, '');
        return `<img src="assets/images/${shortId}/${base}.jpg" alt="${shop.name}" style="width:140px;height:auto;border-radius:8px;border:1px solid #eee;">`;
      })
      .join('');

    imagesHtml = `
      <div class="detail-row">
        <span class="detail-label">图片：</span>
      </div>
      <div class="detail-row" style="display:flex;flex-wrap:wrap;gap:8px;">
        ${imgs}
      </div>
    `;
  }

  let menuHtml = '';
  if (menu) {
    const isImage =
      menu.endsWith('.jpg') ||
      menu.endsWith('.jpeg') ||
      menu.endsWith('.png') ||
      menu.endsWith('.webp');

    if (isImage) {
      menuHtml = `
        <div class="detail-row">
          <span class="detail-label">菜单：</span>
        </div>
        <div class="detail-row">
          <img src="assets/menus/${menu}" alt="${shop.name} 菜单" style="max-width:100%;height:auto;border-radius:8px;border:1px solid #eee;">
        </div>
      `;
    } else {
      menuHtml = `
        <div class="detail-row">
          <span class="detail-label">菜单：</span>
          <a href="assets/menus/${menu}" target="_blank" style="color:#ff4b4b;">点击查看菜单</a>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <div class="detail-wrapper">
      <div class="detail-name">${shop.name || ''}</div>
      <div class="detail-type">
        ${shop.category ? `<span class="badge">${shop.category}</span>` : ''}
        ${shop.type || ''}
      </div>

      ${
        shop.description
          ? `
        <div class="detail-row">
          <span class="detail-label">简介：</span>${shop.description}
        </div>`
          : ''
      }

      ${
        shop.address
          ? `
        <div class="detail-row">
          <span class="detail-label">地址：</span>${shop.address}
        </div>`
          : ''
      }

      ${
        shop.open_time
          ? `
        <div class="detail-row">
          <span class="detail-label">营业时间：</span>${shop.open_time}
        </div>`
          : ''
      }

      ${
        shop.services
          ? `
        <div class="detail-row">
          <span class="detail-label">服务：</span>${shop.services}
        </div>`
          : ''
      }

      ${
        shop.contact_wechat || shop.contact_phone
          ? `
        <div class="detail-row">
          <span class="detail-label">联系方式：</span>
          ${shop.contact_wechat ? `微信：${shop.contact_wechat} ` : ''}
          ${shop.contact_phone ? `电话：${shop.contact_phone}` : ''}
        </div>`
          : ''
      }

      ${
        tags.length
          ? `
        <div class="detail-row">
          <span class="detail-label">标签：</span>${tags.join(' / ')}
        </div>`
          : ''
      }

      ${imagesHtml}
      ${menuHtml}

      ${
        shop.last_update
          ? `
        <div class="detail-row" style="color:#999;font-size:12px;">
          最后更新：${shop.last_update}
        </div>`
          : ''
      }
    </div>
  `;
}

// 顶部轮播图初始化
function initHeroCarousel() {
  const carousel = document.getElementById('hero-carousel');
  const dotsContainer = document.getElementById('hero-dots');
  const captionEl = document.getElementById('hero-caption');
  if (!carousel || !dotsContainer) return;

  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  if (slides.length <= 1) return; // 只有一张图就没必要轮播了

  let current = 0;
  let timer = null;
  const interval = 5000; // 5 秒切一张

  // 创建小圆点
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (index === 0 ? ' active' : '');
    dot.dataset.index = String(index);
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.hero-dot'));

  function updateCaption(index) {
    if (!captionEl) return;
    const slide = slides[index];
    const title = slide.dataset.title || '';
    const desc = slide.dataset.desc || '';
    const h2 = captionEl.querySelector('h2');
    const p = captionEl.querySelector('p');
    if (h2) h2.textContent = title;
    if (p) p.textContent = desc;
  }

  function goTo(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    const realIndex = (index + slides.length) % slides.length;
    slides[realIndex].classList.add('active');
    dots[realIndex].classList.add('active');
    current = realIndex;

    // 更新下方文字
    updateCaption(realIndex);
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(() => {
      goTo(current + 1);
    }, interval);
  }

  function stopAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // 点击小圆点切换
  dotsContainer.addEventListener('click', e => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains('hero-dot')) return;
    const index = Number(target.dataset.index || 0);
    goTo(index);
    startAuto();
  });

  // 鼠标移入暂停（电脑端用）
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  // 初始化
  goTo(0);
  startAuto();
}

// 全站搜索页面初始化
function initSearchPage() {
  const input = document.getElementById('search-input');
  const button = document.getElementById('search-btn');
  const listEl = document.getElementById('search-results');
  if (!input || !listEl) return;

  let allData = [];

  function render(filterText = '') {
    const q = filterText.trim().toLowerCase();

    if (!q) {
      listEl.innerHTML = '<p>请输入关键字开始搜索。</p>';
      return;
    }

    const results = allData.filter(item => {
      const haystack = [
        item.name || '',
        item.type || '',
        item.category || '',
        item.tags || '',
        item.description || ''
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });

    listEl.innerHTML = results.length
      ? results.map(createCard).join('')
      : '<p>没有找到匹配的结果，可以尝试换个关键词。</p>';
  }

  // 从 URL 里拿 ?q=xxx 预填（以后如果你想从别的页面带查询词过来用）
  const params = new URLSearchParams(window.location.search);
  const initialQ = params.get('q') || '';
  input.value = initialQ;

  loadShops().then(data => {
    allData = data;
    if (initialQ) {
      render(initialQ);
    } else {
      listEl.innerHTML = '<p>请输入关键字开始搜索。</p>';
    }
  });

  // 点击按钮搜索
  if (button) {
    button.addEventListener('click', () => {
      render(input.value);
    });
  }

  // 输入实时搜索（可选，如果你想只有点按钮才搜索就把这一段删掉）
  input.addEventListener('input', () => {
    render(input.value);
  });

  // 回车键搜索
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      render(input.value);
    }
  });

  // 页面加载时自动聚焦
  input.focus();
  input.select();
}

// 全局快捷键：在任意页面按 "/" 或 Ctrl/⌘+K 打开搜索页
function initGlobalSearchShortcut() {
  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';

    // 在输入框/文本区域里打字时，不触发
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    // "/" 打开搜索页
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      window.location.href = 'search.html';
      return;
    }

    // Ctrl/⌘ + K 打开搜索页
    if (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.location.href = 'search.html';
      return;
    }
  });
}

/**
 * 初始化懒加载功能
 */
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img.lazy-load');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy-load');
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for older browsers
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazy-load');
    });
  }
}
