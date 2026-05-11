import { create } from "zustand";

type AuthMode = "real" | "fiction" | null;

interface AuthState {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  mode: null,
  setMode: (mode) => set({ mode }),
  logout: () => set({ mode: null }),
}));
