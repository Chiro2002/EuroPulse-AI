"use client";

import { useState, useEffect, useCallback } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { DBImpactPanel } from "@/components/layout/DBImpactPanel";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
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

    // Use popstate for browser back/forward
    window.addEventListener("popstate", handleRouteChange);

    // Override pushState to detect SPA navigation
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
    fetchInsight();
  }, [fetchInsight]);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <title>EU Macro Intelligence — Deutsche Bank Risk Advisor</title>
        <meta
          name="description"
          content="AI-Powered Financial Risk Advisor for Deutsche Bank — EU Macro Intelligence Platform"
        />
      </head>
      <body className="flex h-screen overflow-hidden bg-db-navy">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <TopBar alertCount={5} criticalAlertCount={2} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            {children}
          </main>
        </div>

        {/* Right Insight Panel */}
        <DBImpactPanel
          insight={sidebarInsight}
          loading={insightLoading}
          currentPage={currentPage}
        />
      </body>
    </html>
  );
}
