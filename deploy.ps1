# 游戏数据分析应用 - Windows 快速部署脚本
# 用于从 Docker Hub 拉取并部署最新版本

$ErrorActionPreference = "Stop"

# 配置
$DOCKER_IMAGE = "qaqtat/game-data-analysis:latest"
$CONTAINER_NAME = "game-data-analysis-app"
$PORT = "80"

Write-Host "🚀 开始部署游戏数据分析应用..." -ForegroundColor Green

# 检查 Docker 是否安装
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ 错误：Docker 未安装" -ForegroundColor Red
    Write-Host "请先安装 Docker Desktop: https://docs.docker.com/desktop/install/windows-install/"
    exit 1
}

# 拉取最新镜像
Write-Host "📦 拉取最新镜像..." -ForegroundColor Cyan
docker pull $DOCKER_IMAGE

# 停止并删除旧容器（如果存在）
$existingContainer = docker ps -aq -f name=$CONTAINER_NAME
if ($existingContainer) {
    Write-Host "🛑 停止旧容器..." -ForegroundColor Yellow
    docker stop $CONTAINER_NAME 2>$null
    Write-Host "🗑️  删除旧容器..." -ForegroundColor Yellow
    docker rm $CONTAINER_NAME 2>$null
}

# 启动新容器
Write-Host "▶️  启动新容器..." -ForegroundColor Cyan
docker run -d `
    --name $CONTAINER_NAME `
    -p "${PORT}:80" `
    --restart unless-stopped `
    $DOCKER_IMAGE

# 等待容器启动
Write-Host "⏳ 等待容器启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 检查容器状态
$runningContainer = docker ps -q -f name=$CONTAINER_NAME
if ($runningContainer) {
    Write-Host "✅ 部署成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 容器信息：" -ForegroundColor Cyan
    docker ps -f name=$CONTAINER_NAME --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
    Write-Host ""
    Write-Host "🌐 访问地址：" -ForegroundColor Cyan
    Write-Host "   http://localhost:$PORT" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 查看日志：" -ForegroundColor Cyan
    Write-Host "   docker logs -f $CONTAINER_NAME" -ForegroundColor White
} else {
    Write-Host "❌ 部署失败！" -ForegroundColor Red
    Write-Host "查看日志：" -ForegroundColor Yellow
    docker logs $CONTAINER_NAME
    exit 1
}

# 清理未使用的镜像
Write-Host "🧹 清理未使用的镜像..." -ForegroundColor Yellow
docker image prune -f | Out-Null

Write-Host "🎉 部署完成！" -ForegroundColor Green
