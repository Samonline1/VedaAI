import React from "react";
import { Assignment } from "../utils/types";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, FileText, Plus } from "lucide-react";

interface DashboardHomeProps {
  assignments: Assignment[];
  pendingCount: number;
  completedCount: number;
  totalQuestions: number;
  onCreateClick: () => void;
  onOpenAssignments: () => void;
}

export default function DashboardHome({
  assignments,
  pendingCount,
  completedCount,
  totalQuestions,
  onCreateClick,
  onOpenAssignments
}: DashboardHomeProps) {
  const recentAssignments = assignments.slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.4fr,0.9fr]">
          <div className="space-y-5">
            <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              Teacher Assignment Generator
            </span>
            <div className="space-y-3">
              <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-slate-900">
                Build clean question papers with Gemini and review them in one place.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                Create an assignment, send the prompt to Gemini, track generation status, and open a printable paper when it is ready.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onCreateClick}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Create Assignment
              </button>
              <button
                onClick={onOpenAssignments}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View Assignments
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2 text-slate-700 shadow-sm">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Assignments</p>
                  <p className="text-2xl font-bold text-slate-900">{assignments.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2 text-orange-600 shadow-sm">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Generating</p>
                  <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2 text-emerald-600 shadow-sm">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Completed</p>
                  <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2 text-sky-700 shadow-sm">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Questions</p>
                  <p className="text-2xl font-bold text-slate-900">{totalQuestions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Recent assignments</h2>
            <p className="text-sm text-slate-500">Quick visibility into what was created most recently.</p>
          </div>

          {recentAssignments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              No assignments yet. Create the first one to start the workflow.
            </div>
          ) : (
            <div className="space-y-3">
              {recentAssignments.map((assignment) => (
                <div key={assignment.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {assignment.subject} • {assignment.className}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {assignment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
