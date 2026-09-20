import React from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({
  value = "",
  onChange,
  onClear,
  placeholder = "Search projects or tasks...",
  className = "",
}) {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && onClear) {
            onClear();
          }
        }}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 shadow-2xs"
        aria-label={placeholder}
      />

      {value && (
        <button
          type="button"
          onClick={() => onClear && onClear()}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
