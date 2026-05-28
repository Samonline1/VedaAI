import React from "react";
import { BookMarked, LayoutDashboard, Plus, Settings, FileText } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: "dashboard" | "assignments" | "library" | "settings") => void;
  onCreateClick: () => void;
  assignmentsCount: number;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  onCreateClick,
  assignmentsCount
}: SidebarProps) {
  const menuItems: Array<{
    id: "dashboard" | "assignments" | "library" | "settings";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "assignments", label: "Assignments", icon: FileText, badge: assignmentsCount },
    { id: "library", label: "Library", icon: BookMarked },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
            V
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900">VedaAI</h1>
            <p className="text-xs text-slate-500">Assignment generator</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={onCreateClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Create Assignment
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">School</p>
          <h2 className="mt-2 text-sm font-semibold text-slate-900">Delhi Public School</h2>
          <p className="mt-1 text-xs text-slate-500">Bokaro Steel City</p>
        </div>
      </div>
    </aside>
  );
}
