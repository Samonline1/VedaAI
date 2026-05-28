import { Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { DB } from "../config/database";

let aiClient: GoogleGenAI | null = null;

const GEMINI_MODEL = "gemini-2.5-pro";
const MAX_REQUESTS_PER_MINUTE = 4;
const MAX_REQUESTS_PER_DAY = 95;
const MIN_REQUEST_SPACING_MS = Math.ceil(60000 / MAX_REQUESTS_PER_MINUTE);

type GeminiUsageState = {
  active: boolean;
  lastRequestStartedAt: number;
  minuteWindowStart: number;
  minuteRequestCount: number;
  dayWindowKey: string;
  dayRequestCount: number;
};

const geminiUsageState: GeminiUsageState = {
  active: false,
  lastRequestStartedAt: 0,
  minuteWindowStart: 0,
  minuteRequestCount: 0,
  dayWindowKey: getDayWindowKey(),
  dayRequestCount: 0
};

const pendingGenerationQueue: string[] = [];

function getDayWindowKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: key || "PLACEHOLDER",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}

function resetUsageWindowsIfNeeded(now: number) {
  const nowDate = new Date(now);
  const currentDayKey = getDayWindowKey(nowDate);

  if (geminiUsageState.dayWindowKey !== currentDayKey) {
    geminiUsageState.dayWindowKey = currentDayKey;
    geminiUsageState.dayRequestCount = 0;
  }

  if (
    geminiUsageState.minuteWindowStart === 0 ||
    now - geminiUsageState.minuteWindowStart >= 60000
  ) {
    geminiUsageState.minuteWindowStart = now;
    geminiUsageState.minuteRequestCount = 0;
  }
}

function getRateLimitStatus(now = Date.now()) {
  resetUsageWindowsIfNeeded(now);

  const minuteRemaining = Math.max(0, MAX_REQUESTS_PER_MINUTE - geminiUsageState.minuteRequestCount);
  const dayRemaining = Math.max(0, MAX_REQUESTS_PER_DAY - geminiUsageState.dayRequestCount);
  const nextMinuteResetAt = geminiUsageState.minuteWindowStart + 60000;
  const nextAllowedStartAt = Math.max(
    geminiUsageState.lastRequestStartedAt + MIN_REQUEST_SPACING_MS,
    geminiUsageState.minuteRequestCount >= MAX_REQUESTS_PER_MINUTE ? nextMinuteResetAt : now
  );

  return {
    minuteRemaining,
    dayRemaining,
    nextAllowedStartAt,
    nextMinuteResetAt
  };
}

async function reserveGeminiRequestSlot() {
  while (true) {
    const now = Date.now();
    const rateStatus = getRateLimitStatus(now);

    if (rateStatus.dayRemaining <= 0) {
      const resetAt = new Date(`${geminiUsageState.dayWindowKey}T23:59:59.999Z`).toISOString();
      throw new Error(`Gemini daily safety limit reached. Try again after ${resetAt}.`);
    }

    if (rateStatus.minuteRemaining <= 0 || now < rateStatus.nextAllowedStartAt) {
      const waitMs = Math.max(1000, rateStatus.nextAllowedStartAt - now);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    geminiUsageState.lastRequestStartedAt = now;
    geminiUsageState.minuteRequestCount += 1;
    geminiUsageState.dayRequestCount += 1;
    return;
  }
}

async function runNextQueuedGeneration() {
  if (geminiUsageState.active) {
    return;
  }

  const nextAssignmentId = pendingGenerationQueue.shift();
  if (!nextAssignmentId) {
    return;
  }

  geminiUsageState.active = true;

  try {
    await generateAssignmentAsync(nextAssignmentId);
  } finally {
    geminiUsageState.active = false;
    void runNextQueuedGeneration();
  }
}

async function queueAssignmentGeneration(id: string) {
  const queuePosition = pendingGenerationQueue.length + (geminiUsageState.active ? 1 : 0);

  if (queuePosition > 0) {
    await DB.update(id, {
      status: "queued",
      progress: 5,
      statusMessage: `Queued for Gemini generation. ${queuePosition} job${queuePosition > 1 ? "s" : ""} ahead.`
    });
  }

  pendingGenerationQueue.push(id);
  void runNextQueuedGeneration();
}

async function generateAssignmentAsync(id: string) {
  const currentAssign = await DB.getById(id);
  if (!currentAssign) return;

  try {
    await DB.update(id, {
      status: "processing",
      progress: 20,
      statusMessage: "Preparing assignment details..."
    });
    await new Promise((resolve) => setTimeout(resolve, 1200));

    await DB.update(id, {
      status: "generating",
      progress: 40,
      statusMessage: "Waiting for a safe Gemini request slot..."
    });

    await reserveGeminiRequestSlot();

    await DB.update(id, {
      status: "generating",
      progress: 50,
      statusMessage: "Generating questions with Gemini..."
    });

    const structureSummary = currentAssign.questionTypes
      .map((qt: any) => `- Section / Type: "${qt.type}" with ${qt.count} questions, ${qt.marks} marks each`)
      .join("\n");

    const userInstructionsPrompt = currentAssign.instructions || "Attempt all questions.";
    const additionalInfoText = currentAssign.additionalInfo
      ? `Additional guidelines: "${currentAssign.additionalInfo}"`
      : "";
    const sourceText = currentAssign.uploadedFileName
      ? `Verify and BASE YOUR QUESTIONS STRICTLY on this uploaded reference file: "${currentAssign.uploadedFileName}". Complete Reference File Content: "${currentAssign.uploadedFileContent || ""}"`
      : "No file context. Generate questions tailored exactly to the topic and grade instructions.";

    const systemInstruction = `You are a professional educational assessor, examiner, and curriculum coordinator.
Your objective is to craft an elegantly formatted, standard academic examination paper consisting of custom questions and an comprehensive, clear, and step-by-step Answer Key.

You MUST precisely generate questions that match the following configured structure:
${structureSummary}

Rules:
1. All sections and questions must be tailored to Grade / Class: "${currentAssign.className}", Subject: "${currentAssign.subject}", and Topic: "${currentAssign.title}".
2. Follow these general instructions for candidate layout: "${userInstructionsPrompt}".
3. Integration requirements matches: ${additionalInfoText}
4. Sources & focus constraint: ${sourceText}
5. STRICT FACT QUALITY DIRECTIVE: You MUST base all questions and answers upon the provided reference text. DO NOT hallucinate, invent, or bring in arbitrary, unrelated concepts. Every question must be directly grounded in the provided facts, terms, or specifications.
6. Assign a variety of difficulty levels: 'Easy', 'Moderate', and 'Challenging' to the questions.
7. For sections that are "Multiple Choice Questions" (MCQ), you MUST supply exactly 4 clear options. For other sections, do NOT supply options.
8. Return exactly one AnswerKeyItem mapping to every generated question. Ensure the answer includes detailed point-by-step explanations of the solution.`;

    const promptText = `Generate a rigorous, formal test paper on ${currentAssign.subject} for ${currentAssign.className} titled "${currentAssign.title}" following the system instructions. Create exactly the requested sections and questions. Make the output extremely professional, engaging, and age-appropriate.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Add GEMINI_API_KEY before generating assignments.");
    }

    console.log(`Sending structured assignment request to Gemini for: ${currentAssign.title}`);
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Display name for this section, e.g. 'Section A: Multiple Choice Questions'" },
                  instruction: { type: Type.STRING, description: "e.g., 'Attempt all questions. Each question carries x marks.'" },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING, description: "The core question prompt text." },
                        difficulty: { type: Type.STRING, description: "Must be exactly 'Easy', 'Moderate', or 'Challenging'" },
                        marks: { type: Type.INTEGER, description: "Marks allocated for this question." },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "Exactly 4 options if visual MCQ, otherwise leave empty or omit."
                        }
                      },
                      required: ["question", "difficulty", "marks"]
                    }
                  }
                },
                required: ["title", "instruction", "questions"]
              }
            },
            answerKey: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.STRING, description: "e.g., '1', '2', or 'Section A - 1'" },
                  question: { type: Type.STRING, description: "Truncated or full prompt of the question" },
                  answer: { type: Type.STRING, description: "Step-by-step marking rubrics or solution answer." }
                },
                required: ["questionNumber", "question", "answer"]
              }
            }
          },
          required: ["sections", "answerKey"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from Gemini AI model.");
    }

    const cleanJson = JSON.parse(responseText.trim());

    const formattedSections = cleanJson.sections.map((sec: any, sIdx: number) => ({
      id: `sec-${sIdx + 1}`,
      title: sec.title || `Section ${String.fromCharCode(65 + sIdx)}`,
      instruction: sec.instruction || "Answer all questions.",
      questions: sec.questions.map((q: any, qIdx: number) => ({
        id: `q-${sIdx + 1}-${qIdx + 1}`,
        question: q.question,
        difficulty: q.difficulty || "Moderate",
        marks: Number(q.marks) || 1,
        options: q.options || undefined
      }))
    }));

    const formattedAnswerKey = cleanJson.answerKey.map((ans: any, idx: number) => ({
      id: `ans-${idx + 1}`,
      questionNumber: ans.questionNumber || `${idx + 1}`,
      question: ans.question,
      answer: ans.answer
    }));

    let maxMarksFromAI = 0;
    formattedSections.forEach((section: any) => {
      section.questions.forEach((question: any) => {
        maxMarksFromAI += question.marks;
      });
    });

    const generatedPaper = {
      title: currentAssign.title,
      schoolName: currentAssign.schoolName || "DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO",
      subject: currentAssign.subject,
      className: currentAssign.className,
      timeAllowed: currentAssign.timeAllowed,
      maxMarks: maxMarksFromAI || 20,
      instructions: currentAssign.instructions || "All questions are compulsory unless stated otherwise.",
      sections: formattedSections,
      answerKey: formattedAnswerKey
    };

    await DB.update(id, {
      progress: 85,
      statusMessage: "Saving generated paper...",
      generatedPaper
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await DB.update(id, {
      status: "completed",
      progress: 100,
      statusMessage: "Assignment ready to review."
    });
    console.log(`Async assignment generation finalized for: ${currentAssign.title}`);
  } catch (error: any) {
    console.error("AI Generation pipeline error:", error);
    await DB.update(id, {
      status: "failed",
      progress: 100,
      statusMessage: "Generation failed.",
      error: error.message || "An unexpected error occurred during parsing."
    });
  }
}

export const assignmentController = {
  async createAssignment(req: Request, res: Response) {
    try {
      const {
        title,
        schoolName,
        subject,
        className,
        uploadedFileName,
        uploadedFileContent,
        dueDate,
        timeAllowed,
        instructions,
        questionTypes,
        additionalInfo
      } = req.body;

      if (!title || !subject || !className || !dueDate || !questionTypes || questionTypes.length === 0) {
        return res.status(400).json({ error: "Missing required form fields." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: "Gemini API key is missing. Add GEMINI_API_KEY before generating assignments."
        });
      }

      const rateStatus = getRateLimitStatus();
      if (rateStatus.dayRemaining <= 0) {
        return res.status(429).json({
          error: "Gemini daily safety limit reached. Please try again tomorrow."
        });
      }

      const rawRecord = {
        title,
        schoolName: schoolName || "DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO",
        subject,
        className,
        uploadedFileName,
        uploadedFileContent,
        dueDate,
        timeAllowed: Number(timeAllowed) || 45,
        status: "queued",
        progress: 5,
        statusMessage: "Assignment queued for generation.",
        instructions: instructions || "All questions are compulsory unless stated otherwise.",
        questionTypes,
        additionalInfo
      };

      const assignmentObj = await DB.create(rawRecord);
      await queueAssignmentGeneration(assignmentObj.id);

      return res.status(201).json(assignmentObj);
    } catch (err: any) {
      console.error("Controller create error:", err);
      return res.status(500).json({ error: "Inner pipeline error." });
    }
  },

  async getAssignments(_req: Request, res: Response) {
    try {
      const list = await DB.getAll();
      return res.json(list);
    } catch (_err) {
      return res.status(500).json({ error: "Inner pipeline error." });
    }
  },

  async getAssignmentById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const assignment = await DB.getById(id);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found." });
      }
      return res.json(assignment);
    } catch (_err) {
      return res.status(500).json({ error: "Inner pipeline error." });
    }
  },

  async deleteAssignment(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const success = await DB.delete(id);
      if (!success) {
        return res.status(404).json({ error: "Assignment not found." });
      }
      return res.json({ success: true, message: "Assignment removed successfully." });
    } catch (err) {
      console.error("Controller delete error:", err);
      return res.status(500).json({ error: "Inner pipeline error." });
    }
  }
};
