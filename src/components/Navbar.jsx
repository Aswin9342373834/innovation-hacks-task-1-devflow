import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Sparkles,
} from "lucide-react";
import SearchBar from "./SearchBar";
import { sampleNotifications, currentUser } from "../data/mockData";

export default function Navbar({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onClearSearch,
  activeView = "Dashboard",
  onNavigate,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Left side: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {activeView}
            </h1>
            <p className="hidden sm:block text-[11px] text-slate-400 font-semibold tracking-wide">
              DevFlow Productivity Suite
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-1 sm:mx-4">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onClear={onClearSearch}
            placeholder="Search projects or tasks..."
          />
        </div>

        {/* Right side: Notifications & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              aria-label="View notifications"
              aria-expanded={showNotifications}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifications ({unreadCount})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`px-4 py-3 hover:bg-slate-50 transition-colors ${
                        !item.read ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-slate-900">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              aria-label="User menu"
              aria-expanded={showProfileMenu}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {currentUser.avatar}
              </div>
              <div className="hidden md:block text-left pr-1">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="hidden md:block w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Popover */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                <div className="px-4 pb-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {currentUser.email}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      {currentUser.status} (Task 1 Mode)
                    </span>
                  </div>
                </div>

                <div className="py-1 text-xs text-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigate) onNavigate("Settings");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profile Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigate) onNavigate("Analytics");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-slate-400" />
                    <span>Productivity Insights</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
