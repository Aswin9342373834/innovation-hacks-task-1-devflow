import React from "react";

/**
 * Reusable ProgressBar component
 * Supports dynamic percentage values (0-100), dynamic color styling based on progress or prop,
 * and standard accessibility aria attributes.
 */
export default function ProgressBar({
  progress = 0,
  size = "md",
  showLabel = false,
  color,
  className = "",
}) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  // Determine height based on size
  const heightClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }[size] || "h-2";

  // Determine progress bar fill color
  const getBarColor = () => {
    if (color) return color;
    if (clampedProgress >= 100) return "bg-emerald-500";
    if (clampedProgress >= 70) return "bg-blue-600";
    if (clampedProgress >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
          <span>Progress</span>
          <span className="text-slate-900 font-semibold">{clampedProgress}%</span>
        </div>
      )}
      <div
        className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses}`}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${clampedProgress}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor()}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
