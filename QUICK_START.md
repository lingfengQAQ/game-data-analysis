# 🚀 快速开始指南

## 📋 配置清单

### 1. Docker Hub 配置（5 分钟）

- [ ] 注册 Docker Hub 账号
- [ ] 创建 Access Token
- [ ] 记录用户名和 Token

### 2. GitHub 配置（3 分钟）

- [ ] 添加 `DOCKERHUB_USERNAME` Secret
- [ ] 添加 `DOCKERHUB_TOKEN` Secret
- [ ] 修改 `.github/workflows/docker-publish.yml` 中的镜像名称

### 3. 推送代码（1 分钟）

```bash
git add .
git commit -m "Add Docker and GitHub Actions"
git push origin main
```

## 🎯 三种部署方式

### 方式 1️⃣：本地开发（最快）

```bash
npm install
npm run dev
# 访问 http://localhost:5173
```

### 方式 2️⃣：本地 Docker（推荐测试）

```bash
docker-compose up -d
# 访问 http://localhost:8080
```

### 方式 3️⃣：生产部署（推荐生产）

```bash
# 修改 docker-compose.prod.yml 中的镜像名称
docker-compose -f docker-compose.prod.yml up -d
# 访问 http://localhost:80
```

## 📝 需要修改的文件

### 必须修改（3 个文件）

1. **`.github/workflows/docker-publish.yml`** (第 16 行)
   ```yaml
   DOCKER_IMAGE_NAME: your-username/game-data-analysis
   ```
   改为你的 Docker Hub 用户名

2. **`docker-compose.prod.yml`** (第 5 行)
   ```yaml
   image: your-username/game-data-analysis:latest
   ```
   改为你的 Docker Hub 用户名

3. **`deploy.sh` 和 `deploy.ps1`** (第 7 行)
   ```bash
   DOCKER_IMAGE="your-username/game-data-analysis:latest"
   ```
   改为你的 Docker Hub 用户名

## 🔍 验证部署

### 检查 GitHub Actions
1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看最新的工作流运行状态

### 检查 Docker Hub
1. 登录 Docker Hub
2. 查看你的仓库
3. 确认镜像已推送

### 检查本地运行
```bash
# 查看容器状态
docker ps

# 查看日志
docker logs game-data-analysis-app

# 测试访问
curl http://localhost:8080
```

## ⚡ 常用命令

### 开发
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览构建结果
```

### Docker
```bash
docker-compose up -d              # 启动
docker-compose down               # 停止
docker-compose logs -f            # 查看日志
docker-compose restart            # 重启
```

### 部署
```bash
./deploy.sh                       # Linux/Mac 快速部署
.\deploy.ps1                      # Windows 快速部署
docker pull username/image:latest # 拉取最新镜像
```

## 🆘 遇到问题？

### GitHub Actions 失败
- 检查 Secrets 是否正确设置
- 查看 Actions 日志找到具体错误
- 确认 Docker Hub Token 有效

### Docker 构建失败
- 运行 `docker-compose build --no-cache`
- 检查 Dockerfile 语法
- 确认网络连接正常

### 容器无法访问
- 检查端口是否被占用：`netstat -ano | findstr :8080`
- 查看容器日志：`docker logs game-data-analysis-app`
- 确认防火墙设置

## 📚 详细文档

- [完整部署指南](./DEPLOYMENT.md)
- [GitHub Actions 配置](./GITHUB_ACTIONS_SETUP.md)
- [项目说明](./README.md)

## 🎉 完成！

配置完成后，每次推送代码都会自动：
- ✅ 构建 Docker 镜像
- ✅ 推送到 Docker Hub
- ✅ 生成版本标签
- ✅ 支持多平台

只需在服务器上运行 `./deploy.sh` 即可部署最新版本！
