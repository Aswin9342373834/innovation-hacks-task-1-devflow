import React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Sparkles,
  Settings,
  X,
  Code2,
  Flame,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({
  isOpen = false,
  onClose,
  activeView = "Dashboard",
  onSelectView,
  counts = { projects: 0, tasks: 0 },
}) {
  const { user, logout } = useAuth();

  const userAvatar = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DF";

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
      badge: counts.projects !== undefined ? counts.projects : null,
    },
    {
      id: "Tasks",
      label: "Tasks",
      icon: CheckSquare,
      badge: counts.tasks !== undefined ? counts.tasks : null,
    },
    {
      id: "AIAssistant",
      label: "AI Assistant",
      icon: Sparkles,
      badge: "AI",
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
                  AI PLATFORM
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
                          : item.badge === "AI"
                          ? "bg-amber-100 text-amber-700 font-extrabold"
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
                  Task 4 Active
                </p>
                <p className="text-[10px] font-medium text-slate-500">MongoDB Atlas Live</p>
              </div>
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                {userAvatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || "DevFlow User"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate capitalize">
                  {user?.role || "Developer"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
