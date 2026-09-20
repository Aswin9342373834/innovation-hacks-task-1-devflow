import React from "react";

export default function LoadingState() {
  return (
    <div className="w-full space-y-8 animate-pulse" aria-busy="true" aria-label="Loading dashboard data">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-72 bg-slate-200 rounded"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-9 w-9 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-8 w-20 bg-slate-200 rounded"></div>
            <div className="h-4 w-28 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Projects Skeleton Grid */}
      <div className="space-y-4">
        <div className="h-6 w-32 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 bg-slate-200 rounded"></div>
                <div className="h-4 w-20 bg-slate-200 rounded-full"></div>
              </div>
              <div className="h-5 w-48 bg-slate-200 rounded"></div>
              <div className="h-3 w-full bg-slate-200 rounded"></div>
              <div className="h-2 w-full bg-slate-200 rounded-full"></div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="h-3 w-36 bg-slate-200 rounded"></div>
                <div className="h-6 w-16 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-32 bg-slate-200 rounded"></div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3 w-1/2">
                <div className="w-5 h-5 rounded-full bg-slate-200"></div>
                <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-16 bg-slate-200 rounded-full"></div>
                <div className="h-4 w-14 bg-slate-200 rounded"></div>
                <div className="h-4 w-12 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
