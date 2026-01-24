# 代理配置指南（如果需要访问 OpenAI API）

## 如果无法直接访问 OpenAI API

如果你的网络环境无法直接访问 `api.openai.com`，可以配置代理：

### 方法 1：在 .env.local 中配置代理环境变量

在 `.env.local` 文件中添加：

```bash
# OpenAI API 配置
OPENAI_API_KEY=你的OpenAI_API密钥

# 代理配置（如果需要）
HTTP_PROXY=http://代理地址:端口
HTTPS_PROXY=http://代理地址:端口

# 或者使用 socks5 代理
HTTP_PROXY=socks5://代理地址:端口
HTTPS_PROXY=socks5://代理地址:端口
```

### 方法 2：在系统环境变量中配置

在启动服务器前设置：

```bash
export HTTP_PROXY=http://代理地址:端口
export HTTPS_PROXY=http://代理地址:端口
npm run dev
```

### 方法 3：使用 VPN

确保你的网络可以访问 `api.openai.com`

## 测试连接

修改配置后，重启服务器并测试 API 调用。

## 注意事项

- OpenAI SDK 会自动使用环境变量中的代理设置
- 确保代理服务器可以访问 `api.openai.com`
- 如果使用企业代理，可能需要配置认证信息
