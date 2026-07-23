import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'blue' | 'auto';

interface UIState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  searchOpen: boolean;
  notificationOpen: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setNotificationOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  searchOpen: false,
  notificationOpen: false,
  setTheme: (theme: ThemeMode) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('dark', 'theme-blue');
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'blue') {
        root.classList.add('theme-blue');
      } else if (theme === 'auto') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        }
      }
    }
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  setSearchOpen: (open: boolean) => set({ searchOpen: open }),
  setNotificationOpen: (open: boolean) => set({ notificationOpen: open }),
}));
