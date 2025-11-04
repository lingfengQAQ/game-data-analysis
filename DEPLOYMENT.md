# Docker 部署指南

## 前置要求

- Docker 已安装（版本 20.10+）
- Docker Compose 已安装（版本 2.0+）

## 快速部署

### 方式一：使用 Docker Compose（推荐）

```bash
# 1. 进入项目目录
cd game-data-analysis-app

# 2. 构建并启动容器
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止容器
docker-compose down
```

访问地址：http://localhost:8080

### 方式二：使用 Docker 命令

```bash
# 1. 构建镜像
docker build -t game-data-analysis:latest .

# 2. 运行容器
docker run -d \
  --name game-data-analysis-app \
  -p 8080:80 \
  --restart unless-stopped \
  game-data-analysis:latest

# 3. 查看日志
docker logs -f game-data-analysis-app

# 4. 停止并删除容器
docker stop game-data-analysis-app
docker rm game-data-analysis-app
```

## 生产环境部署

### 1. 修改端口（可选）

编辑 `docker-compose.yml`，修改端口映射：

```yaml
ports:
  - "80:80"  # 或其他端口
```

### 2. 使用反向代理（推荐）

如果使用 Nginx 或 Traefik 作为反向代理：

```yaml
services:
  game-data-analysis:
    # ... 其他配置
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.game-data.rule=Host(`your-domain.com`)"
```

### 3. HTTPS 配置

使用 Let's Encrypt + Nginx Proxy Manager 或 Traefik 自动配置 HTTPS。

## 常用命令

```bash
# 重新构建镜像
docker-compose build --no-cache

# 更新应用
docker-compose pull
docker-compose up -d

# 查看容器状态
docker-compose ps

# 进入容器
docker-compose exec game-data-analysis sh

# 清理未使用的镜像
docker image prune -a
```

## 性能优化

### 1. 多阶段构建
Dockerfile 已使用多阶段构建，最终镜像只包含必要的文件。

### 2. Nginx 优化
- 启用 gzip 压缩
- 静态资源缓存 1 年
- 安全头配置

### 3. 资源限制（可选）

在 `docker-compose.yml` 中添加：

```yaml
services:
  game-data-analysis:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs

# 检查端口占用
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac
```

### 构建失败

```bash
# 清理缓存重新构建
docker-compose build --no-cache
```

### 应用无法访问

1. 检查防火墙设置
2. 确认端口映射正确
3. 查看 nginx 日志：`docker-compose logs game-data-analysis`

## 备份与恢复

由于这是纯前端应用，无需备份数据。如需保存用户配置：

```bash
# 导出容器配置
docker inspect game-data-analysis-app > backup-config.json
```

## 监控

### 查看资源使用

```bash
docker stats game-data-analysis-app
```

### 健康检查

在 `docker-compose.yml` 中添加：

```yaml
services:
  game-data-analysis:
    # ... 其他配置
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 安全建议

1. 定期更新基础镜像
2. 使用非 root 用户运行（如需要）
3. 限制容器资源使用
4. 配置防火墙规则
5. 使用 HTTPS（生产环境必须）

## 更新应用

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并部署
docker-compose up -d --build

# 3. 清理旧镜像
docker image prune -f
```


## GitHub Actions 自动化部署

### 使用 Docker Hub 镜像部署

如果已配置 GitHub Actions（参见 `GITHUB_ACTIONS_SETUP.md`），可以直接使用发布的镜像：

```bash
# 使用生产环境配置
docker-compose -f docker-compose.prod.yml up -d
```

### 快速部署脚本

#### Linux/Mac
```bash
# 赋予执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

#### Windows
```powershell
# 运行 PowerShell 脚本
.\deploy.ps1
```

### 服务器自动更新

创建定时任务自动拉取最新镜像：

#### Linux Cron
```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点更新
0 2 * * * cd /path/to/app && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d
```

#### Windows 任务计划程序
1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器：每天
4. 操作：启动程序
5. 程序：`powershell.exe`
6. 参数：`-File "C:\path\to\deploy.ps1"`

## CI/CD 工作流

```
开发 → 提交代码 → GitHub Actions → 构建镜像 → 推送到 Docker Hub → 服务器拉取 → 自动部署
```

详细配置请参考 `GITHUB_ACTIONS_SETUP.md`


## 环境变量配置（更新）

### DeepSeek-OCR API 密钥

图片名单对比功能需要配置 DeepSeek-OCR API 密钥。

**重要**：API 密钥只在服务器端使用，通过后端代理调用，不会暴露到前端代码中。

### 获取 API 密钥

1. 访问 [硅基流动官网](https://siliconflow.cn)
2. 注册并登录账号
3. 进入控制台创建 API 密钥
4. 复制密钥并配置到服务器环境变量

### Docker 部署配置

在服务器上设置环境变量：

```bash
# 设置 API 密钥
export DEEPSEEK_API_KEY="your_api_key_here"

# 启动服务
docker-compose -f docker-compose.prod.yml up -d
```

或者创建 `.env` 文件（与 `docker-compose.prod.yml` 同目录）：

```env
DEEPSEEK_API_KEY=your_api_key_here
```

然后启动：

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 架构说明

- **前端**：React + Vite 构建的静态文件
- **后端**：Node.js + Express 服务器
  - 提供静态文件服务
  - 提供 `/api/ocr` 代理端点
  - API 密钥只存在于服务器端
- **安全性**：前端代码中不包含任何 API 密钥信息

### 本地开发配置

本地开发时，API 密钥配置在 `.env.local` 文件中：

```env
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

**注意**：
- `.env.local` 已被 `.gitignore` 忽略，不会提交到代码仓库
- 生产环境使用后端代理，API 密钥只存在于服务器端
