import { PlayerClass } from '../types';

// 职业颜色映射
export const CLASS_COLORS: Record<PlayerClass, string> = {
  '素问': '#ffc0cb',    // 粉色
  '神相': '#87ceeb',    // 蓝色
  '铁衣': '#ffd700',    // 黄色
  '血河': '#b22222',    // 砖红色
  '云瑶': '#ff6b6b',    // 红色
  '鸿音': '#daa520',    // 金色
  '九灵': '#9370db',    // 紫色
  '龙吟': '#98fb98',    // 浅绿色
  '沧澜': '#4682b4',    // 钢蓝色
  '碎梦': '#87ceeb',    // 天蓝色
  '荒羽': '#8b4513',    // 棕色
  '玄机': '#a9a9a9',    // 灰色
  '潮光': '#00ced1',    // 海蓝色
  '其他': '#ffffff'     // 白色
};

// 获取职业颜色
export function getClassColor(playerClass: PlayerClass): string {
  return CLASS_COLORS[playerClass] || CLASS_COLORS['其他'];
}

// 颜色方案定义
export const COLOR_SCHEMES = {
  red: { light: '#ffebee', dark: '#c62828' },
  green: { light: '#e8f5e9', dark: '#2e7d32' },
  blue: { light: '#e3f2fd', dark: '#1565c0' },
  purple: { light: '#f3e5f5', dark: '#6a1b9a' }
};

// HSL 颜色插值
function interpolateHSL(color1: string, color2: string, percentage: number): string {
  // 简化实现：使用 RGB 插值
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  const r = Math.round(c1.r + (c2.r - c1.r) * percentage);
  const g = Math.round(c1.g + (c2.g - c1.g) * percentage);
  const b = Math.round(c1.b + (c2.b - c1.b) * percentage);
  
  return `rgb(${r}, ${g}, ${b})`;
}

// 十六进制转 RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// 颜色插值
export function interpolateColor(
  scheme: keyof typeof COLOR_SCHEMES,
  percentage: number
): string {
  const { light, dark } = COLOR_SCHEMES[scheme];
  return interpolateHSL(light, dark, percentage);
}

// 计算条形图颜色
export function calculateBarColor(
  value: number,
  min: number,
  max: number,
  scheme: keyof typeof COLOR_SCHEMES
): string {
  if (max === min) return COLOR_SCHEMES[scheme].light;
  const percentage = (value - min) / (max - min);
  return interpolateColor(scheme, percentage);
}
