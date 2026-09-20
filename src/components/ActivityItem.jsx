import React from "react";
import {
  CheckCircle2,
  FolderPlus,
  AlertTriangle,
  TrendingUp,
  FileText,
  GitPullRequest,
  Clock,
} from "lucide-react";

const ICON_MAP = {
  CheckCircle2,
  FolderPlus,
  AlertTriangle,
  TrendingUp,
  FileText,
  GitPullRequest,
};

export default function ActivityItem({ activity, isLast = false }) {
  const { description, timestamp, icon, iconColor } = activity;
  const IconComponent = ICON_MAP[icon] || Clock;

  return (
    <div className="relative flex items-start gap-3 py-3 group">
      {/* Connecting line */}
      {!isLast && (
        <span
          className="absolute left-4 top-8 bottom-0 w-px bg-slate-200"
          aria-hidden="true"
        />
      )}

      {/* Icon node */}
      <div
        className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${
          iconColor || "text-slate-600 bg-slate-50 border-slate-200"
        }`}
      >
        <IconComponent className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs sm:text-sm text-slate-800 font-medium leading-snug">
          {description}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
          <span>{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
