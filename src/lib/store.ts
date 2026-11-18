import { create } from "zustand";

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  userRole: "admin" | "user" | "provider" | null;
  setUserRole: (role: "admin" | "user" | "provider" | null) => void;
  highVolumeMode: boolean;
  setHighVolumeMode: (enabled: boolean) => void;
  toggleHighVolumeMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) =>
    set((state) => (state.isSidebarOpen === open ? state : { isSidebarOpen: open })),
  userRole: null,
  setUserRole: (role) =>
    set((state) => (state.userRole === role ? state : { userRole: role })),
  highVolumeMode: true,
  setHighVolumeMode: (enabled) =>
    set((state) => (state.highVolumeMode === enabled ? state : { highVolumeMode: enabled })),
  toggleHighVolumeMode: () =>
    set((state) => ({ highVolumeMode: !state.highVolumeMode })),
}));

// Atomic selector hooks to prevent unnecessary React tree re-renders
export const useIsSidebarOpen = () => useAppStore((s) => s.isSidebarOpen);
export const useToggleSidebar = () => useAppStore((s) => s.toggleSidebar);
export const useSetSidebarOpen = () => useAppStore((s) => s.setSidebarOpen);
export const useSetUserRole = () => useAppStore((s) => s.setUserRole);
export const useHighVolumeMode = () => useAppStore((s) => s.highVolumeMode);
export const useToggleHighVolumeMode = () =>
  useAppStore((s) => s.toggleHighVolumeMode);
