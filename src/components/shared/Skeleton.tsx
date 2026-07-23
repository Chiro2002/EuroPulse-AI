// ─── Base Skeleton Primitive ──────────────────────────────────────────
export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`bg-gray-200/60 rounded-lg animate-pulse ${className}`}
      style={style}
    />
  );
}

// ─── Line placeholder ─────────────────────────────────────────────────
export function SkeletonLine({ width = "100%", height = "h-3" }: { width?: string; height?: string }) {
  return <Skeleton className={`${height} ${width}`} />;
}

// ─── Card with lines ──────────────────────────────────────────────────
export function SkeletonCardContent({ lines = 3, lastLineWidth = "w-2/3" }: { lines?: number; lastLineWidth?: string }) {
  return (
    <div className="space-y-2.5">
      <SkeletonLine height="h-3" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <SkeletonLine key={i} height="h-3" width={i === lines - 2 ? lastLineWidth : "w-full"} />
      ))}
    </div>
  );
}

// ─── Chart placeholder ────────────────────────────────────────────────
export function SkeletonChart({ height = "h-48" }: { height?: string }) {
  return <Skeleton className={`w-full ${height}`} />;
}

// ─── Metric Card ──────────────────────────────────────────────────────
export function SkeletonMetricCard() {
  return (
    <div className="bg-white rounded-xl border border-border p-3">
      <SkeletonLine width="w-2/3" height="h-2.5" />
      <div className="mt-2 flex items-end justify-between">
        <SkeletonLine width="w-16" height="h-6" />
        <SkeletonLine width="w-12" height="h-4" />
      </div>
      <div className="mt-2">
        <SkeletonChart height="h-8" />
      </div>
    </div>
  );
}

// ─── Event Item ───────────────────────────────────────────────────────
export function SkeletonEventItem() {
  return (
    <div className="bg-white rounded-xl border border-border p-3 flex items-start gap-2">
      <Skeleton className="w-6 h-6 rounded-md flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="w-full" height="h-3" />
        <SkeletonLine width="w-1/3" height="h-3" />
        <div className="flex gap-2">
          <SkeletonLine width="w-12" height="h-3" />
          <SkeletonLine width="w-16" height="h-3" />
        </div>
      </div>
    </div>
  );
}

// ─── News Card Skeleton ──────────────────────────────────────────────
export function SkeletonNewsCard() {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-16 h-5 rounded-sm" />
        <SkeletonLine width="w-20" height="h-3" />
      </div>
      <SkeletonLine width="w-3/4" height="h-5" />
      <div className="mt-3 grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <SkeletonLine width="w-20" height="h-2.5" />
          <SkeletonLine width="w-full" height="h-3" />
          <SkeletonLine width="w-4/5" height="h-3" />
        </div>
        <div className="space-y-1.5">
          <SkeletonLine width="w-20" height="h-2.5" />
          <SkeletonLine width="w-full" height="h-3" />
          <SkeletonLine width="w-3/5" height="h-3" />
        </div>
        <div className="space-y-1.5">
          <SkeletonLine width="w-20" height="h-2.5" />
          <SkeletonLine width="w-full" height="h-3" />
          <SkeletonLine width="w-2/3" height="h-3" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <SkeletonLine width="w-16" height="h-3" />
          <SkeletonLine width="w-20" height="h-3" />
        </div>
        <Skeleton className="w-24 h-7 rounded-md" />
      </div>
    </div>
  );
}

// ─── Forecast Card Skeleton ──────────────────────────────────────────
export function SkeletonForecastCard() {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1.5">
          <SkeletonLine width="w-28" height="h-4" />
          <SkeletonLine width="w-16" height="h-2.5" />
        </div>
        <Skeleton className="w-20 h-5 rounded-sm" />
      </div>
      <SkeletonChart height="h-40" />
      <div className="mt-3 space-y-2">
        <SkeletonLine width="w-24" height="h-2.5" />
        <SkeletonLine width="w-full" height="h-3" />
        <SkeletonLine width="w-4/5" height="h-3" />
      </div>
    </div>
  );
}

// ─── KPI Bar Skeleton (for Risk/Forecast top insight bars) ────────────
export function SkeletonKPIInsight() {
  return (
    <div className="bg-white rounded-xl border border-border p-3">
      <SkeletonLine width="w-2/3" height="h-2.5" />
      <div className="mt-1">
        <SkeletonLine width="w-12" height="h-4" />
      </div>
    </div>
  );
}

// ─── Deep Dive Panel Skeleton ─────────────────────────────────────────
export function SkeletonDeepDive() {
  return (
    <div className="bg-white rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5">
          <SkeletonLine width="w-24" height="h-4" />
          <SkeletonLine width="w-32" height="h-3" />
        </div>
      </div>
      <SkeletonChart height="h-40" />
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-1">
            <SkeletonLine width="w-12" height="h-2" />
            <SkeletonLine width="w-8" height="h-4" />
          </div>
        ))}
      </div>
      <SkeletonCardContent lines={4} />
    </div>
  );
}

// ─── Market Pulse Section Skeleton ────────────────────────────────────
export function SkeletonMarketPulse() {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <SkeletonLine width="w-32" height="h-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <SkeletonLine width="w-16" height="h-2.5" />
            <div className="mt-2 space-y-3">
              <SkeletonChart height="h-14" />
              <SkeletonChart height="h-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
