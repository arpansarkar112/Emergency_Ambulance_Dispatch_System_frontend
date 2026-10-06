import { create } from 'zustand';

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  userRole: 'admin' | 'user' | 'provider' | null;
  setUserRole: (role: 'admin' | 'user' | 'provider' | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  userRole: null,
  setUserRole: (role) => set({ userRole: role }),
}));
