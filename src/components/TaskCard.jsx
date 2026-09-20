import React from "react";
import { CheckCircle2, Circle, Clock, Calendar } from "lucide-react";

export default function TaskCard({ task, onToggleStatus, onSelectTask }) {
  const { id, title, projectName, status, priority, dueDate, assignee } = task;

  // Status styling
  const getStatusBadge = (st) => {
    switch (st) {
      case "Done":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case "In Progress":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200/80",
          icon: <Clock className="w-3.5 h-3.5 text-blue-600" />,
        };
      case "Todo":
      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200/80",
          icon: <Circle className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  // Priority styling
  const getPriorityBadge = (pr) => {
    switch (pr) {
      case "High":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "Low":
      default:
        return "bg-slate-100 text-slate-600 border-slate-200/80";
    }
  };

  const statusInfo = getStatusBadge(status);
  const isDone = status === "Done";

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 p-4 hover:border-slate-300 hover:shadow-sm transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Left: Interactive Checkbox & Title */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onToggleStatus && onToggleStatus(id)}
          className="mt-0.5 sm:mt-0 flex-shrink-0 text-slate-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-0.5 transition-colors cursor-pointer"
          title={`Click to cycle status: currently ${status}`}
          aria-label={`Toggle status for task: ${title}`}
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 transition-transform active:scale-90" />
          ) : (
            <Circle className="w-5 h-5 text-slate-300 hover:text-blue-600 group-hover:border-slate-400 transition-transform active:scale-90" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              onClick={() => onSelectTask && onSelectTask(task)}
              className={`text-sm font-semibold cursor-pointer transition-colors ${
                isDone
                  ? "line-through text-slate-400 hover:text-slate-600"
                  : "text-slate-900 hover:text-blue-600"
              }`}
            >
              {title}
            </h4>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
              {projectName}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Badges, Due Date & Assignee */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end pl-8 sm:pl-0">
        {/* Status Badge */}
        <button
          type="button"
          onClick={() => onToggleStatus && onToggleStatus(id)}
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border transition-all active:scale-95 cursor-pointer shadow-2xs hover:brightness-95 ${statusInfo.bg}`}
          title="Click to toggle status"
        >
          {statusInfo.icon}
          <span>{status}</span>
        </button>

        {/* Priority Badge */}
        <span
          className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${getPriorityBadge(
            priority
          )}`}
        >
          {priority}
        </span>

        {/* Due Date */}
        {dueDate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-[75px] font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dueDate}</span>
          </div>
        )}

        {/* Assignee Avatar */}
        {assignee && (
          <div
            title={`Assigned to ${assignee.name}`}
            className={`flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white shadow-2xs ${
              assignee.bg || "bg-slate-600"
            }`}
          >
            {assignee.initials}
          </div>
        )}
      </div>
    </div>
  );
}
