import { create } from 'zustand';
import { GuildBattleData, ViewMode, SortConfig, FilterConfig } from '../types';

interface BattleDataStore {
  guildData: GuildBattleData[];
  viewMode: ViewMode;
  sortConfig: SortConfig | null;
  filterConfig: FilterConfig;
  setGuildData: (data: GuildBattleData[]) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortConfig: (config: SortConfig | null) => void;
  setFilterConfig: (config: FilterConfig) => void;
}

export const useBattleDataStore = create<BattleDataStore>((set) => ({
  guildData: [],
  viewMode: 'guild',
  sortConfig: null,
  filterConfig: {},
  
  setGuildData: (data) => set({ guildData: data }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortConfig: (config) => set({ sortConfig: config }),
  setFilterConfig: (config) => set({ filterConfig: config }),
}));
