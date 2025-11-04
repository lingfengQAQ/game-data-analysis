// 简单的 Express 服务器，用于代理 OCR API 调用
import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 .env.server 文件
try {
  const envPath = resolve(__dirname, '../.env.server');
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.log('未找到 .env.server 文件，使用系统环境变量');
}

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.DEEPSEEK_API_KEY;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OCR API 代理
app.post('/api/ocr', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ 
      error: 'API 密钥未配置',
      message: '请在服务器环境变量中设置 DEEPSEEK_API_KEY' 
    });
  }

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('OCR API 错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: error.message 
    });
  }
});

// 静态文件服务（生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  // SPA 路由回退
  app.get('*', (req, res) => {
    res.sendFile('dist/index.html', { root: '.' });
  });
}

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`API 密钥状态: ${API_KEY ? '已配置' : '未配置'}`);
});
