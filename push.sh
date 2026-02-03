#!/bin/bash

# Git 自动推送脚本
# 使用方法：./push.sh

cd "$(dirname "$0")"

echo "正在推送代码到远程仓库..."

# 检查是否有未提交的更改
if [ -n "$(git status -s)" ]; then
    echo "检测到未提交的更改，正在添加..."
    git add -A
    git commit -m "自动提交: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 尝试推送
if git push origin main; then
    echo "✅ 推送成功！"
else
    echo "❌ 推送失败，可能需要认证。"
    echo ""
    echo "请手动执行以下命令之一："
    echo "1. git push (如果已配置认证)"
    echo "2. 或使用 GitHub CLI: gh auth login && git push"
    exit 1
fi
