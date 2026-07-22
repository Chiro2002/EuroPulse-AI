"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

export function LoadingSpinner({ size = "md", text, fullPage = false }: LoadingSpinnerProps) {
  const Spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`relative ${sizeMap[size]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        {/* Outer ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-db-border`}
        />
        {/* Spinning arc */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-transparent border-t-db-accent`}
        />
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-full bg-db-accent/10 animate-pulse" />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-db-text-muted"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        {Spinner}
      </div>
    );
  }

  return Spinner;
}
