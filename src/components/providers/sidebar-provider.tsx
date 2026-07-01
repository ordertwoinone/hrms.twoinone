"use client";

import * as React from "react";

import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_COOKIE = "sidebar_collapsed";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

interface SidebarContextValue {
  /** Desktop rail collapsed to icon-only. */
  collapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (value: boolean) => void;
  /** Mobile slide-over open state. */
  openMobile: boolean;
  setOpenMobile: (value: boolean) => void;
  isMobile: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

/**
 * Owns the sidebar's collapsed (desktop) and open (mobile) state. The initial
 * collapsed value comes from a cookie read on the server (in the dashboard
 * layout), so the first paint matches the user's last choice with no flash. The
 * `Ctrl/Cmd + B` shortcut toggles the rail.
 */
export function SidebarProvider({
  defaultCollapsed = false,
  children,
}: {
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsedState] =
    React.useState<boolean>(defaultCollapsed);
  const [openMobile, setOpenMobile] = React.useState(false);

  const setCollapsed = React.useCallback((value: boolean) => {
    setCollapsedState(value);
    document.cookie = `${SIDEBAR_COOKIE}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`;
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((v) => !v);
    } else {
      setCollapsed(!collapsed);
    }
  }, [isMobile, collapsed, setCollapsed]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSidebar]);

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      toggleSidebar,
      setCollapsed,
      openMobile,
      setOpenMobile,
      isMobile,
    }),
    [collapsed, toggleSidebar, setCollapsed, openMobile, isMobile],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a <SidebarProvider>.");
  }
  return ctx;
}

export { SIDEBAR_COOKIE };
