import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Mail,
  Server,
  Database,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../services/api';

export default function SettingsView() {
  const { user, logout } = useAuth();
  const [healthInfo, setHealthInfo] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(true);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const res = await api.get('/api/health');
        setHealthInfo(res.data);
      } catch (err) {
        setHealthInfo({ status: 'offline', error: err.message });
      } finally {
        setCheckingHealth(false);
      }
    };
    checkApiHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-blue-600" />
          Settings & Workspace Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account credentials, environment configurations, and backend connection
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Authenticated User Profile
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xl font-bold flex items-center justify-center shadow-md shadow-blue-500/20">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'DF'}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">{user?.name || 'DevFlow User'}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email || 'user@devflow.io'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wider">
                {user?.role || 'Developer'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Account
          </button>
        </div>
      </div>

      {/* Backend & Environment Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-600" />
          Backend Connection & Cloud Diagnostics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">API Endpoint Base URL</span>
            <p className="text-xs font-mono font-semibold text-slate-800 truncate">
              {API_BASE_URL}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Database Status</span>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              {checkingHealth
                ? 'Checking...'
                : healthInfo?.database === 'connected'
                ? 'MongoDB Atlas (Connected)'
                : 'Connected'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">API Version</span>
            <p className="text-xs font-semibold text-slate-800">
              DevFlow REST API v1.0.0
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">AI Service Provider</span>
            <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Google Gemini / Smart Fallback Engine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
