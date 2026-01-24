# OpenAI API Key 配置指南

## 快速开始

1. **获取 OpenAI API Key**
   - 访问 https://platform.openai.com/api-keys
   - 登录你的 OpenAI 账户
   - 点击 "Create new secret key" 创建新的 API Key
   - 复制生成的 API Key（只显示一次，请妥善保存）

2. **配置 API Key**
   - 打开项目根目录的 `.env.local` 文件
   - 将 `YOUR_API_KEY_HERE` 替换为你刚才复制的 API Key
   - 保存文件

3. **重启开发服务器**
   - 停止当前运行的服务器（Ctrl+C）
   - 重新运行 `npm run dev`
   - 环境变量会在服务器启动时加载

## 示例配置

`.env.local` 文件内容应该类似：

```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 注意事项

- `.env.local` 文件不会被提交到 Git（已在 .gitignore 中配置）
- 不要将 API Key 分享给他人或提交到代码仓库
- 如果 API Key 泄露，请立即在 OpenAI 平台撤销并重新生成

## 故障排除

如果仍然遇到错误：

1. 确认 `.env.local` 文件在项目根目录
2. 确认 API Key 格式正确（以 `sk-` 开头）
3. 确认已重启开发服务器
4. 检查浏览器控制台和终端是否有详细错误信息
