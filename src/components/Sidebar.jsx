import React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Settings,
  X,
  Code2,
  Flame,
} from "lucide-react";
import { currentUser } from "../data/mockData";

export default function Sidebar({
  isOpen = false,
  onClose,
  activeView = "Dashboard",
  onSelectView,
  counts = { projects: 8, tasks: 24 },
}) {
  const navItems = [
    {
      id: "Dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "Projects",
      label: "Projects",
      icon: FolderKanban,
      badge: counts.projects,
    },
    {
      id: "Tasks",
      label: "Tasks",
      icon: CheckSquare,
      badge: counts.tasks,
    },
    {
      id: "Analytics",
      label: "Analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "Settings",
      label: "Settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"
        }`}
      >
        {/* Top: Logo & Close Button */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight">
                  Dev<span className="text-blue-600">Flow</span>
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  PRODUCTIVITY
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" aria-label="Main Navigation">
            <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Workspace
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectView(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-blue-700/70 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Streak banner & User Info */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Streak mini-card */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600 shadow-2xs">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {currentUser.metrics.streakDays} Day Streak
                </p>
                <p className="text-[10px] font-medium text-slate-500">Keep up the rhythm!</p>
              </div>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
