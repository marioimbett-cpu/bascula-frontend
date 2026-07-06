import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  tone?: "default" | "success" | "warning" | "destructive";
}

const TONE_ICON_BG: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  success: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  destructive: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export function StatCard({ label, value, icon, trend, tone = "default" }: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <Card className="transition-shadow hover:shadow-popover">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-1.5 flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-success" : "text-destructive"
              )}
            >
              {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />}
              {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", TONE_ICON_BG[tone])}>{icon}</div>
      </CardContent>
    </Card>
  );
}
