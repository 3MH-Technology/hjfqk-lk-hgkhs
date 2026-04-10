import { create } from "zustand";
import type { User, Bot, BotFile, BotLog, BotEnv } from "@prisma/client";

export type Page =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "bots"
  | "bot-detail"
  | "bot-console"
  | "bot-templates"
  | "bot-monitoring"
  | "files"
  | "logs"
  | "activity"
  | "settings"
  | "help"
  | "admin"
  | "admin-users"
  | "admin-bots"
  | "bot-comparison"
  | "bot-analytics"
  | "api-keys"
  | "webhooks"
  | "deployment-history"
  | "404";

export type Theme = 'dark' | 'light';

interface AppState {
  currentPage: Page;
  selectedBotId: string | null;
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  } | null;
  isLoading: boolean;
  sidebarOpen: boolean;
  unreadNotifications: number;
  notificationPanelOpen: boolean;
  commandPaletteOpen: boolean;
  theme: Theme;
  setCurrentPage: (page: Page) => void;
  setSelectedBotId: (id: string | null) => void;
  setUser: (user: any | null) => void;
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
