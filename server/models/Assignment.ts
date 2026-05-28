import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  schoolName: string;
  subject: string;
  className: string;
  uploadedFileName?: string;
  uploadedFileContent?: string;
  dueDate: string;
  timeAllowed: number;
  createdAt: string;
  status: "queued" | "processing" | "generating" | "completed" | "failed";
  progress: number;
  statusMessage: string;
  instructions: string;
  questionTypes: Array<{
    id: string;
    type: string;
    count: number;
    marks: number;
  }>;
  additionalInfo?: string;
  generatedPaper?: any;
  error?: string;
}

const AssignmentSchema: Schema = new Schema({
  title: { type: String, required: true },
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  uploadedFileName: { type: String },
  uploadedFileContent: { type: String },
  dueDate: { type: String, required: true },
  timeAllowed: { type: Number, default: 45 },
  createdAt: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["queued", "processing", "generating", "completed", "failed"], 
    default: "queued" 
  },
  progress: { type: Number, default: 5 },
  statusMessage: { type: String, default: "Queued..." },
  instructions: { type: String, default: "All questions are compulsory." },
  questionTypes: [
    {
      id: { type: String },
      type: { type: String },
      count: { type: Number },
      marks: { type: Number }
    }
  ],
  additionalInfo: { type: String },
  generatedPaper: { type: Schema.Types.Mixed },
  error: { type: String }
});

// Avoid OverwriteModelError in case hot reload reinstantiates models
export const AssignmentModel = mongoose.models.Assignment || mongoose.model<IAssignment>("Assignment", AssignmentSchema);
