# API 配置指南

## 问题诊断

当前错误：无法连接到 `api.openai.com`（连接超时）

## 解决方案

### 方案 1：使用内网 API（推荐）

如果你的网络环境无法访问 OpenAI API，可以使用美团 AIGC API：

在 `.env.local` 文件中配置：

```bash
# 使用美团 AIGC API
AIGC_API_URL=https://aigc.sankuai.com/v1/openai/native
OPENAI_API_KEY=你的美团AIGC_API密钥
AIGC_MODEL=gpt-5.1
```

### 方案 2：配置代理访问 OpenAI API

如果你有代理服务器，可以在 `.env.local` 中配置：

```bash
# OpenAI API 配置
OPENAI_API_KEY=你的OpenAI_API密钥

# 代理配置（如果需要）
HTTP_PROXY=http://代理地址:端口
HTTPS_PROXY=http://代理地址:端口
```

### 方案 3：使用 VPN

确保你的网络可以访问 `api.openai.com`，可能需要：
- 配置 VPN
- 检查防火墙设置
- 联系网络管理员

## 当前配置

检查你的 `.env.local` 文件，确认：
1. API Key 格式正确
2. 如果使用 OpenAI API，确保网络可以访问
3. 如果无法访问，切换到内网 API

## 重启服务器

修改 `.env.local` 后，需要重启开发服务器：
```bash
# 停止服务器（Ctrl+C）
# 然后重新运行
npm run dev
```
