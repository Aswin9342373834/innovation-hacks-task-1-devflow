import React from "react";
import { X } from "lucide-react";

export default function FilterBar({
  statusFilter = "All",
  onStatusChange,
  priorityFilter = "All",
  onPriorityChange,
  onClearFilters,
  hasActiveFilters = false,
  totalResultsCount = 0,
}) {
  const statusOptions = ["All", "Todo", "In Progress", "Done"];
  const priorityOptions = ["All", "Low", "Medium", "High"];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          {statusOptions.map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => onStatusChange(st)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
                aria-pressed={isActive}
              >
                {st}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:block w-px h-4 bg-slate-200" />

        {/* Priority Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Priority:
          </span>
          {priorityOptions.map((pr) => {
            const isActive = priorityFilter === pr;
            return (
              <button
                key={pr}
                onClick={() => onPriorityChange(pr)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
                aria-pressed={isActive}
              >
                {pr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right side: Count & Clear Filters button */}
      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        <span className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800">{totalResultsCount}</strong> tasks
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-2.5 py-1 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
