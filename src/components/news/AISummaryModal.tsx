"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Brain } from "lucide-react";

interface AISummaryModalProps {
  open: boolean;
  onClose: () => void;
  summary: string;
  loading?: boolean;
}

export function AISummaryModal({ open, onClose, summary, loading }: AISummaryModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
          >
            <div className="glass-card p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-db-accent to-blue-400 flex items-center justify-center">
                    <Brain size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-db-text-primary">AI Daily Summary</h3>
                    <p className="text-[10px] text-db-text-muted">Powered by Gemini</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-db-surface transition-colors"
                >
                  <X size={16} className="text-db-text-muted" />
                </button>
              </div>

              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-db-border rounded w-full" />
                  <div className="h-3 bg-db-border rounded w-5/6" />
                  <div className="h-3 bg-db-border rounded w-4/6" />
                  <div className="h-3 bg-db-border rounded w-full" />
                  <div className="h-3 bg-db-border rounded w-3/4" />
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Sparkles size={16} className="text-db-warning mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-db-text-primary leading-relaxed">{summary}</p>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full mt-4 py-2 rounded-lg bg-db-accent text-white text-xs font-medium hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
