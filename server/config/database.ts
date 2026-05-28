import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { isMongoEnabled } from "./connection";
import { AssignmentModel } from "../models/Assignment";

const DB_FILE = path.join(process.cwd(), "assignments.db.json");

// Local File Sync Database Fallback Utilities
function loadLocalList() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load local DB file:", err);
  }
  return [];
}

function saveLocalList(list: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save local DB file:", err);
  }
}

// Initial Mock Seed for realistic experience on fresh boot
const mockInitialSeed: any[] = [];

// Seed initial files if not present
if (!fs.existsSync(DB_FILE)) {
  saveLocalList(mockInitialSeed);
}

// Global DB CRUD Manager
export class DB {
  
  static async getAll(): Promise<any[]> {
    if (isMongoEnabled()) {
      try {
        const model = AssignmentModel as any;
        const mongoItems = await model.find().sort({ createdAt: -1 });
        return mongoItems.map((item: any) => {
          const obj = item.toObject();
          obj.id = obj._id.toString();
          return obj;
        });
      } catch (err) {
        console.error("MongoDB fetch failed, reading fallback:", err);
      }
    }
    return loadLocalList();
  }

  static async getById(id: string): Promise<any | null> {
    if (isMongoEnabled()) {
      try {
        const model = AssignmentModel as any;
        const doc = mongoose.isValidObjectId(id) 
          ? await model.findById(id)
          : await model.findOne({ id: id });
        if (doc) {
          const obj = doc.toObject();
          obj.id = obj._id.toString();
          return obj;
        }
      } catch (err) {
        console.error("MongoDB find failed:", err);
      }
    }
    
    const list = loadLocalList();
    return list.find((item: any) => item.id === id) || null;
  }

  static async create(data: any): Promise<any> {
    const rawId = "assign-" + Math.random().toString(36).substring(2, 11);
    const newRecord = {
      ...data,
      id: rawId,
      createdAt: data.createdAt || new Date().toISOString(),
      status: data.status || "queued",
      progress: data.progress || 5,
      statusMessage: data.statusMessage || "Queued in generation engine..."
    };

    if (isMongoEnabled()) {
      try {
        const doc = new AssignmentModel(newRecord);
        await doc.save();
        const obj = doc.toObject();
        obj.id = obj._id.toString();
        return obj;
      } catch (err) {
        console.error("MongoDB save failed, executing local fallback store:", err);
      }
    }

    // Save local File database
    const list = loadLocalList();
    list.unshift(newRecord);
    saveLocalList(list);
    return newRecord;
  }

  static async update(id: string, updateData: any): Promise<any | null> {
    if (isMongoEnabled()) {
      try {
        const model = AssignmentModel as any;
        const query = mongoose.isValidObjectId(id) ? { _id: id } : { id: id };
        const doc = await model.findOneAndUpdate(query, { $set: updateData }, { new: true });
        if (doc) {
          const obj = doc.toObject();
          obj.id = obj._id.toString();
          return obj;
        }
      } catch (err) {
        console.error("MongoDB update failed:", err);
      }
    }

    const list = loadLocalList();
    const idx = list.findIndex((item: any) => item.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateData };
      saveLocalList(list);
      return list[idx];
    }
    return null;
  }

  static async delete(id: string): Promise<boolean> {
    if (isMongoEnabled()) {
      try {
        const model = AssignmentModel as any;
        const query = mongoose.isValidObjectId(id) ? { _id: id } : { id: id };
        const res = await model.deleteOne(query);
        if (res.deletedCount && res.deletedCount > 0) {
          return true;
        }
      } catch (err) {
        console.error("MongoDB delete failed:", err);
      }
    }

    const list = loadLocalList();
    const idx = list.findIndex((item: any) => item.id === id);
    if (idx !== -1) {
      list.splice(idx, 1);
      saveLocalList(list);
      return true;
    }
    return false;
  }
}
