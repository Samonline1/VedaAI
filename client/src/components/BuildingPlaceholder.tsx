import React from "react";
import { Loader2, Wrench } from "lucide-react";

interface BuildingPlaceholderProps {
  panelName: string;
  description?: string;
}

export default function BuildingPlaceholder({ panelName, description }: BuildingPlaceholderProps) {
  return (
    <div className="mx-auto my-8 max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-400">
        <Wrench className="h-5 w-5 text-slate-500" />
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-bold tracking-tight text-slate-900">{panelName}</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500">
          {description || "This section is intentionally lightweight for now so the main assignment workflow stays simple and easy to review."}
        </p>
      </div>

      <div className="mx-auto max-w-sm space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 pt-2">
        <div className="flex items-center gap-2.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
          <span className="text-[11px] font-bold text-slate-400">More features can be added here later.</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-slate-200/60" />
          <div className="h-2.5 w-full animate-pulse rounded-full bg-slate-200/50" />
          <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-slate-200/50" />
        </div>
      </div>

    </div>
  );
}
