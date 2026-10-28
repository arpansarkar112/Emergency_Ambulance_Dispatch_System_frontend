import { create } from 'zustand';

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  userRole: 'admin' | 'user' | 'provider' | null;
  setUserRole: (role: 'admin' | 'user' | 'provider' | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  userRole: null,
  setUserRole: (role) => set({ userRole: role }),
}));
