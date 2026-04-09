import { create } from "zustand";
import type { User, Bot, BotFile, BotLog, BotEnv } from "@prisma/client";

export type Page =
  | "landing"
  | "login"
  | "register"
  | "dashboard"
  | "bots"
  | "bot-detail"
  | "files"
  | "logs"
  | "settings"
  | "admin"
  | "admin-users"
  | "admin-bots"
  | "404";

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
  setCurrentPage: (page: Page) => void;
  setSelectedBotId: (id: string | null) => void;
  setUser: (user: any | null) => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: "landing",
  selectedBotId: null,
  user: null,
  isLoading: true,
  sidebarOpen: false,
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedBotId: (id) => set({ selectedBotId: id }),
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
