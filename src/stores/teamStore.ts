import { create } from 'zustand';
import { TeamConfiguration, Player, Position, Regiment, Squad } from '../types';
import { generateId } from '../utils/dataUtils';
import { storageService } from '../services/storageService';

interface TeamStore {
  configuration: TeamConfiguration;
  setConfiguration: (config: TeamConfiguration) => void;
  addPlayerToTeam: (regimentId: number, squadId: number, position: number, player: Player) => void;
  movePlayer: (from: Position, to: Position) => void;
  removePlayerFromTeam: (position: Position) => void;
  saveConfiguration: (name: string) => void;
  loadConfiguration: (id: string) => void;
  initializeEmptyConfiguration: () => void;
}

// 创建空配置
function createEmptyConfiguration(): TeamConfiguration {
  const regiments: Regiment[] = [];
  
  for (let i = 0; i < 4; i++) {
    const squads: Squad[] = [];
    for (let j = 0; j < 5; j++) {
      squads.push({
        id: j + 1,
        players: Array(6).fill(null)
      });
    }
    regiments.push({
      id: i + 1,
      name: `团${i + 1}`,
      squads
    });
  }
  
  return {
    id: generateId(),
    name: '新配置',
    createdAt: new Date(),
    regiments
  };
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  configuration: createEmptyConfiguration(),
  
  setConfiguration: (config) => set({ configuration: config }),
  
  addPlayerToTeam: (regimentId, squadId, position, player) => set((state) => {
    const newConfig = { ...state.configuration };
    const regiment = newConfig.regiments.find(r => r.id === regimentId);
    if (regiment) {
      const squad = regiment.squads.find(s => s.id === squadId);
      if (squad && position >= 0 && position < 6) {
        squad.players[position] = player;
      }
    }
    return { configuration: newConfig };
  }),
  
  movePlayer: (from, to) => set((state) => {
    const newConfig = { ...state.configuration };
    
    // 获取源位置的玩家
    const fromRegiment = newConfig.regiments.find(r => r.id === from.regimentId);
    const fromSquad = fromRegiment?.squads.find(s => s.id === from.squadId);
    const fromPlayer = fromSquad?.players[from.position];
    
    // 获取目标位置的玩家
    const toRegiment = newConfig.regiments.find(r => r.id === to.regimentId);
    const toSquad = toRegiment?.squads.find(s => s.id === to.squadId);
    const toPlayer = toSquad?.players[to.position];
    
    // 交换位置
    if (fromSquad && toSquad) {
      fromSquad.players[from.position] = toPlayer || null;
      toSquad.players[to.position] = fromPlayer || null;
    }
    
    return { configuration: newConfig };
  }),
  
  removePlayerFromTeam: (position) => set((state) => {
    const newConfig = { ...state.configuration };
    const regiment = newConfig.regiments.find(r => r.id === position.regimentId);
    if (regiment) {
      const squad = regiment.squads.find(s => s.id === position.squadId);
      if (squad) {
        squad.players[position.position] = null;
      }
    }
    return { configuration: newConfig };
  }),
  
  saveConfiguration: (name) => {
    const config = get().configuration;
    const configToSave = {
      ...config,
      name,
      createdAt: new Date()
    };
    storageService.saveConfiguration(configToSave);
    set({ configuration: configToSave });
  },
  
  loadConfiguration: (id) => {
    const config = storageService.loadConfiguration(id);
    if (config) {
      set({ configuration: config });
    }
  },
  
  initializeEmptyConfiguration: () => set({ configuration: createEmptyConfiguration() })
}));
