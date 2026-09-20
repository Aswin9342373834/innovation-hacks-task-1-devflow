import React from "react";
import {
  FolderKanban,
  CheckSquare,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

const ICON_MAP = {
  FolderKanban,
  CheckSquare,
  CheckCircle2,
  TrendingUp,
};

const COLOR_MAP = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
  },
};

export default function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  icon = "FolderKanban",
  color = "blue",
}) {
  const IconComponent = ICON_MAP[icon] || FolderKanban;
  const colorStyles = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs sm:text-sm font-semibold text-slate-500 tracking-tight">
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-xl ${colorStyles.bg} ${colorStyles.text} border ${colorStyles.border} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-200`}
        >
          <IconComponent className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {trend === "up" && (
            <span className="inline-flex items-center font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
              {change}
            </span>
          )}
          {trend === "down" && (
            <span className="inline-flex items-center font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 text-rose-600" />
              {change}
            </span>
          )}
          {trend === "neutral" && (
            <span className="inline-flex items-center font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              <Minus className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
