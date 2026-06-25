import { create } from 'zustand';
import type { RmsSummary, SpecRow } from '../types/domain';

interface SpecState {
  summary: RmsSummary | null;
  specs: SpecRow[];
  selectedSpec: SpecRow | null;
  loading: boolean;
  error: string | null;
  fetchSpecs: () => Promise<void>;
  fetchSpec: (aiCode: string) => Promise<void>;
  uploadSpecFile: (file: File) => Promise<void>;
}

const API_BASE = 'http://localhost:8000/api';

export const useSpecStore = create<SpecState>((set) => ({
  summary: null,
  specs: [],
  selectedSpec: null,
  loading: false,
  error: null,

  async fetchSpecs() {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/specs`);
      if (!response.ok) throw new Error('Failed to fetch specs');
      const data = await response.json();
      set({ summary: data.summary, specs: data.specs ?? [], loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  async fetchSpec(aiCode: string) {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/specs/${aiCode}`);
      if (!response.ok) throw new Error('Failed to fetch spec');
      const data = await response.json();
      set({ selectedSpec: data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  async uploadSpecFile(file: File) {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE}/spec/upload`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to upload spec JSON');
      const data = await response.json();
      set({ summary: data.summary, specs: data.specs ?? [], loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
}));
