import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-300">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={handleClearSearch}
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* Dashboard Main View */}
        <main className="flex-1 pb-16">
          <Dashboard
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
            activeView={activeView}
            onNavigate={(view) => {
              setActiveView(view);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </main>

        {/* Professional Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <strong className="text-slate-700">DevFlow</strong> • Innovation Hacks Full Stack Development Internship (Task 1)
            </div>
            <div>
              Engineered by <span className="font-semibold text-slate-800">Aswin Muthaiya</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
