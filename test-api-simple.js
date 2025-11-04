// 简单的 API 密钥测试（不需要额外依赖）
import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('=== API 密钥测试 ===\n');

// 读取 .env.local 文件
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  
  // 解析 API 密钥
  const match = envContent.match(/VITE_DEEPSEEK_API_KEY=(.+)/);
  
  if (!match || !match[1]) {
    console.error('❌ 未找到 VITE_DEEPSEEK_API_KEY');
    process.exit(1);
  }
  
  const apiKey = match[1].trim();
  
  console.log('✅ API 密钥已配置');
  console.log(`密钥前缀: ${apiKey.substring(0, 15)}...`);
  console.log(`密钥长度: ${apiKey.length} 字符`);
  
  // 测试 API 连接
  console.log('\n正在测试 API 连接...\n');
  
  fetch('https://api.siliconflow.cn/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  })
  .then(response => {
    if (response.ok) {
      console.log('✅ API 连接成功！');
      console.log(`状态码: ${response.status}`);
      return response.json();
    } else {
      console.error('❌ API 连接失败！');
      console.error(`状态码: ${response.status}`);
      return response.text().then(text => {
        console.error(`错误信息: ${text}`);
        process.exit(1);
      });
    }
  })
  .then(data => {
    if (data && data.data) {
      console.log(`\n可用模型数量: ${data.data.length}`);
      
      // 查找 DeepSeek-OCR 模型
      const ocrModel = data.data.find(model => 
        model.id && (
          model.id.includes('DeepSeek-OCR') || 
          model.id.includes('deepseek-ai/DeepSeek-OCR')
        )
      );
      
      if (ocrModel) {
        console.log('✅ DeepSeek-OCR 模型可用');
        console.log(`模型 ID: ${ocrModel.id}`);
      } else {
        console.log('⚠️  未找到 DeepSeek-OCR 模型');
        console.log('可用的模型列表：');
        data.data.slice(0, 10).forEach(model => {
          console.log(`  - ${model.id}`);
        });
        if (data.data.length > 10) {
          console.log(`  ... 还有 ${data.data.length - 10} 个模型`);
        }
      }
      
      console.log('\n✅ 测试完成！API 密钥有效。');
    }
  })
  .catch(error => {
    console.error('❌ API 测试失败！');
    console.error(`错误: ${error.message}`);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ 读取 .env.local 文件失败！');
  console.error(`错误: ${error.message}`);
  console.log('\n请确保 .env.local 文件存在并包含 VITE_DEEPSEEK_API_KEY');
  process.exit(1);
}
