import { create } from 'zustand';
import { ImageFile, ComparisonResult, ComparisonState } from '../types/comparison';

interface ComparisonStore extends ComparisonState {
  // Actions
  setGroup1Images: (images: ImageFile[]) => void;
  setGroup2Images: (images: ImageFile[]) => void;
  addGroup1Image: (image: ImageFile) => void;
  addGroup2Image: (image: ImageFile) => void;
  removeGroup1Image: (id: string) => void;
  removeGroup2Image: (id: string) => void;
  
  setGroup1Names: (names: string[]) => void;
  setGroup2Names: (names: string[]) => void;
  
  setRecognizing: (isRecognizing: boolean) => void;
  setRecognitionProgress: (current: number, total: number) => void;
  setRecognitionError: (error: string | null) => void;
  
  setComparisonResult: (result: ComparisonResult | null) => void;
  
  compareNames: () => void;
  reset: () => void;
}

export const useComparisonStore = create<ComparisonStore>((set, get) => ({
  // Initial state
  group1Images: [],
  group2Images: [],
  group1Names: [],
  group2Names: [],
  isRecognizing: false,
  recognitionProgress: { current: 0, total: 0 },
  recognitionError: null,
  comparisonResult: null,
  
  // Actions
  setGroup1Images: (images) => set({ group1Images: images }),
  setGroup2Images: (images) => set({ group2Images: images }),
  
  addGroup1Image: (image) => set((state) => ({
    group1Images: [...state.group1Images, image]
  })),
  
  addGroup2Image: (image) => set((state) => ({
    group2Images: [...state.group2Images, image]
  })),
  
  removeGroup1Image: (id) => set((state) => ({
    group1Images: state.group1Images.filter(img => img.id !== id)
  })),
  
  removeGroup2Image: (id) => set((state) => ({
    group2Images: state.group2Images.filter(img => img.id !== id)
  })),
  
  setGroup1Names: (names) => set({ group1Names: names }),
  setGroup2Names: (names) => set({ group2Names: names }),
  
  setRecognizing: (isRecognizing) => set({ isRecognizing }),
  setRecognitionProgress: (current, total) => set({
    recognitionProgress: { current, total }
  }),
  setRecognitionError: (error) => set({ recognitionError: error }),
  
  setComparisonResult: (result) => set({ comparisonResult: result }),
  
  compareNames: () => {
    const { group1Names, group2Names } = get();
    
    // 使用 Set 进行对比
    const set1 = new Set(group1Names);
    const set2 = new Set(group2Names);
    
    const result: ComparisonResult = {
      common: group1Names.filter(name => set2.has(name)),
      onlyInGroup1: group1Names.filter(name => !set2.has(name)),
      onlyInGroup2: group2Names.filter(name => !set1.has(name)),
    };
    
    set({ comparisonResult: result });
  },
  
  reset: () => set({
    group1Images: [],
    group2Images: [],
    group1Names: [],
    group2Names: [],
    isRecognizing: false,
    recognitionProgress: { current: 0, total: 0 },
    recognitionError: null,
    comparisonResult: null,
  }),
}));
