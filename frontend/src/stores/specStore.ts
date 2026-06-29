import { create } from 'zustand';
import { fetchSpec, fetchSpecs, uploadSpecFile } from '../domains/spec/api';
import type { RmsSummary, SpecRow } from '../domains/spec/types';

interface SpecState {
  summary: RmsSummary | null;
  specs: SpecRow[];
  selectedAiCode: string | null;
  selectedSpec: SpecRow | null;
  loading: boolean;
  error: string | null;
  loadSpecs: () => Promise<void>;
  fetchSpec: (aiCode: string) => Promise<void>;
  uploadSpec: (file: File) => Promise<void>;
  selectSpec: (aiCode: string) => void;
}

export const useSpecStore = create<SpecState>((set) => ({
  summary: null,
  specs: [],
  selectedAiCode: null,
  selectedSpec: null,
  loading: false,
  error: null,
  loadSpecs: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchSpecs();
      set({ summary: data.summary, specs: data.specs, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },
  fetchSpec: async (aiCode: string) => {
    set({ loading: true, error: null, selectedAiCode: aiCode });
    try {
      const data = await fetchSpec(aiCode);
      set({ selectedSpec: data, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },
  uploadSpec: async (file: File) => {
    set({ loading: true, error: null });
    try {
      const data = await uploadSpecFile(file);
      set({ summary: data.summary, specs: data.specs, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },
  selectSpec: (aiCode: string) => set({ selectedAiCode: aiCode }),
}));
