import React, { useState } from "react";
import { GeneratedPaper } from "../utils/types";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, FileText, Printer, Sparkles } from "lucide-react";

interface OutputPaperProps {
  paper: GeneratedPaper;
  onBack: () => void;
}

export default function OutputPaper({ paper, onBack }: OutputPaperProps) {
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [includeAnswersInPrint, setIncludeAnswersInPrint] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col items-stretch justify-between gap-4 border-b border-slate-200 pb-5 print:hidden sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Assignment Output</h2>
            <p className="text-xs text-slate-500">
              Review the generated paper, open the answer key, and print or save the result as PDF.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {showAnswerKey ? (
              <>
                <EyeOff className="h-4 w-4 text-slate-400" />
                <span>Hide Answer Key</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-slate-400" />
                <span>Show Answer Key</span>
              </>
            )}
          </button>

          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200">
            <input
              type="checkbox"
              checked={includeAnswersInPrint}
              onChange={(e) => setIncludeAnswersInPrint(e.target.checked)}
              className="cursor-pointer rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
            <span>Include answer key in print</span>
          </label>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow transition hover:bg-orange-700"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className={`col-span-12 transition-all duration-300 ${showAnswerKey ? "lg:col-span-7" : "lg:col-span-12"}`}>
          <div
            id="printable-exam-paper"
            className="mx-auto max-w-4xl rounded-2xl border border-slate-200 border-t-[10px] border-t-slate-800 bg-white p-8 text-slate-900 shadow-lg sm:p-12 md:p-16"
          >
            <div className="mb-6 space-y-2 border-b-2 border-slate-900 pb-6 text-center">
              <h1 className="text-2xl font-bold uppercase leading-tight tracking-tight text-slate-900">
                {paper.schoolName || "DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO"}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-semibold text-slate-700">
                <span>
                  Subject: <span className="font-bold text-slate-900 underline underline-offset-4">{paper.subject}</span>
                </span>
                <span>&bull;</span>
                <span>
                  Class / Grade: <span className="font-bold text-slate-900 underline underline-offset-4">{paper.className}</span>
                </span>
              </div>

              <div className="mx-auto mt-2 grid max-w-lg grid-cols-2 border-t border-slate-100 pt-3 text-xs font-bold text-slate-600">
                <div className="text-left">
                  Time Allowed: <span className="font-mono text-sm text-slate-900">{paper.timeAllowed} minutes</span>
                </div>
                <div className="text-right">
                  Maximum Marks: <span className="font-mono text-sm text-slate-900">{paper.maxMarks}</span>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-xs font-semibold leading-relaxed text-slate-700 print:border-none print:bg-white print:p-0">
              <p className="mb-1 flex items-center gap-1 font-bold text-slate-900">
                <FileText className="h-3.5 w-3.5 text-slate-500 print:hidden" />
                <span>General Instructions:</span>
              </p>
              <p>{paper.instructions || "All questions are compulsory unless stated otherwise."}</p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 border-b-2 border-dashed border-slate-300 pb-6 text-xs font-bold font-mono sm:grid-cols-2 md:grid-cols-3">
              <div className="flex items-baseline gap-2">
                <span className="shrink-0 uppercase text-slate-500">Candidate Name:</span>
                <div className="h-4 min-w-40 flex-1 border-b border-slate-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="shrink-0 uppercase text-slate-500">Roll Number:</span>
                <div className="h-4 min-w-32 flex-1 border-b border-slate-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="shrink-0 uppercase text-slate-500">Section / Cohort:</span>
                <div className="h-4 min-w-24 flex-1 border-b border-slate-400" />
              </div>
            </div>

            <div className="space-y-8">
              {paper.sections.map((section) => (
                <div key={section.id} className="space-y-4">
                  <div className="flex items-baseline justify-between border-b-2 border-slate-800 pb-1">
                    <h3 className="text-md font-mono font-bold uppercase tracking-wide text-slate-950">
                      {section.title}
                    </h3>
                    <span className="select-none text-[11px] font-semibold italic text-slate-500 print:hidden">
                      {section.questions.length} questions
                    </span>
                  </div>

                  <p className="pl-1 text-xs font-semibold italic leading-relaxed text-slate-600">
                    {section.instruction}
                  </p>

                  <ul className="space-y-4 pt-1.5">
                    {section.questions.map((question, index) => (
                      <li key={question.id} className="pl-1 text-sm leading-relaxed text-slate-900">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <span className="mr-2 font-bold">{index + 1}.</span>
                            <span
                              className={`mr-2 inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase print:hidden ${
                                question.difficulty === "Easy"
                                  ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                                  : question.difficulty === "Moderate"
                                  ? "border border-slate-200 bg-slate-50 text-slate-700"
                                  : "border border-red-100 bg-red-50 text-red-700"
                              }`}
                            >
                              {question.difficulty}
                            </span>
                            <span className="text-[14px] font-medium">{question.question}</span>
                          </div>

                          <span className="whitespace-nowrap rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700 print:border print:border-slate-300 print:bg-white">
                            [{question.marks} Mark{question.marks > 1 ? "s" : ""}]
                          </span>
                        </div>

                        {question.options && question.options.length > 0 && (
                          <div className="ml-6 mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-start gap-2 text-xs text-slate-700">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-mono font-bold text-slate-800">
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                                <span className="pt-0.5 font-medium">{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {includeAnswersInPrint && (
              <div className="page-break-before mt-16 border-t-4 border-double border-slate-800 pt-12 font-sans">
                <div className="mb-8 text-center">
                  <h2 className="text-md font-mono font-extrabold uppercase tracking-widest text-slate-800">
                    Answer Key
                  </h2>
                  <p className="mt-1 font-mono text-[10px] text-slate-500">Teacher reference copy</p>
                </div>

                <div className="space-y-5">
                  {paper.answerKey.map((answer) => (
                    <div key={answer.id} className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                      <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-1 font-mono font-bold">
                        <span className="text-slate-800">QUESTION REFERENCE #{answer.questionNumber}</span>
                        <span className="text-orange-600">KEY</span>
                      </div>
                      <p className="mb-1 truncate font-semibold italic text-slate-500">Q: {answer.question}</p>
                      <p className="whitespace-pre-line rounded border border-slate-100 bg-white p-2.5 font-medium leading-relaxed text-slate-900">
                        <span className="mr-1.5 flex shrink-0 items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          Suggested Answer:
                        </span>
                        {answer.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6 text-center font-mono text-[10px] text-slate-400">
              <span>Paper Ref: {paper.title.substring(0, 25).toUpperCase()}</span>
              <span>Generated with VedaAI</span>
              <span>Teacher copy</span>
            </div>
          </div>
        </div>

        {showAnswerKey && (
          <div className="col-span-12 space-y-4 print:hidden lg:col-span-5">
            <div className="sticky top-6 max-h-screen overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-md">
              <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 animate-pulse text-orange-400" />
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-white">
                    Answer Key
                  </h3>
                </div>
                <button
                  onClick={() => setShowAnswerKey(false)}
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  Close Key
                </button>
              </div>

              <div className="space-y-4">
                {paper.answerKey.map((answer) => (
                  <div key={answer.id} className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3.5 transition hover:border-slate-700">
                    <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                      <span className="text-orange-400">Ref No. {answer.questionNumber}</span>
                      <span className="text-slate-500">Teacher Notes</span>
                    </div>

                    <p className="line-clamp-1 text-[11px] italic leading-snug text-slate-400">
                      Q: {answer.question}
                    </p>

                    <p className="whitespace-pre-line rounded border border-slate-800/80 bg-slate-900/60 p-2.5 text-xs font-medium leading-relaxed text-slate-100">
                      {answer.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
