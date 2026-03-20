#!/bin/bash

# PhotoMagic Studio GitHub上传脚本
echo "=== PhotoMagic Studio GitHub上传助手 ==="
echo ""

# 检查是否在正确的目录
if [ ! -d "photomagic" ]; then
    echo "错误: 未找到photomagic目录"
    echo "请确保在包含photomagic文件夹的目录中运行此脚本"
    exit 1
fi

echo "1. 检查Git安装..."
if ! command -v git &> /dev/null; then
    echo "错误: Git未安装。请先安装Git。"
    exit 1
fi
echo "✓ Git已安装"

echo ""
echo "2. 克隆GitHub仓库..."
if [ -d "PhotoMagic-Studio-Project" ]; then
    echo "检测到已存在的仓库目录，跳过克隆"
else
    git clone https://github.com/Xk455323041/PhotoMagic-Studio-Project.git
    if [ $? -ne 0 ]; then
        echo "错误: 克隆仓库失败"
        echo "请确保:"
        echo "  1. 仓库地址正确: https://github.com/Xk455323041/PhotoMagic-Studio-Project.git"
        echo "  2. 您有访问权限"
        echo "  3. 网络连接正常"
        exit 1
    fi
fi

echo ""
echo "3. 复制项目文件..."
cp -r photomagic/ PhotoMagic-Studio-Project/
cp .gitignore PhotoMagic-Studio-Project/

echo ""
echo "4. 进入仓库目录..."
cd PhotoMagic-Studio-Project

echo ""
echo "5. 检查文件..."
echo "项目包含以下主要文件:"
find photomagic -type f -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.md" | head -10
echo "..."
echo "总共文件数: $(find photomagic -type f | wc -l)"

echo ""
echo "6. 配置Git..."
git config user.name "PhotoMagic Studio"
git config user.email "photomagic@example.com"

echo ""
echo "7. 添加文件到Git..."
git add .

echo ""
echo "8. 提交更改..."
git commit -m "Initial commit: Complete PhotoMagic Studio UI design system

- Complete design system (colors, typography, spacing)
- Full component library with examples
- 4 core feature pages:
  * Background removal page with JavaScript interactions
  * ID photo creation page
  * Background replacement page
  * Photo restoration page
- Responsive design examples (desktop, tablet, mobile)
- Project documentation and roadmap
- Technical architecture design
- Frontend package.json configuration"

echo ""
echo "9. 推送到GitHub..."
echo "注意: 这可能需要GitHub认证"
echo ""
echo "请选择推送方式:"
echo "1) 使用HTTPS (需要用户名/密码或访问令牌)"
echo "2) 使用SSH (需要配置SSH密钥)"
echo "3) 跳过推送，手动完成"
echo ""
read -p "请选择 (1/2/3): " push_choice

case $push_choice in
    1)
        echo "使用HTTPS推送..."
        git push origin main || git push origin master
        ;;
    2)
        echo "使用SSH推送..."
        git remote set-url origin git@github.com:Xk455323041/PhotoMagic-Studio-Project.git
        git push origin main || git push origin master
        ;;
    3)
        echo "跳过推送。"
        echo "您可以稍后手动运行:"
        echo "  cd PhotoMagic-Studio-Project"
        echo "  git push origin main"
        ;;
    *)
        echo "无效选择，跳过推送"
        ;;
esac

echo ""
echo "=== 完成 ==="
echo ""
echo "项目已准备就绪！"
echo "仓库位置: $(pwd)"
echo ""
echo "下一步建议:"
echo "1. 访问 https://github.com/Xk455323041/PhotoMagic-Studio-Project 查看仓库"
echo "2. 打开 photomagic/ui-design/components-library.html 预览UI组件"
echo "3. 开始前端开发: 初始化React项目"
echo ""
echo "项目状态:"
echo "  UI设计: ✅ 100% 完成"
echo "  前端开发: ⏳ 0% 待开始"
echo "  后端开发: ⏳ 0% 待开始"