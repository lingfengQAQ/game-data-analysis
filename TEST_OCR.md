# OCR 功能测试指南

## 环境配置

API 密钥已配置在 `.env.local` 文件中：
```
VITE_DEEPSEEK_API_KEY=sk-dyvaznsipjvbzuovbttlhipynrlgpxciyixlhhnwyekmcjqr
```

## 测试步骤

### 1. 启动开发服务器

```bash
cd game-data-analysis-app
npm run dev
```

服务器将在 `http://localhost:5173` 启动。

### 2. 访问图片名单对比页面

1. 打开浏览器访问 `http://localhost:5173`
2. 点击左侧菜单的"图片名单对比"

### 3. 测试图片上传

1. 准备测试图片：
   - 格式：PNG、JPG、JPEG、WebP
   - 大小：< 10MB
   - 内容：包含中文角色名的游戏截图

2. 上传图片：
   - 点击"组1图片"区域的"添加图片"按钮
   - 选择 1-10 张图片
   - 同样方式上传"组2图片"

### 4. 测试 OCR 识别

1. 点击"开始识别"按钮
2. 观察识别进度条
3. 等待识别完成

**预期结果**：
- 进度条显示识别进度
- 识别完成后，两个文本框中显示识别出的角色名（每行一个）
- 可以手动编辑识别结果

### 5. 测试手动编辑

1. 在文本框中手动添加、删除或修改角色名
2. 每行一个角色名
3. 观察人数统计是否实时更新

### 6. 测试名单对比

1. 点击"开始对比"按钮
2. 查看对比结果

**预期结果**：
- 显示三个区域：
  - ✅ 共同（绿色）：两组都有的角色
  - ➕ 仅在组1（蓝色）：只在组1的角色
  - ➖ 仅在组2（橙色）：只在组2的角色
- 显示人数统计

### 7. 测试导出功能

1. 点击"导出Excel"按钮
   - 应该下载一个 Excel 文件
   - 包含三个工作表：共同、仅组1、仅组2

2. 点击"导出CSV"按钮
   - 应该下载一个 CSV 文件
   - 包含所有对比结果

3. 点击"复制"按钮
   - 应该显示"已复制到剪贴板"提示
   - 可以粘贴到其他应用中

## 常见问题

### API 密钥未配置

如果看到"API 密钥未配置"警告：
1. 检查 `.env.local` 文件是否存在
2. 检查文件中是否有 `VITE_DEEPSEEK_API_KEY=...`
3. 重启开发服务器（Ctrl+C 然后 `npm run dev`）

### 识别失败

如果识别失败：
1. 检查网络连接
2. 检查 API 密钥是否有效
3. 检查图片格式是否支持
4. 查看浏览器控制台的错误信息

### 图片上传失败

如果图片上传失败：
1. 检查图片格式（只支持 PNG、JPG、JPEG、WebP）
2. 检查图片大小（< 10MB）
3. 检查是否超过 10 张限制

## API 使用说明

### DeepSeek-OCR API

- **提供商**：硅基流动（SiliconFlow）
- **模型**：deepseek-ai/DeepSeek-OCR
- **端点**：https://api.siliconflow.cn/v1/chat/completions
- **文档**：https://docs.siliconflow.cn

### API 调用示例

```typescript
const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'deepseek-ai/DeepSeek-OCR',
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${base64Image}` }
        },
        {
          type: 'text',
          text: '请识别图片中的所有中文角色名，每行一个名字，不要添加任何其他内容。'
        }
      ]
    }],
    temperature: 0.1,
    max_tokens: 2000
  })
});
```

## 测试检查清单

- [ ] 环境变量配置正确
- [ ] 开发服务器启动成功
- [ ] 可以访问图片名单对比页面
- [ ] 可以上传图片（组1和组2）
- [ ] 可以删除已上传的图片
- [ ] OCR 识别功能正常
- [ ] 识别进度显示正常
- [ ] 可以手动编辑识别结果
- [ ] 人数统计实时更新
- [ ] 名单对比功能正常
- [ ] 对比结果显示正确
- [ ] Excel 导出功能正常
- [ ] CSV 导出功能正常
- [ ] 复制到剪贴板功能正常
- [ ] 错误提示显示正确
- [ ] 响应式布局正常

## 下一步

测试完成后，可以：
1. 提交代码到 GitHub
2. 构建 Docker 镜像
3. 部署到生产环境
4. 配置生产环境的 API 密钥
