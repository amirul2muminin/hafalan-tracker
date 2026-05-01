"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  compare?: number;
  variant?: "default" | "hafalan" | "murojaah";
}

export function StatCard({
  title,
  value,
  subtitle,
  compare,
  variant = "default",
}: StatCardProps) {
  const isPositive = (compare ?? 0) > 0;
  const isNegative = (compare ?? 0) < 0;

  return (
    <div
      className={cn(
        "rounded-2xl border p-3",
        "bg-card text-card-foreground",
        "flex flex-col gap-2",
        "transition-colors",
      )}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{title}</span>

        {compare !== undefined && (
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
              isPositive && "bg-green-500/10 text-green-600",
              isNegative && "bg-red-500/10 text-red-600",
              !isPositive && !isNegative && "bg-muted text-muted-foreground",
            )}
          >
            {compare > 0 ? "↑" : compare < 0 ? "↓" : " "}{" "}
            {Math.abs(compare).toFixed(0)}%
          </span>
        )}
      </div>

      {/* VALUE */}
      <div className="flex items-end justify-between">
        <span className="text-xl font-semibold leading-none">{value}</span>
      </div>

      {/* SUBTITLE */}
      {subtitle && (
        <span className="text-[11px] text-muted-foreground">{subtitle}</span>
      )}
    </div>
  );
}

export default StatCard;
