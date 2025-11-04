// 图片名单对比相关类型定义

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export interface ComparisonResult {
  common: string[];
  onlyInGroup1: string[];
  onlyInGroup2: string[];
}

export interface RecognitionProgress {
  current: number;
  total: number;
}

export interface ComparisonState {
  // 图片
  group1Images: ImageFile[];
  group2Images: ImageFile[];
  
  // 识别结果
  group1Names: string[];
  group2Names: string[];
  
  // 识别状态
  isRecognizing: boolean;
  recognitionProgress: RecognitionProgress;
  recognitionError: string | null;
  
  // 对比结果
  comparisonResult: ComparisonResult | null;
}
