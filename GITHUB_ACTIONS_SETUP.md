# GitHub Actions + Docker Hub 自动化部署指南

## 📋 前置准备

### 1. Docker Hub 账号
- 注册 Docker Hub 账号：https://hub.docker.com/signup
- 记住你的用户名（例如：`johndoe`）

### 2. 创建 Docker Hub Access Token
1. 登录 Docker Hub
2. 点击右上角头像 → **Account Settings**
3. 选择 **Security** → **New Access Token**
4. 输入描述（例如：`GitHub Actions`）
5. 权限选择：**Read, Write, Delete**
6. 点击 **Generate**
7. **立即复制并保存 Token**（只显示一次！）

## 🔧 配置步骤

### 步骤 1：配置 GitHub Secrets

1. 打开你的 GitHub 仓库
2. 进入 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下两个 Secret：

#### Secret 1: DOCKERHUB_USERNAME
- Name: `DOCKERHUB_USERNAME`
- Value: 你的 Docker Hub 用户名（例如：`johndoe`）

#### Secret 2: DOCKERHUB_TOKEN
- Name: `DOCKERHUB_TOKEN`
- Value: 刚才创建的 Access Token

### 步骤 2：修改工作流配置

编辑 `.github/workflows/docker-publish.yml`，修改第 16 行：

```yaml
env:
  DOCKER_IMAGE_NAME: your-dockerhub-username/game-data-analysis
```

改为：

```yaml
env:
  DOCKER_IMAGE_NAME: johndoe/game-data-analysis  # 替换为你的用户名
```

### 步骤 3：提交并推送

```bash
git add .
git commit -m "Add GitHub Actions for Docker Hub"
git push origin main
```

## 🚀 工作流触发条件

工作流会在以下情况自动运行：

### 1. 推送到主分支
```bash
git push origin main
```
生成标签：`latest`, `main`

### 2. 创建版本标签
```bash
git tag v1.0.0
git push origin v1.0.0
```
生成标签：`v1.0.0`, `1.0`, `1`, `latest`

### 3. Pull Request
```bash
# 创建 PR 时自动构建测试
```
生成标签：`pr-123`

### 4. 手动触发
在 GitHub 仓库页面：
**Actions** → **Build and Push to Docker Hub** → **Run workflow**

## 📦 生成的镜像标签

根据不同的触发方式，会生成不同的标签：

| 触发方式 | 生成的标签 |
|---------|-----------|
| 推送到 main | `latest`, `main`, `main-abc1234` |
| 推送到 dev | `dev`, `dev-abc1234` |
| 标签 v1.2.3 | `v1.2.3`, `1.2`, `1`, `latest` |
| PR #42 | `pr-42` |

## 🔍 查看构建状态

### 方法 1：GitHub Actions 页面
1. 进入仓库的 **Actions** 标签
2. 查看最新的工作流运行
3. 点击查看详细日志

### 方法 2：添加徽章到 README

在 `README.md` 中添加：

```markdown
![Docker Build](https://github.com/your-username/your-repo/actions/workflows/docker-publish.yml/badge.svg)
```

## 🐳 使用发布的镜像

### 拉取最新版本
```bash
docker pull johndoe/game-data-analysis:latest
```

### 拉取特定版本
```bash
docker pull johndoe/game-data-analysis:v1.0.0
```

### 运行容器
```bash
docker run -d -p 8080:80 johndoe/game-data-analysis:latest
```

### 使用 Docker Compose

创建 `docker-compose.prod.yml`：

```yaml
version: '3.8'

services:
  game-data-analysis:
    image: johndoe/game-data-analysis:latest
    container_name: game-data-analysis-app
    ports:
      - "8080:80"
    restart: unless-stopped
```

运行：
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🎯 高级配置

### 1. 多平台构建

工作流已配置支持：
- `linux/amd64` (x86_64)
- `linux/arm64` (ARM64, 适用于 Apple Silicon, Raspberry Pi 等)

### 2. 构建缓存

使用 GitHub Actions Cache 加速构建：
- 首次构建：~5-10 分钟
- 后续构建：~2-3 分钟

### 3. 仅在特定路径变化时构建

修改工作流，添加 `paths` 过滤：

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'game-data-analysis-app/**'
      - '.github/workflows/docker-publish.yml'
```

### 4. 构建前运行测试

在 `Build and push` 步骤前添加：

```yaml
- name: Run tests
  run: |
    npm ci
    npm run test
```

### 5. 发送通知

构建完成后发送通知（可选）：

```yaml
- name: Send notification
  if: success()
  run: |
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"Docker image built successfully!"}' \
    ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 🔒 安全最佳实践

1. **永远不要**在代码中硬编码密码或 Token
2. **使用** GitHub Secrets 存储敏感信息
3. **定期轮换** Docker Hub Access Token
4. **限制** Token 权限（只给必要的权限）
5. **启用** Docker Hub 的 2FA（两步验证）

## 🐛 故障排查

### 问题 1：认证失败
```
Error: Cannot perform an interactive login from a non TTY device
```

**解决方案**：
- 检查 `DOCKERHUB_USERNAME` 和 `DOCKERHUB_TOKEN` 是否正确设置
- 确认 Token 没有过期
- 重新生成 Token 并更新 Secret

### 问题 2：推送失败
```
Error: denied: requested access to the resource is denied
```

**解决方案**：
- 确认镜像名称格式正确：`username/image-name`
- 检查 Docker Hub 仓库是否存在（首次推送会自动创建）
- 确认 Token 有写入权限

### 问题 3：构建超时
```
Error: The job running on runner has exceeded the maximum execution time
```

**解决方案**：
- 优化 Dockerfile（使用多阶段构建）
- 启用构建缓存
- 减少依赖包大小

### 问题 4：平台不支持
```
Error: failed to solve: no match for platform in manifest
```

**解决方案**：
- 移除不支持的平台
- 或者使用基础镜像的多平台版本

## 📊 监控和维护

### 查看镜像大小
```bash
docker images johndoe/game-data-analysis
```

### 清理旧镜像
在 Docker Hub 网站上：
1. 进入仓库
2. 选择 **Tags**
3. 删除不需要的旧标签

### 自动清理策略
在 Docker Hub 设置中配置保留策略：
- 保留最近 10 个标签
- 保留所有带版本号的标签
- 自动删除超过 30 天的未标记镜像

## 📝 完整示例

### 1. 本地开发
```bash
# 开发和测试
npm run dev
```

### 2. 提交代码
```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

### 3. 自动构建
GitHub Actions 自动：
- ✅ 检出代码
- ✅ 构建 Docker 镜像
- ✅ 推送到 Docker Hub
- ✅ 生成多个标签

### 4. 服务器部署
```bash
# SSH 到服务器
ssh user@your-server.com

# 拉取最新镜像
docker pull johndoe/game-data-analysis:latest

# 停止旧容器
docker stop game-data-analysis-app
docker rm game-data-analysis-app

# 启动新容器
docker run -d \
  --name game-data-analysis-app \
  -p 80:80 \
  --restart unless-stopped \
  johndoe/game-data-analysis:latest
```

## 🎉 完成！

现在你的项目已经配置好自动化 CI/CD 流程：
- ✅ 代码推送自动触发构建
- ✅ 自动推送到 Docker Hub
- ✅ 支持多平台
- ✅ 版本标签管理
- ✅ 构建缓存优化

每次推送代码，GitHub Actions 会自动构建并发布新版本到 Docker Hub！
