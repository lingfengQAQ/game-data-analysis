# 游戏数据分析应用

一个用于分析游戏帮战数据和团队配置的 Web 应用。

## ✨ 功能特性

- 📊 帮战数据分析和可视化
- 👥 团队配置管理
- 📈 数据排序和筛选
- 📤 导出为 Excel/CSV/图片
- 🎨 职业颜色标识
- 📱 响应式设计

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🐳 Docker 部署

### 方式一：本地构建

```bash
# 使用 Docker Compose
docker-compose up -d

# 访问 http://localhost:8080
```

### 方式二：使用 Docker Hub 镜像

```bash
# 拉取镜像
docker pull your-dockerhub-username/game-data-analysis:latest

# 运行容器
docker run -d -p 8080:80 your-dockerhub-username/game-data-analysis:latest
```

### 方式三：快速部署脚本

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows:**
```powershell
.\deploy.ps1
```

## 📚 文档

- [Docker 部署指南](./DEPLOYMENT.md) - 详细的 Docker 部署说明
- [GitHub Actions 配置](./GITHUB_ACTIONS_SETUP.md) - CI/CD 自动化配置
- [开发文档](./docs/) - 开发相关文档

## 🔧 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件**: Ant Design
- **状态管理**: Zustand
- **样式**: CSS Modules
- **图表**: 自定义可视化组件
- **导出**: ExcelJS, PapaParse, html2canvas

## 📦 项目结构

```
game-data-analysis-app/
├── src/
│   ├── components/        # React 组件
│   ├── pages/            # 页面组件
│   ├── stores/           # 状态管理
│   ├── services/         # 业务逻辑
│   ├── types/            # TypeScript 类型
│   └── utils/            # 工具函数
├── public/               # 静态资源
├── .github/
│   └── workflows/        # GitHub Actions
├── Dockerfile            # Docker 配置
├── docker-compose.yml    # 本地开发
├── docker-compose.prod.yml  # 生产环境
└── nginx.conf           # Nginx 配置
```

## 🔄 CI/CD 流程

项目配置了 GitHub Actions 自动化流程：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建 Docker 镜像
3. 推送到 Docker Hub
4. 服务器拉取最新镜像并部署

详见 [GitHub Actions 配置指南](./GITHUB_ACTIONS_SETUP.md)

## 🌐 部署环境

### 开发环境
- URL: http://localhost:5173
- 热重载: ✅
- Source Maps: ✅

### 生产环境
- URL: 根据服务器配置
- 优化: ✅
- Gzip 压缩: ✅
- 静态资源缓存: ✅

## 📝 使用说明

### 1. 帮战数据分析
1. 点击"上传文件"按钮
2. 选择帮战数据 Excel 文件
3. 查看数据分析结果
4. 可按帮会或团队查看
5. 支持导出为 Excel/CSV

### 2. 团队配置
1. 切换到"团队配置"页面
2. 创建新配置或加载已有配置
3. 拖拽玩家到对应位置
4. 保存配置
5. 导出为 CSV 或图片

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Docker Hub](https://hub.docker.com/r/your-dockerhub-username/game-data-analysis)
- [GitHub Repository](https://github.com/your-username/your-repo)
- [问题反馈](https://github.com/your-username/your-repo/issues)
