import React, { useState } from "react";
import { QuestionTypeConfig } from "../utils/types";
import { 
  ArrowLeft, 
  Upload, 
  Calendar, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles, 
  FileCheck,
  Building,
  GraduationCap,
  Bookmark
} from "lucide-react";

interface AssignmentFormProps {
  isSubmitting?: boolean;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export default function AssignmentForm({ isSubmitting = false, onSubmit, onCancel }: AssignmentFormProps) {
  const [title, setTitle] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeAllowed, setTimeAllowed] = useState(45);
  const [additionalInfo, setAdditionalInfo] = useState("");
  
  // Question rows configuration state
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeConfig[]>([
    { id: "qt-1", type: "Multiple Choice Questions", count: 1, marks: 1 }
  ]);

  // Simulated doc upload states
  const [uploadedFile, setUploadedFile] = useState<{ name: string; contentText: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Suggested Topics preset pack to make testing extremely fast and awesome
  const presets = [
    {
      title: "Quiz on Electricity & Conductors",
      subject: "Science",
      class: "Grade 8",
      info: "Cover electroplating, electrolysis, and electrical conductivity concepts.",
      file: "electricity_curriculum_notes.txt",
      content: "Materials which allow electricity to pass through them are conductors. Electrolysis is chemical decomposition. Electroplating deposits metals."
    },
    {
      title: "Quadratic Equations test",
      subject: "Mathematics",
      class: "Grade 10",
      info: "Include questions solving real-world roots, finding discriminants, and completing the square.",
      file: "quadratics_blueprint.txt",
      content: "Quadratic equations possess general form ax^2 + bx + c = 0. Roots are given by quadratic formula x = (-b +- sqrt(b^2 - 4ac)) / (2a)."
    },
    {
      title: "Intro To Fractions Quiz",
      subject: "Mathematics",
      class: "Class 5th",
      info: "Generate basic visual pie chart fractions questions and comparing simplified fractions.",
      file: "fractions_elementary.txt",
      content: "Fractions represent parts of a whole, made of numerator on top and denominator on bottom. Equivalent fractions are equal in value."
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setTitle(preset.title);
    setSubject(preset.subject);
    setClassName(preset.class);
    setAdditionalInfo(preset.info);
    setUploadedFile({
      name: preset.file,
      contentText: preset.content
    });
  };

  // Preset question types available
  const availableQuestionTypes = [
    "Multiple Choice Questions",
    "Short Questions",
    "Diagram/Graph-Based Questions",
    "Numerical Problems",
    "Long Answer Questions"
  ];

  // Modify question count or marks
  const updateRow = (id: string, field: "count" | "marks", direction: "inc" | "dec") => {
    setQuestionTypes(prev => 
      prev.map(row => {
        if (row.id !== id) return row;
        
        const change = direction === "inc" ? 1 : -1;
        const currentVal = row[field];
        const newVal = Math.max(1, currentVal + change);
        
        return {
          ...row,
          [field]: newVal
        };
      })
    );
  };

  const updateTypeSelect = (id: string, value: string) => {
    setQuestionTypes(prev => 
      prev.map(row => (row.id === id ? { ...row, type: value } : row))
    );
  };

  // Add question type row
  const addRow = () => {
    const newId = `qt-${Date.now()}`;
    // Select an unused type or fallback
    const usedTypes = questionTypes.map(q => q.type);
    const unusedType = availableQuestionTypes.find(t => !usedTypes.includes(t)) || "Long Answer Questions";
    
    setQuestionTypes(prev => [
      ...prev,
      { id: newId, type: unusedType, count: 2, marks: 3 }
    ]);
  };

  // Remove question type row
  const removeRow = (id: string) => {
    if (questionTypes.length <= 1) {
      alert("At least one question type is required.");
      return;
    }
    setQuestionTypes(prev => prev.filter(row => row.id !== id));
  };

  // File Upload handler (simulated text read)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFile({
          name: file.name,
          contentText: typeof reader.result === "string" ? reader.result.substring(0, 1500) : "Syllabus file content blueprint loaded."
        });
      };
      reader.readAsText(file);
    }
  };

  // Simulated drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFile({
          name: file.name,
          contentText: typeof reader.result === "string" ? reader.result.substring(0, 1500) : "Curriculum text read from uploaded file."
        });
      };
      reader.readAsText(file);
    }
  };

  const totalQuestions = questionTypes.reduce((acc, q) => acc + q.count, 0);
  const totalMarks = questionTypes.reduce((acc, q) => acc + (q.count * q.marks), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !className.trim()) {
      alert("Please fill in the Assignment Title, Subject, and Grade Class.");
      return;
    }

    const formData = {
      title,
      schoolName: schoolName || "Delhi Public School",
      subject,
      className,
      uploadedFileName: uploadedFile?.name || undefined,
      uploadedFileContent: uploadedFile?.contentText || undefined,
      dueDate,
      timeAllowed,
      questionTypes,
      additionalInfo,
      instructions: `Time Allowed: ${timeAllowed} minutes. Maximum Marks: ${totalMarks}. All questions are compulsory unless stated otherwise.`
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12 font-sans">
      
      {/* Dynamic Header Path Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Create Assignment</h2>
            <p className="text-xs text-slate-500">Fill the form, generate with Gemini, then review the finished paper.</p>
          </div>
        </div>

        {/* Quick presets list for easily loading files without typing */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 text-[11px] bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-md font-semibold transition-colors duration-150 border border-slate-200"
            >
              {p.title.split(" Quiz")[0].split(" test")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Details on left, Upload panel on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side Content - Forms & Blueprints */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <Building className="h-4 w-4" /> Basic Details
            </h3>

            {/* School Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SCHOOL NAME</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g., Delhi Public School, Bokaro"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-orange-500 outline-none transition-all text-slate-800 font-semibold"
              />
            </div>

            {/* Title / Topic */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">TOPIC / ASSIGNMENT TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Conductors and Insulators Quiz"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-orange-500 outline-none transition-all text-slate-800 font-semibold"
                required
              />
            </div>

            {/* Class Name & Subject Name & Due Date & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SUBJECT</label>
                <div className="relative">
                  <Bookmark className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Science"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:bg-white focus:border-orange-500 outline-none transition-all text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GRADE / CLASS</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g., Class 8th"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:bg-white focus:border-orange-500 outline-none transition-all text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">DUE DATE</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:bg-white focus:border-orange-500 outline-none transition-all text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">TIME ALLOWED (MINUTES)</label>
                <input
                  type="number"
                  value={timeAllowed}
                  onChange={(e) => setTimeAllowed(Number(e.target.value))}
                  min={5}
                  max={300}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-orange-500 outline-none transition-all text-slate-800 font-medium font-mono"
                  required
                />
              </div>
            </div>

          </div>

          {/* Additional Guidance Info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ADDITIONAL INSTRUCTIONS / BLUEPRINT PROMPTS
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
                placeholder="Add any specific topics, examples, formulas, or chapter focus you want Gemini to use."
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-orange-500 outline-none transition-all text-slate-800 leading-relaxed font-medium"
              />
              <span className="text-[10px] text-slate-400 block italic mt-1 font-mono">
                Keep this short and specific for the best structured output.
              </span>
            </div>
          </div>

        </div>

        {/* Right Side Content - File Upload & Question Tables */}
        <div className="lg:col-span-5 space-y-6">

          {/* VedaAI Drag & Drop area */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Syllabus Reference Material
            </h3>
            
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center transition-all ${
                isDragOver ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Upload className="h-8 w-8 text-slate-400 mb-2 stroke-[1.5]" />
              <p className="text-xs font-semibold text-slate-700">Choose a syllabus file or drag it here</p>
              <p className="text-[10px] text-slate-400 mt-1 mb-3">TXT or markdown files work best for prompt context</p>
              
              <label className="cursor-pointer px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all">
                Browse Files
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.pdf,.png,.jpg,.jpeg,.md"
                />
              </label>
            </div>

            {uploadedFile && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl flex items-center justify-between gap-3 text-xs font-medium">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  <span className="truncate" title={uploadedFile.name}>
                    {uploadedFile.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="text-emerald-700 hover:text-emerald-950 px-1 font-extrabold"
                >
                  X
                </button>
              </div>
            )}
          </div>

          {/* Question blueprint builder table with +/- buttons */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Question Structure
              </h3>
              <button
                type="button"
                onClick={addRow}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded"
              >
                <Plus className="h-3 w-3" /> Add Rows
              </button>
            </div>

            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {questionTypes.map((qt) => (
                <div key={qt.id} className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  
                  {/* Select Dropdown */}
                  <div className="flex-1">
                    <select
                      value={qt.type}
                      onChange={(e) => updateTypeSelect(qt.id, e.target.value)}
                      className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-orange-500"
                    >
                      {availableQuestionTypes.map((tOpt) => (
                        <option key={tOpt} value={tOpt}>
                          {tOpt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Count & Marks Row Container */}
                  <div className="flex items-center justify-between gap-4">
                    
                    {/* No. of Questions counter */}
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Count</span>
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden mt-1 mt-auto">
                        <button
                          type="button"
                          onClick={() => updateRow(qt.id, "count", "dec")}
                          className="p-1 px-2.5 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold w-7 text-center select-none font-mono text-slate-800">
                          {qt.count}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRow(qt.id, "count", "inc")}
                          className="p-1 px-2.5 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Marks per Question counter */}
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Marks</span>
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden mt-1 mt-auto">
                        <button
                          type="button"
                          onClick={() => updateRow(qt.id, "marks", "dec")}
                          className="p-1 px-2.5 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold w-7 text-center select-none font-mono text-slate-800">
                          {qt.marks}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRow(qt.id, "marks", "inc")}
                          className="p-1 px-2.5 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Discard delete row icon */}
                    <button
                      type="button"
                      onClick={() => removeRow(qt.id)}
                      className="p-1 mt-3 bg-white text-slate-400 hover:text-red-500 border border-slate-100 hover:border-red-100 rounded-lg transition-colors shadow-sm self-end"
                      title="Delete question section"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                  </div>

                </div>
              ))}
            </div>

            {/* Calculations summaries footer */}
            <div className="pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-500">
              <div className="flex items-center gap-1 font-mono">
                <span>Total Questions:</span>
                <span className="text-slate-800 text-sm">{totalQuestions}</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <span>Total Marks:</span>
                <span className="text-orange-600 text-sm">{totalMarks}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Navigation Submit Footer */}
      <div className="border-t border-slate-200 pt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-sm rounded-xl transition-all"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-slate-900 text-white font-bold text-sm hover:bg-orange-600 hover:shadow-lg active:scale-98 transition-all duration-200 flex items-center gap-2 rounded-xl"
        >
          <Sparkles className="h-4.5 w-4.5 text-orange-300" />
          <span>{isSubmitting ? "Starting Generation..." : "Generate Assignment"}</span>
        </button>
      </div>

    </form>
  );
}
