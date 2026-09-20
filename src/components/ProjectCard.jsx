import React from "react";
import { Calendar, CheckSquare, ArrowUpRight } from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function ProjectCard({ project, onViewProject }) {
  const {
    name,
    description,
    status,
    progress,
    tasksCount,
    dueDate,
    category,
    team = [],
  } = project;

  // Status badges
  const getStatusBadge = (st) => {
    switch (st) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "Planning":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/80";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Card Header: Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
            {category || "Development"}
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(
              status
            )}`}
          >
            {status}
          </span>
        </div>

        {/* Project Name */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
          {name}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Progress bar container */}
        <div className="mt-5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2 font-medium">
            <span className="text-slate-500 font-semibold">Milestone Progress</span>
            <span className="text-slate-900 font-bold">{progress}%</span>
          </div>
          <ProgressBar progress={progress} size="md" />
        </div>
      </div>

      {/* Card Footer: Metadata & Action */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tasks and Due Date */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{tasksCount} tasks</span>
          </div>
          <span className="text-slate-200">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Due {dueDate}</span>
          </div>
        </div>

        {/* Team Avatars & View Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {team.length > 0 && (
            <div className="flex -space-x-1.5 overflow-hidden">
              {team.slice(0, 3).map((member, i) => (
                <div
                  key={i}
                  title={member.name}
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white ring-2 ring-white shadow-xs ${
                    member.bg || "bg-slate-600"
                  }`}
                >
                  {member.initials}
                </div>
              ))}
              {team.length > 3 && (
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 ring-2 ring-white">
                  +{team.length - 3}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => onViewProject && onViewProject(project)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-white bg-blue-50/70 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            aria-label={`View details for ${name}`}
          >
            <span>View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
