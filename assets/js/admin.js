// 商家管理系统 - JavaScript

let shops = [];
let uploadedImages = [];
let editingShopId = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadShops();
    initImageUpload();
    initSearch();
    
    // 绑定表单提交
    document.getElementById('shopForm').addEventListener('submit', handleSubmit);
});

// 加载商家数据
async function loadShops() {
    try {
        const response = await fetch('data/shops.json');
        shops = await response.json();
        renderShopList();
        updateStatistics();
    } catch (error) {
        console.error('加载数据失败:', error);
        shops = [];
    }
}

// 标签切换
function switchTab(tabName) {
    // 移除所有 active 类
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 添加 active 类到当前标签
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // 如果切换到管理标签，刷新列表
    if (tabName === 'manage') {
        renderShopList();
    } else if (tabName === 'export') {
        updateStatistics();
    }
}

// 初始化图片上传功能
function initImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // 点击上传区域
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        processFiles(files);
    });
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
}

// 处理上传的文件
function processFiles(files) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showMessage('请只上传图片文件！', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                name: file.name,
                data: e.target.result
            };
            uploadedImages.push(imageData);
            renderImagePreview();
        };
        reader.readAsDataURL(file);
    });
}

// 渲染图片预览
function renderImagePreview() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    uploadedImages.forEach((image, index) => {
        const div = document.createElement('div');
        div.className = 'image-preview-item';
        div.innerHTML = `
            <img src="${image.data}" alt="预览">
            <button type="button" class="remove-btn" onclick="removeImage(${index})">×</button>
        `;
        preview.appendChild(div);
    });
}

// 移除图片
function removeImage(index) {
    uploadedImages.splice(index, 1);
    renderImagePreview();
}

// 表单提交处理
function handleSubmit(e) {
    e.preventDefault();
    
    const category = document.getElementById('category').value;
    const type = document.getElementById('type').value;
    const name = document.getElementById('name').value;
    
    if (!category || !type || !name) {
        showMessage('请填写必填项（标记*的字段）', 'error');
        return;
    }
    
    // 生成商家ID
    const categoryPrefix = {
        'food': 'chef',
        'entertainment': 'ent',
        'service': 'srv'
    };
    
    const prefix = categoryPrefix[category];
    const existingIds = shops
        .filter(s => s.id.startsWith(prefix))
        .map(s => parseInt(s.id.split('_')[1]))
        .filter(n => !isNaN(n));
    
    const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const shopId = editingShopId || `${prefix}_${String(nextNumber).padStart(3, '0')}`;
    
    // 处理图片文件名
    const imageFiles = uploadedImages.map((img, index) => {
        const ext = img.name.split('.').pop();
        return `${String(nextNumber).padStart(3, '0')}-${index + 1}.${ext}`;
    });
    
    // 创建商家对象
    const shop = {
        id: shopId,
        category: category,
        type: type,
        name: name,
        address: document.getElementById('address').value,
        contact: {
            wechat: document.getElementById('wechat').value,
            phone: document.getElementById('phone').value
        },
        description: document.getElementById('description').value,
        services: document.getElementById('services').value,
        open_time: document.getElementById('openTime').value,
        images: imageFiles,
        tags: document.getElementById('tags').value,
        last_update: new Date().toISOString().split('T')[0].replace(/-/g, '/')
    };
    
    // 添加或更新商家
    if (editingShopId) {
        const index = shops.findIndex(s => s.id === editingShopId);
        if (index !== -1) {
            shops[index] = shop;
            showMessage('商家信息更新成功！', 'success');
        }
        editingShopId = null;
    } else {
        shops.push(shop);
        showMessage('商家添加成功！', 'success');
    }
    
    // 重置表单
    document.getElementById('shopForm').reset();
    uploadedImages = [];
    renderImagePreview();
    
    // 提示用户保存
    showMessage('✅ 商家信息已保存！别忘了点击"导出数据"标签下载最新的 shops.json 文件', 'success');
    
    // 自动滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 渲染商家列表
function renderShopList() {
    const listContainer = document.getElementById('shopList');
    
    if (shops.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="icon">📦</div>
                <p>还没有商家信息</p>
                <p class="help-text">点击"添加商家"标签开始添加</p>
            </div>
        `;
        return;
    }
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredShops = shops.filter(shop => 
        shop.name.toLowerCase().includes(searchTerm) ||
        shop.type.toLowerCase().includes(searchTerm) ||
        shop.tags.toLowerCase().includes(searchTerm)
    );
    
    listContainer.innerHTML = filteredShops.map(shop => {
        const categoryBadge = {
            'food': '<span class="badge badge-food">美食</span>',
            'entertainment': '<span class="badge badge-entertainment">娱乐</span>',
            'service': '<span class="badge badge-service">服务</span>'
        };
        
        const imageSrc = shop.images && shop.images.length > 0 
            ? `assets/images/${shop.id.split('_')[1]}/${shop.images[0]}`
            : 'assets/images/placeholder.jpg';
        
        return `
            <div class="shop-card">
                <img src="${imageSrc}" alt="${shop.name}" class="shop-card-image" 
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect fill=\'%23f0f0f0\' width=\'100\' height=\'100\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\' font-size=\'14\'%3E暂无图片%3C/text%3E%3C/svg%3E'">
                <div class="shop-card-info">
                    <h3>${shop.name}</h3>
                    <p>${categoryBadge[shop.category]} ${shop.type}</p>
                    <p>📍 ${shop.address || '暂无地址'}</p>
                    <p>🏷️ ${shop.tags || '暂无标签'}</p>
                    <p style="font-size: 12px; color: #999;">更新：${shop.last_update}</p>
                </div>
                <div class="shop-card-actions">
                    <button class="btn btn-small btn-edit" onclick="editShop('${shop.id}')">✏️ 编辑</button>
                    <button class="btn btn-small btn-delete" onclick="deleteShop('${shop.id}')">🗑️ 删除</button>
                </div>
            </div>
        `;
    }).join('');
}

// 初始化搜索
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', renderShopList);
}

// 编辑商家
function editShop(shopId) {
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;
    
    // 切换到添加标签
    switchTab('add');
    document.querySelector('.tab').click();
    
    // 填充表单
    document.getElementById('category').value = shop.category;
    document.getElementById('type').value = shop.type;
    document.getElementById('name').value = shop.name;
    document.getElementById('address').value = shop.address;
    document.getElementById('wechat').value = shop.contact.wechat;
    document.getElementById('phone').value = shop.contact.phone;
    document.getElementById('description').value = shop.description;
    document.getElementById('services').value = shop.services;
    document.getElementById('openTime').value = shop.open_time;
    document.getElementById('tags').value = shop.tags;
    
    editingShopId = shopId;
    
    showMessage('正在编辑商家信息，修改后点击保存', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 删除商家
function deleteShop(shopId) {
    if (!confirm('确定要删除这个商家吗？此操作不可恢复！')) {
        return;
    }
    
    const index = shops.findIndex(s => s.id === shopId);
    if (index !== -1) {
        const shopName = shops[index].name;
        shops.splice(index, 1);
        renderShopList();
        showMessage(`已删除商家：${shopName}`, 'success');
    }
}

// 导出数据
function exportData() {
    const dataStr = JSON.stringify(shops, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shops.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showMessage('数据已导出！请将 shops.json 文件替换到 data/ 目录', 'success');
}

// 更新统计信息
function updateStatistics() {
    document.getElementById('totalShops').textContent = shops.length;
    document.getElementById('foodCount').textContent = shops.filter(s => s.category === 'food').length;
    document.getElementById('entertainmentCount').textContent = shops.filter(s => s.category === 'entertainment').length;
    document.getElementById('serviceCount').textContent = shops.filter(s => s.category === 'service').length;
}

// 显示消息
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type} show`;
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 5000);
}
