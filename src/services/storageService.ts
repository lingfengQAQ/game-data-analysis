import { TeamConfiguration } from '../types';

const STORAGE_KEYS = {
  TEAM_CONFIGS: 'team_configurations',
  CURRENT_CONFIG: 'current_configuration',
  PLAYERS: 'players_data'
};

class StorageService {
  // 保存配置
  saveConfiguration(config: TeamConfiguration): void {
    const configs = this.getAllConfigurations();
    const existingIndex = configs.findIndex(c => c.id === config.id);
    
    if (existingIndex >= 0) {
      configs[existingIndex] = config;
    } else {
      configs.push(config);
    }
    
    localStorage.setItem(STORAGE_KEYS.TEAM_CONFIGS, JSON.stringify(configs));
  }

  // 加载配置
  loadConfiguration(id: string): TeamConfiguration | null {
    const configs = this.getAllConfigurations();
    return configs.find(c => c.id === id) || null;
  }

  // 获取所有配置
  getAllConfigurations(): TeamConfiguration[] {
    const data = localStorage.getItem(STORAGE_KEYS.TEAM_CONFIGS);
    return data ? JSON.parse(data) : [];
  }

  // 删除配置
  deleteConfiguration(id: string): void {
    const configs = this.getAllConfigurations();
    const filtered = configs.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEAM_CONFIGS, JSON.stringify(filtered));
  }

  // 设置当前配置
  setCurrentConfiguration(config: TeamConfiguration): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CONFIG, JSON.stringify(config));
  }

  // 获取当前配置
  getCurrentConfiguration(): TeamConfiguration | null {
    const data = localStorage.setItem(STORAGE_KEYS.CURRENT_CONFIG);
    return data ? JSON.parse(data) : null;
  }
}

export const storageService = new StorageService();
