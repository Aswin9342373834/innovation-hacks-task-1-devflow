import React from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  message = "Unable to load dashboard data.",
  onRetry,
}) {
  return (
    <div className="bg-white rounded-2xl border border-rose-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center my-6 shadow-sm max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
        <AlertOctagon className="w-7 h-7" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
        {title}
      </h3>

      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof onRetry === "function") {
              onRetry();
            }
          }}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
