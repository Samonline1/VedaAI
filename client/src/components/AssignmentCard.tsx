import React, { useState } from "react";
import { Assignment } from "../utils/types";
import { 
  Calendar, 
  HelpCircle, 
  Award, 
  Clock, 
  FileCheck,
  MoreVertical, 
  Trash2, 
  Eye, 
  AlertCircle,
  Sparkles,
  Loader2
} from "lucide-react";

interface AssignmentCardProps {
  key?: string;
  assignment: Assignment;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AssignmentCard({ assignment, onView, onDelete }: AssignmentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Compute total questions and total marks
  const totalQuestions = assignment.questionTypes.reduce((acc, q) => acc + q.count, 0);
  const totalMarks = assignment.questionTypes.reduce((acc, q) => acc + (q.count * q.marks), 0);

  // Parse dates nicely
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-slate-300 transition-all hover:shadow-md hover:shadow-slate-100 flex flex-col justify-between group">
      
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100 font-mono">
              {assignment.subject}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono">
              {assignment.className}
            </span>
          </div>

          <h3 className="font-bold text-slate-800 leading-snug group-hover:text-orange-600 transition-colors truncate text-[16px]" title={assignment.title}>
            {assignment.title}
          </h3>
        </div>

        {/* Action Button Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all cursor-pointer"
            aria-label="Options"
          >
            <MoreVertical className="h-4.5 w-4.5" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  setConfirmDelete(false);
                }}
              />
              <div 
                className="absolute right-0 mt-1.5 w-42 bg-white border border-slate-200 rounded-xl shadow-lg z-40 py-1 font-medium text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {assignment.status === "completed" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(assignment.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-[#f8fafc] text-left cursor-pointer"
                  >
                    <Eye className="h-4 w-4 text-slate-400" />
                    <span>View Exam</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirmDelete) {
                      onDelete(assignment.id);
                      setShowMenu(false);
                      setConfirmDelete(false);
                    } else {
                      setConfirmDelete(true);
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left cursor-pointer font-semibold transition-all duration-150 ${
                    confirmDelete ? "text-white bg-rose-600 hover:bg-rose-700" : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  <Trash2 className={`h-4 w-4 ${confirmDelete ? "text-white" : "text-red-400"}`} />
                  <span>{confirmDelete ? "Confirm Delete?" : "Delete"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Area depends on status */}
      <div className="my-4 pt-1 flex-1">
        
        {/* Loader Progress State */}
        {assignment.status !== "completed" && assignment.status !== "failed" && (
          <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin text-orange-500" />
                <span>AI Generating...</span>
              </span>
              <span className="font-mono text-orange-600 font-bold">{assignment.progress}%</span>
            </div>
            {/* Animated bar */}
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-300"
                style={{ width: `${assignment.progress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 italic truncate tracking-wide">
              {assignment.statusMessage}
            </p>
          </div>
        )}

        {/* Failed Error State */}
        {assignment.status === "failed" && (
          <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2.5">
            <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-red-700">Generation Failed</span>
              <p className="text-[10px] text-red-600 leading-relaxed truncate-2-lines mt-0.5">
                {assignment.error || "Gemini could not generate this assignment. Check the API key and try again."}
              </p>
            </div>
          </div>
        )}

        {/* Normal Completed Info */}
        {assignment.status === "completed" && (
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
            <div className="flex items-center gap-1.5 text-slate-600">
              <HelpCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {totalQuestions} Questions
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Award className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {totalMarks} Marks Total
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-mono">
              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{assignment.timeAllowed} Mins</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <FileCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Ready</span>
            </div>
          </div>
        )}

      </div>

      {/* Footer Dates */}
      <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-1">
          <span>Assigned:</span>
          <span>{formatDate(assignment.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
          <Calendar className="h-3 w-3" />
          <span>Due: {formatDate(assignment.dueDate)}</span>
        </div>
      </div>

      {/* Hover action bar overlay only for completed items */}
      {assignment.status === "completed" && (
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-white via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center rounded-b-2xl">
          <button
            onClick={() => onView(assignment.id)}
            className="px-4 py-1.5 bg-slate-900 text-white hover:bg-orange-600 active:scale-95 transition-all text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1"
          >
            <Sparkles className="h-3.5 w-3.5 text-orange-200" />
            <span>Generate Exam Paper</span>
          </button>
        </div>
      )}

    </div>
  );
}
