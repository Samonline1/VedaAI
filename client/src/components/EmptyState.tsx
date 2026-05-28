import React from "react";
import { ClipboardList, Plus, X } from "lucide-react";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-center max-w-2xl mx-auto my-12">
      <div className="relative mb-6">
        <div className="h-24 w-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
          <div className="h-16 w-12 border-2 border-slate-300 rounded bg-white relative flex flex-col justify-around p-2">
            <div className="w-full bg-slate-200 h-2 rounded-sm" />
            <div className="w-5/6 bg-slate-100 h-1.5 rounded-sm" />
            <div className="w-full bg-slate-100 h-1.5 rounded-sm" />
            <div className="w-2/3 bg-slate-100 h-1.5 rounded-sm" />
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-slate-400 rounded-sm" />
          </div>
        </div>
        
        <div className="absolute -bottom-2 -right-2 h-9 w-9 bg-red-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
          <X className="h-4.5 w-4.5 text-white stroke-[3.5]" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 tracking-tight">No assignments yet</h3>
      
      <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
        Create your first assignment to start the simple workflow: fill the form, generate with Gemini, then review and print the output.
      </p>

      <button
        id="btn-create-first-assignment"
        onClick={onCreateClick}
        className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 active:scale-98 transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:shadow-slate-200"
      >
        <Plus className="h-4 w-4" />
        <span>Create First Assignment</span>
      </button>
    </div>
  );
}
