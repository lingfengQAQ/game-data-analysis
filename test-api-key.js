// 快速测试 API 密钥是否有效
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const apiKey = process.env.VITE_DEEPSEEK_API_KEY;

console.log('=== API 密钥测试 ===\n');

if (!apiKey) {
  console.error('❌ API 密钥未配置！');
  console.log('请在 .env.local 文件中设置 VITE_DEEPSEEK_API_KEY');
  process.exit(1);
}

console.log('✅ API 密钥已配置');
console.log(`密钥前缀: ${apiKey.substring(0, 10)}...`);
console.log(`密钥长度: ${apiKey.length} 字符`);

// 测试 API 连接
console.log('\n正在测试 API 连接...\n');

const testAPI = async () => {
  try {
    const response = await fetch('https://api.siliconflow.cn/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      console.log('✅ API 连接成功！');
      console.log(`状态码: ${response.status}`);
      
      const data = await response.json();
      console.log(`\n可用模型数量: ${data.data?.length || 0}`);
      
      // 检查是否有 DeepSeek-OCR 模型
      const hasOCR = data.data?.some(model => 
        model.id?.includes('DeepSeek-OCR') || model.id?.includes('deepseek-ai/DeepSeek-OCR')
      );
      
      if (hasOCR) {
        console.log('✅ DeepSeek-OCR 模型可用');
      } else {
        console.log('⚠️  未找到 DeepSeek-OCR 模型，但 API 密钥有效');
      }
    } else {
      console.error('❌ API 连接失败！');
      console.error(`状态码: ${response.status}`);
      const text = await response.text();
      console.error(`错误信息: ${text}`);
    }
  } catch (error) {
    console.error('❌ API 测试失败！');
    console.error(`错误: ${error.message}`);
  }
};

testAPI();
