#!/bin/bash

# 游戏数据分析应用 - 快速部署脚本
# 用于从 Docker Hub 拉取并部署最新版本

set -e

# 配置
DOCKER_IMAGE="qaqtat/game-data-analysis:latest"
CONTAINER_NAME="game-data-analysis-app"
PORT="80"

echo "🚀 开始部署游戏数据分析应用..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误：Docker 未安装"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 拉取最新镜像
echo "📦 拉取最新镜像..."
docker pull $DOCKER_IMAGE

# 停止并删除旧容器（如果存在）
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "🛑 停止旧容器..."
    docker stop $CONTAINER_NAME || true
    echo "🗑️  删除旧容器..."
    docker rm $CONTAINER_NAME || true
fi

# 启动新容器
echo "▶️  启动新容器..."
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:80 \
    --restart unless-stopped \
    $DOCKER_IMAGE

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 5

# 检查容器状态
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "✅ 部署成功！"
    echo ""
    echo "📊 容器信息："
    docker ps -f name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "🌐 访问地址："
    echo "   http://localhost:$PORT"
    echo ""
    echo "📝 查看日志："
    echo "   docker logs -f $CONTAINER_NAME"
else
    echo "❌ 部署失败！"
    echo "查看日志："
    docker logs $CONTAINER_NAME
    exit 1
fi

# 清理未使用的镜像
echo "🧹 清理未使用的镜像..."
docker image prune -f

echo "🎉 部署完成！"
