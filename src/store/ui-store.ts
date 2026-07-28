import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

export const applyThemeToDOM = (theme: ThemeMode) => {
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
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      searchOpen: false,
      notificationOpen: false,
      setTheme: (theme: ThemeMode) => {
        set({ theme });
        applyThemeToDOM(theme);
      },
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      setSearchOpen: (open: boolean) => set({ searchOpen: open }),
      setNotificationOpen: (open: boolean) => set({ notificationOpen: open }),
    }),
    {
      name: 'abs_school_erp_ui_store_v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' && window.localStorage
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyThemeToDOM(state.theme);
        }
      },
    }
  )
);
