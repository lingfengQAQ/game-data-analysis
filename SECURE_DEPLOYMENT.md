# 安全部署指南

## 架构说明

为了保护 API 密钥安全，本应用采用**后端代理**架构：

```
用户浏览器 → Node.js 服务器 → DeepSeek API
              (包含 API 密钥)
```

### 安全特性

✅ API 密钥只存在于服务器端  
✅ 前端代码中不包含任何密钥信息  
✅ 用户无法从浏览器中查看密钥  
✅ 密钥通过环境变量配置，不提交到代码仓库  

## 部署步骤

### 1. 在服务器上设置环境变量

```bash
# 方式 1：直接设置环境变量
export DEEPSEEK_API_KEY="sk-your-api-key-here"

# 方式 2：创建 .env 文件
echo "DEEPSEEK_API_KEY=sk-your-api-key-here" > .env
```

### 2. 拉取最新镜像

```bash
docker pull qaqtat/game-data-analysis:latest
```

### 3. 启动服务

```bash
# 使用 docker-compose
docker-compose -f docker-compose.prod.yml up -d

# 或使用 docker run
docker run -d \
  -p 80:3000 \
  -e DEEPSEEK_API_KEY="sk-your-api-key-here" \
  --name game-data-analysis \
  qaqtat/game-data-analysis:latest
```

### 4. 验证部署

```bash
# 检查服务状态
docker ps | grep game-data-analysis

# 检查日志
docker logs game-data-analysis

# 测试健康检查
curl http://localhost/health
```

## API 端点

### 健康检查

```bash
GET /health
```

响应：
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### OCR 代理

```bash
POST /api/ocr
Content-Type: application/json

{
  "model": "deepseek-ai/DeepSeek-OCR",
  "messages": [...],
  "temperature": 0,
  "max_tokens": 2048
}
```

## 故障排查

### 问题：API 密钥未配置

**症状**：识别功能提示"API 密钥未配置"

**解决**：
1. 检查环境变量是否设置：
   ```bash
   docker exec game-data-analysis env | grep DEEPSEEK
   ```

2. 如果未设置，重新启动容器并传入环境变量：
   ```bash
   docker stop game-data-analysis
   docker rm game-data-analysis
   docker run -d -p 80:3000 -e DEEPSEEK_API_KEY="your-key" qaqtat/game-data-analysis:latest
   ```

### 问题：识别失败

**症状**：上传图片后识别失败

**解决**：
1. 检查服务器日志：
   ```bash
   docker logs game-data-analysis
   ```

2. 测试 API 连接：
   ```bash
   curl -X POST http://localhost/api/ocr \
     -H "Content-Type: application/json" \
     -d '{"model":"deepseek-ai/DeepSeek-OCR","messages":[]}'
   ```

3. 检查 API 密钥是否有效

### 问题：端口冲突

**症状**：容器启动失败，提示端口被占用

**解决**：
1. 修改 `docker-compose.prod.yml` 中的端口映射：
   ```yaml
   ports:
     - "8080:3000"  # 改用 8080 端口
   ```

2. 或停止占用 80 端口的服务

## 安全建议

1. **定期更换 API 密钥**
2. **限制服务器访问权限**
3. **使用 HTTPS**（建议配置 Nginx 反向代理）
4. **监控 API 使用量**
5. **设置请求频率限制**

## 更新部署

```bash
# 1. 拉取最新镜像
docker pull qaqtat/game-data-analysis:latest

# 2. 停止并删除旧容器
docker-compose -f docker-compose.prod.yml down

# 3. 启动新容器
docker-compose -f docker-compose.prod.yml up -d

# 4. 验证
curl http://localhost/health
```

## 回滚

如果新版本有问题，可以回滚到之前的版本：

```bash
# 查看可用的镜像标签
docker images qaqtat/game-data-analysis

# 使用特定版本
docker run -d -p 80:3000 \
  -e DEEPSEEK_API_KEY="your-key" \
  qaqtat/game-data-analysis:main-abc1234
```
