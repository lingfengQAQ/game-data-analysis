// DeepSeek-OCR 服务

interface OCRMessage {
  role: 'user';
  content: Array<{
    type: 'image_url' | 'text';
    image_url?: { url: string };
    text?: string;
  }>;
}

interface OCRRequest {
  model: string;
  messages: OCRMessage[];
  temperature: number;
  max_tokens: number;
}

interface OCRResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class OCRService {
  private apiKey: string;
  private baseURL = 'https://api.siliconflow.cn/v1/chat/completions';
  private model = 'deepseek-ai/DeepSeek-OCR';
  
  constructor() {
    this.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
  }
  
  /**
   * 识别单张图片中的角色名
   */
  async recognizeImage(imageFile: File): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('API 密钥未配置，请在环境变量中设置 VITE_DEEPSEEK_API_KEY');
    }
    
    try {
      // 1. 转换图片为 base64
      const base64 = await this.fileToBase64(imageFile);
      
      // 2. 构建请求
      const request: OCRRequest = {
        model: this.model,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: base64 }
            },
            {
              type: 'text',
              text: '请识别图片中的所有中文角色名，每行一个名字，只输出名字，不要其他内容。'
            }
          ]
        }],
        temperature: 0,
        max_tokens: 2048
      };
      
      // 3. 调用 API
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
      }
      
      const data: OCRResponse = await response.json();
      const text = data.choices[0].message.content;
      
      // 4. 提取角色名
      return this.extractNames(text);
    } catch (error) {
      console.error('OCR 识别失败:', error);
      throw error;
    }
  }
  
  /**
   * 批量识别多张图片
   */
  async recognizeImages(
    imageFiles: File[],
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    const allNames: string[] = [];
    const total = imageFiles.length;
    
    for (let i = 0; i < total; i++) {
      const names = await this.recognizeImage(imageFiles[i]);
      allNames.push(...names);
      
      if (onProgress) {
        onProgress(i + 1, total);
      }
    }
    
    return allNames;
  }
  
  /**
   * 从文本中提取中文角色名（2-4个汉字）
   */
  private extractNames(text: string): string[] {
    const names: string[] = [];
    
    // 按行分割
    const lines = text.split('\n');
    
    for (const line of lines) {
      // 提取中文名字（2-4个汉字）
      const matches = line.match(/[\u4e00-\u9fa5]{2,4}/g);
      if (matches) {
        names.push(...matches);
      }
    }
    
    return names;
  }
  
  /**
   * 将文件转换为 base64 格式
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * 检查 API 密钥是否已配置
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const ocrService = new OCRService();
