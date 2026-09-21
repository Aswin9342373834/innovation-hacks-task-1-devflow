import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  ArrowRight,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import aiService from '../services/aiService';
import projectService from '../services/projectService';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function AIAssistantView({ onNavigateToTasks }) {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'insights'

  // Projects list for target selector
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Generator states
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [selectedTaskIndices, setSelectedTaskIndices] = useState(new Set());
  const [providerInfo, setProviderInfo] = useState('');
  const [generatorError, setGeneratorError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Productivity Insights states
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState('');

  // Preset sample prompts
  const samplePrompts = [
    'Build an e-commerce mobile application with shopping cart and payment gateway',
    'Design and implement secure JWT authentication with password hashing & OAuth',
    'Develop real-time collaborative task board with drag-and-drop Kanban workflow',
    'Set up automated CI/CD pipeline, Docker containerization, and cloud deployment on Render',
  ];

  // Load user's projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAllProjects();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0]._id || data[0].id);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch productivity insights when tab is active
  const fetchProductivityInsights = async (projectId = null) => {
    setLoadingInsights(true);
    setInsightsError('');
    try {
      const data = await aiService.getProductivitySuggestions(projectId || undefined);
      setInsights(data);
    } catch (err) {
      setInsightsError(err.message || 'Failed to generate productivity insights.');
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'insights') {
      fetchProductivityInsights(selectedProjectId);
    }
  }, [activeTab, selectedProjectId]);

  // Handle AI task generation
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || prompt.trim().length < 3) {
      setGeneratorError('Please enter a descriptive project goal or feature.');
      return;
    }

    setGeneratorError('');
    setSaveSuccessMessage('');
    setIsGenerating(true);

    try {
      const res = await aiService.generateTasks(prompt.trim(), selectedProjectId || null);
      const tasks = res.tasks || [];
      setGeneratedTasks(tasks);
      setProviderInfo(res.provider || 'Google Gemini');
      // Auto-select all generated tasks by default
      setSelectedTaskIndices(new Set(tasks.map((_, i) => i)));
    } catch (err) {
      setGeneratorError(err.message || 'Failed to generate tasks with AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle selection of an individual task
  const toggleTaskSelection = (index) => {
    setSelectedTaskIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedTaskIndices.size === generatedTasks.length) {
      setSelectedTaskIndices(new Set());
    } else {
      setSelectedTaskIndices(new Set(generatedTasks.map((_, i) => i)));
    }
  };

  // Edit task details inline
  const updateTaskField = (index, field, value) => {
    setGeneratedTasks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Save selected tasks to MongoDB via backend endpoint
  const handleSaveSelectedTasks = async () => {
    if (!selectedProjectId) {
      setGeneratorError('Please select a target project before saving tasks.');
      return;
    }

    const tasksToSave = generatedTasks.filter((_, idx) => selectedTaskIndices.has(idx));
    if (tasksToSave.length === 0) {
      setGeneratorError('Please select at least one task to save.');
      return;
    }

    setIsSaving(true);
    setGeneratorError('');
    try {
      const res = await aiService.saveTasks(selectedProjectId, tasksToSave);
      setSaveSuccessMessage(
        `Successfully saved ${res.savedCount} task(s) to project "${res.projectName}" in MongoDB!`
      );
      // Remove saved tasks from review list
      setGeneratedTasks((prev) => prev.filter((_, idx) => !selectedTaskIndices.has(idx)));
      setSelectedTaskIndices(new Set());
    } catch (err) {
      setGeneratorError(err.message || 'Failed to save tasks to database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> DevFlow AI Intelligence Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            AI-Powered Task Generator & Productivity Engine
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Transform high-level feature goals into structured, actionable engineering tasks.
            Powered by Google Gemini with domain-aware heuristic resilience.
          </p>

          {/* Tab Navigation */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'generator'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Bot className="w-4 h-4" />
              AI Task Generator
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'insights'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Productivity Suggestions
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: AI Task Generator */}
      {activeTab === 'generator' && (
        <div className="space-y-8">
          {/* Input Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  Describe Project Goal or Feature
                </h2>
                <p className="text-xs text-slate-500">
                  DevFlow AI will decompose your objective into 4–8 concrete engineering tasks.
                </p>
              </div>

              {/* Target Project Dropdown */}
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Attach to:</span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={loadingProjects || projects.length === 0}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {projects.length === 0 ? (
                    <option value="">No projects available (Create one first)</option>
                  ) : (
                    projects.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Error or Success alerts */}
            {generatorError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{generatorError}</span>
              </div>
            )}

            {saveSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2.5 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
                {onNavigateToTasks && (
                  <button
                    type="button"
                    onClick={onNavigateToTasks}
                    className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    View in Tasks <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Prompt textarea */}
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Build an e-commerce mobile application with cart, payment integration, and push notifications..."
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Sample Prompt Chips */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Examples (Click to apply)
                </p>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(sample)}
                      className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 text-xs font-medium border border-slate-200 transition-colors cursor-pointer text-left"
                    >
                      {sample.length > 55 ? `${sample.slice(0, 55)}...` : sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing Tasks with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Generate Tasks</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Generated Tasks Review Section */}
          {generatedTasks.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-slate-900">
                      Generated Tasks for Review ({generatedTasks.length})
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                      {providerInfo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review and edit tasks before persisting them to MongoDB.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {selectedTaskIndices.size === generatedTasks.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSelectedTasks}
                    disabled={isSaving || selectedTaskIndices.size === 0 || !selectedProjectId}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving to MongoDB...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save ({selectedTaskIndices.size}) to Project</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                {generatedTasks.map((task, index) => {
                  const isSelected = selectedTaskIndices.has(index);

                  return (
                    <div
                      key={index}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/40 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTaskSelection(index)}
                          className="mt-1.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => updateTaskField(index, 'title', e.target.value)}
                              className="w-full font-bold text-slate-900 text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors py-0.5"
                            />

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  task.priority === 'high'
                                    ? 'bg-rose-100 text-rose-700'
                                    : task.priority === 'medium'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {task.priority}
                              </span>

                              {task.estimatedHours && (
                                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  ~{task.estimatedHours}h
                                </span>
                              )}
                            </div>
                          </div>

                          <textarea
                            rows={2}
                            value={task.description}
                            onChange={(e) => updateTaskField(index, 'description', e.target.value)}
                            className="w-full text-xs text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors py-0.5 resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI Productivity Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                Live Sprint Productivity Insights
              </h2>
              <p className="text-xs text-slate-500">
                AI analysis of task velocity, bottlenecks, and recommended prioritization.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  fetchProductivityInsights(e.target.value);
                }}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">All Projects Overview</option>
                {projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => fetchProductivityInsights(selectedProjectId)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Refresh insights"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loadingInsights ? (
            <LoadingState message="Analyzing project tasks and calculating AI suggestions..." />
          ) : insightsError ? (
            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {insightsError}
            </div>
          ) : insights ? (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <p className="text-xs text-slate-500 font-semibold">Total Tasks</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {insights.metrics?.total || 0}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <p className="text-xs text-emerald-600 font-semibold">Completion Rate</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    {insights.metrics?.completionRate || 0}%
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <p className="text-xs text-rose-600 font-semibold">High Priority</p>
                  <p className="text-2xl font-black text-rose-600 mt-1">
                    {insights.metrics?.highPriorityPending || 0}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <p className="text-xs text-amber-600 font-semibold">In Progress</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {insights.metrics?.inProgress || 0}
                  </p>
                </div>
              </div>

              {/* Suggestions Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.suggestions?.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {item.badge}
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No Task Data Found"
              description="Create some tasks in this project or generate them using the AI Task Generator to unlock productivity suggestions."
            />
          )}
        </div>
      )}
    </div>
  );
}
