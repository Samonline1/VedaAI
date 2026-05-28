import React, { useEffect, useState } from "react";
import { Assignment } from "../utils/types";
import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";
import AssignmentCard from "../components/AssignmentCard";
import AssignmentForm from "../components/AssignmentForm";
import OutputPaper from "../components/OutputPaper";
import BuildingPlaceholder from "../components/BuildingPlaceholder";
import DashboardHome from "../components/DashboardHome";
import AssignmentsSkeleton from "../components/AssignmentsSkeleton";
import {
  AlertCircle,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";

type AppTab = "dashboard" | "assignments" | "library" | "settings";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [viewAssignmentId, setViewAssignmentId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  const fetchAssignments = async (showLoader = false) => {
    if (showLoader) {
      setIsLoadingAssignments(true);
    }

    try {
      const res = await fetch(apiUrl("/api/assignments"));
      if (!res.ok) {
        throw new Error("Unable to load assignments.");
      }
      const data = await res.json();
      setAssignments(data);
      setAppError(null);
    } catch (err) {
      console.error("Error loading assignments:", err);
      setAppError("Unable to load assignments right now. Please refresh and try again.");
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchAssignments(true);
  }, []);

  useEffect(() => {
    const hasActiveJobs = assignments.some(
      (assignment) =>
        assignment.status === "queued" ||
        assignment.status === "processing" ||
        assignment.status === "generating"
    );

    if (!hasActiveJobs) {
      return;
    }

    const interval = setInterval(() => {
      fetchAssignments(false);
    }, 2000);

    return () => clearInterval(interval);
  }, [assignments]);

  const handleOpenForm = () => {
    setActiveTab("assignments");
    setViewAssignmentId(null);
    setShowForm(true);
    setAppError(null);
  };

  const handleCreateAssignment = async (formData: any) => {
    try {
      setIsCreatingAssignment(true);
      setAppError(null);

      const res = await fetch(apiUrl("/api/assignments"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => null);
        const message = errorPayload?.error || "Failed to create assignment.";
        setAppError(message);
        alert(message);
        return;
      }

      const newAssignment = await res.json();
      setAssignments((prev) => [newAssignment, ...prev]);
      setShowForm(false);
      setActiveTab("assignments");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submit error:", err);
      const message = "Unable to start assignment generation right now.";
      setAppError(message);
      alert(message);
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/assignments/${id}`), {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error("Failed to delete assignment.");
      }

      setAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
      if (viewAssignmentId === id) {
        setViewAssignmentId(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setAppError("Unable to delete the assignment right now.");
    }
  };

  const selectedAssignment = assignments.find((assignment) => assignment.id === viewAssignmentId);
  const uniqueSubjects = ["All", ...Array.from(new Set(assignments.map((assignment) => assignment.subject)))];

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.className.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = subjectFilter === "All" || assignment.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const totalQuestionsAll = assignments.reduce((count, assignment) => {
    if (assignment.status !== "completed") {
      return count;
    }

    return count + assignment.questionTypes.reduce((sum, questionType) => sum + questionType.count, 0);
  }, 0);

  const pendingCount = assignments.filter(
    (assignment) =>
      assignment.status === "queued" ||
      assignment.status === "processing" ||
      assignment.status === "generating"
  ).length;

  const completedCount = assignments.filter((assignment) => assignment.status === "completed").length;

  const resetNavigation = (tab: AppTab) => {
    setActiveTab(tab);
    setShowForm(false);
    setViewAssignmentId(null);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          onTabChange={resetNavigation}
          onCreateClick={handleOpenForm}
          assignmentsCount={assignments.length}
        />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex h-full w-full max-w-xs flex-col bg-white">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar
              activeTab={activeTab}
              onTabChange={resetNavigation}
              onCreateClick={handleOpenForm}
              assignmentsCount={assignments.length}
            />
          </div>
        </div>
      )}

      <main className="flex min-h-screen flex-col md:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur print:hidden">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  VedaAI
                </p>
                <h1 className="text-lg font-semibold text-slate-900">
                  {viewAssignmentId
                    ? "Assignment Output"
                    : showForm
                    ? "Create Assignment"
                    : activeTab === "dashboard"
                    ? "Dashboard"
                    : activeTab === "assignments"
                    ? "Assignments"
                    : activeTab === "library"
                    ? "Resource Library"
                    : "Settings"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 sm:block">
                {pendingCount > 0 ? `${pendingCount} assignment${pendingCount > 1 ? "s" : ""} generating` : "All assignments up to date"}
              </div>
              <button
                id="header-create-btn"
                onClick={handleOpenForm}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                New Assignment
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-6 md:p-8">
          {appError && !showForm && !viewAssignmentId && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{appError}</p>
            </div>
          )}

          {selectedAssignment?.generatedPaper && (
            <OutputPaper
              paper={selectedAssignment.generatedPaper}
              onBack={() => setViewAssignmentId(null)}
            />
          )}

          {!viewAssignmentId && showForm && (
            <AssignmentForm
              isSubmitting={isCreatingAssignment}
              onSubmit={handleCreateAssignment}
              onCancel={() => setShowForm(false)}
            />
          )}

          {!viewAssignmentId && !showForm && (
            <>
              {activeTab === "dashboard" && (
                <DashboardHome
                  assignments={assignments}
                  pendingCount={pendingCount}
                  completedCount={completedCount}
                  totalQuestions={totalQuestionsAll}
                  onCreateClick={handleOpenForm}
                  onOpenAssignments={() => setActiveTab("assignments")}
                />
              )}

              {activeTab === "assignments" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          id="search-assignments-input"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by title, subject, or class"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-3 overflow-x-auto">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          Filter
                        </div>
                        <div className="flex items-center gap-2">
                          {uniqueSubjects.map((subject) => (
                            <button
                              key={subject}
                              onClick={() => setSubjectFilter(subject)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                subjectFilter === subject
                                  ? "bg-slate-900 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isLoadingAssignments ? (
                    <AssignmentsSkeleton />
                  ) : filteredAssignments.length === 0 ? (
                    <EmptyState onCreateClick={handleOpenForm} />
                  ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredAssignments.map((assignment) => (
                        <AssignmentCard
                          key={assignment.id}
                          assignment={assignment}
                          onView={(id) => setViewAssignmentId(id)}
                          onDelete={handleDeleteAssignment}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "library" && (
                <BuildingPlaceholder
                  panelName="Resource Library"
                  description="Keep reference notes and topic inputs here. The main assignment flow stays focused on create, generate, review, and print."
                />
              )}

              {activeTab === "settings" && (
                <BuildingPlaceholder
                  panelName="Settings"
                  description="Use this area for lightweight configuration such as school name defaults, API setup notes, and future MongoDB environment checks."
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
