import React from "react";
import { SearchX, RotateCcw } from "lucide-react";

export default function EmptyState({
  title = "No results found",
  message = "Try changing your search or filters.",
  onClearFilters,
  actionLabel = "Clear Filters",
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
        <SearchX className="w-7 h-7" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        {title}
      </h3>

      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
        {message}
      </p>

      {onClearFilters && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (typeof onClearFilters === "function") {
              onClearFilters();
            }
          }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
