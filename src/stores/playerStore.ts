import { create } from 'zustand';
import { Player } from '../types';

interface PlayerStore {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  players: [],
  
  setPlayers: (players) => set({ players }),
  
  addPlayer: (player) => set((state) => ({
    players: [...state.players, player]
  })),
  
  removePlayer: (id) => set((state) => ({
    players: state.players.filter(p => p.id !== id)
  })),
  
  updatePlayer: (id, updates) => set((state) => ({
    players: state.players.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
  }))
}));
