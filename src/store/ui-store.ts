import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'blue' | 'auto';

export interface CompanyProfile {
  schoolName: string;
  schoolLogo: string;
  address: string;
  pincode: string;
  gstin: string;
  phone: string;
  email: string;
  website: string;
  academicYear: string;
  currency: string;
  timeZone: string;
  affiliationNo: string;
  authorizedSignatoryTitle: string;
}

export const defaultCompanyProfile: CompanyProfile = {
  schoolName: 'ABS MATRICULATION HIGHER SECONDARY SCHOOL',
  schoolLogo: '',
  address: '124, Education Boulevard, Knowledge City, Chennai, Tamil Nadu',
  pincode: '600001',
  gstin: '33AAAAA0000A1Z5',
  phone: '+91 44 2800 1122 / +91 98765 43210',
  email: 'info@absschool.edu.in',
  website: 'www.absschool.edu.in',
  academicYear: '2025 - 2026',
  currency: 'INR (₹)',
  timeZone: 'Asia/Kolkata (IST)',
  affiliationNo: 'AFF-TN-2026-99',
  authorizedSignatoryTitle: 'Authorized Finance Officer & Principal',
};

interface UIState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  searchOpen: boolean;
  notificationOpen: boolean;
  companyProfile: CompanyProfile;
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setNotificationOpen: (open: boolean) => void;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
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
      companyProfile: defaultCompanyProfile,
      setTheme: (theme: ThemeMode) => {
        set({ theme });
        applyThemeToDOM(theme);
      },
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      setSearchOpen: (open: boolean) => set({ searchOpen: open }),
      setNotificationOpen: (open: boolean) => set({ notificationOpen: open }),
      updateCompanyProfile: (profile) =>
        set((state) => ({
          companyProfile: { ...state.companyProfile, ...profile },
        })),
    }),
    {
      name: 'abs_school_erp_ui_store_v2',
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
        companyProfile: state.companyProfile,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyThemeToDOM(state.theme);
        }
      },
    }
  )
);
