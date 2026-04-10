import { create } from "zustand";

export type Page =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "bots"
  | "bot-detail"
  | "bot-console"
  | "bot-monitoring"
  | "files"
  | "logs"
  | "realtime-logs"
  | "activity"
  | "settings"
  | "help"
  | "admin"
  | "admin-users"
  | "admin-bots"
  | "bot-analytics"
  | "api-keys"
  | "webhooks"
  | "deployment-history"
  | "bot-health"
  | "team"
  | "dev-admin"
  | "api-docs"
  | "changelog"
  | "privacy"
  | "terms"
  | "404";

export type Theme = 'dark' | 'light';

export interface UserInfo {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  plan?: string;
  avatarUrl?: string | null;
}

interface AppState {
  currentPage: Page;
  selectedBotId: string | null;
  user: UserInfo | null;
  isLoading: boolean;
  sidebarOpen: boolean;
  unreadNotifications: number;
  notificationPanelOpen: boolean;
  commandPaletteOpen: boolean;
  theme: Theme;
  setCurrentPage: (page: Page) => void;
  setSelectedBotId: (id: string | null) => void;
  setUser: (user: UserInfo | null) => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setUnreadNotifications: (count: number) => void;
  setNotificationPanelOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: "landing",
  selectedBotId: null,
  user: null,
  isLoading: true,
  sidebarOpen: false,
  unreadNotifications: 0,
  notificationPanelOpen: false,
  commandPaletteOpen: false,
  theme: 'dark',
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedBotId: (id) => set({ selectedBotId: id }),
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setTheme: (theme) => set({ theme }),
}));
