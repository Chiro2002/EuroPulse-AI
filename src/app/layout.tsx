"use client";

import { useState, useEffect, useCallback } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TopBar } from "@/components/layout/TopBar";
import { DBImpactPanel } from "@/components/layout/DBImpactPanel";
import { motion, AnimatePresence } from "framer-motion";
import type { SidebarInsight } from "@/lib/types";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarInsight, setSidebarInsight] = useState<SidebarInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [panelOpen, setPanelOpen] = useState(true);

  // Track current page from URL
  useEffect(() => {
    const path = window.location.pathname.replace("/", "") || "dashboard";
    setCurrentPage(path);
  }, []);

  // Listen for page changes
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname.replace("/", "") || "dashboard";
      setCurrentPage(path);
    };

    window.addEventListener("popstate", handleRouteChange);

    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      history.pushState = originalPushState;
    };
  }, []);

  // Fetch sidebar insight
  const fetchInsight = useCallback(async () => {
    setInsightLoading(true);
    try {
      const response = await fetch(`/api/sidebar?page=${currentPage}`);
      const data = await response.json();
      setSidebarInsight(data.insight);
    } catch (error) {
      console.error("Failed to fetch sidebar insight:", error);
    } finally {
      setInsightLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    // Skip fetching sidebar on pages that have built-in sidebars (forecast, simulator)
    if (currentPage === "forecast" || currentPage === "simulator") {
      setInsightLoading(false);
      return;
    }
    fetchInsight();
  }, [fetchInsight, currentPage]);

  const togglePanel = () => {
    setPanelOpen((prev) => !prev);
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <title>EuroPulse AI — EU Macro Intelligence Platform</title>
        <meta
          name="description"
          content="AI-Powered EU Macro Risk Intelligence Platform for Enterprise Banking"
        />
      </head>
      <body className="flex h-screen overflow-hidden bg-page">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation Bar */}
          <TopBar
            alertCount={5}
            criticalAlertCount={2}
            panelOpen={panelOpen}
            onTogglePanel={togglePanel}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            {children}
          </main>
        </div>

        {/* Right Sidebar Panel — 320px fixed width, slide in/out */}
        {/* Hidden on mobile (< lg) - use panel toggle only on desktop */}
        {/* Hidden on forecast and simulator pages — they have their own built-in sidebars */}
        <AnimatePresence initial={false}>
          {panelOpen && currentPage !== "forecast" && currentPage !== "simulator" && (
            <motion.div
              key="impact-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="hidden lg:block overflow-hidden flex-shrink-0 border-l border-gray-200/80"
            >
              <div className="w-[320px] h-full">
                <DBImpactPanel
                  insight={sidebarInsight}
                  loading={insightLoading}
                  currentPage={currentPage}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {panelOpen && currentPage !== "forecast" && currentPage !== "simulator" && (
            <motion.div
              key="mobile-sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setPanelOpen(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-0 bottom-0 w-[320px] max-w-[85vw]"
              >
                <DBImpactPanel
                  insight={sidebarInsight}
                  loading={insightLoading}
                  currentPage={currentPage}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </body>
    </html>
  );
}
