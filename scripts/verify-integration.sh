#!/bin/bash

# 后端与前端集成验证脚本

echo "================================"
echo "🔍 利兹留学生网 - 集成验证测试"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
PASS=0
FAIL=0

# 测试函数
test_api() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "测试: $name ... "
    response=$(curl -s "$url" 2>&1)
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✓ 通过${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗ 失败${NC}"
        echo "  响应: $response"
        ((FAIL++))
        return 1
    fi
}

echo "1️⃣  检查后端服务"
echo "--------------------------------"

# 检查后端是否运行
if curl -s http://localhost:8000/ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 后端服务运行正常${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ 后端服务未启动${NC}"
    echo "请运行: uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    ((FAIL++))
    exit 1
fi

echo ""
echo "2️⃣  测试 API 接口"
echo "--------------------------------"

test_api "Ping 接口" "http://localhost:8000/ping" "pong"
test_api "获取所有商家" "http://localhost:8000/api/shops" "chef_001"
test_api "获取单个商家" "http://localhost:8000/api/shops/chef_001" "一日三餐"
test_api "按分类查询" "http://localhost:8000/api/shops/category/food" "chef_"

echo ""
echo "3️⃣  检查前端文件"
echo "--------------------------------"

# 检查关键文件
files_to_check=(
    "index.html"
    "food.html"
    "entertainment.html"
    "service.html"
    "search.html"
    "details.html"
    "assets/js/config.js"
    "assets/js/main.js"
    "data/shops.json"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $file 不存在"
        ((FAIL++))
    fi
done

echo ""
echo "4️⃣  检查 config.js 引用"
echo "--------------------------------"

html_files=("index.html" "food.html" "entertainment.html" "service.html" "search.html" "details.html")

for file in "${html_files[@]}"; do
    if grep -q "config.js" "$file"; then
        echo -e "${GREEN}✓${NC} $file 已引用 config.js"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $file 未引用 config.js"
        ((FAIL++))
    fi
done

echo ""
echo "5️⃣  检查前端服务"
echo "--------------------------------"

if curl -s http://localhost:5500/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 前端服务运行正常 (http://localhost:5500)${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠ 前端服务未启动${NC}"
    echo "  可以运行: python3 -m http.server 5500"
fi

echo ""
echo "================================"
echo "📊 测试结果汇总"
echo "================================"
echo -e "通过: ${GREEN}$PASS${NC}"
echo -e "失败: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！后端集成完成！${NC}"
    echo ""
    echo "📝 下一步建议:"
    echo "  1. 在浏览器打开 http://localhost:5500/ 测试首页"
    echo "  2. 打开浏览器开发者工具查看 Network 和 Console"
    echo "  3. 访问 http://localhost:5500/test-api.html 进行详细测试"
    echo "  4. 测试各个分类页面和详情页"
    exit 0
else
    echo -e "${RED}❌ 有 $FAIL 个测试失败，请检查上述问题${NC}"
    exit 1
fi
