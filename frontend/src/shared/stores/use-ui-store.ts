import { create } from "zustand";

export interface Notice { id: number; tone: "success" | "error" | "info"; message: string; }
interface UiState { notices: Notice[]; notify: (message: string, tone?: Notice["tone"]) => void; dismiss: (id: number) => void; }

export const useUiStore = create<UiState>((set) => ({
  notices: [],
  notify: (message, tone = "success") => set((state) => ({ notices: [...state.notices, { id: Date.now(), tone, message }] })),
  dismiss: (id) => set((state) => ({ notices: state.notices.filter((notice) => notice.id !== id) })),
}));
