import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  let uri = process.env.MONGODB_URI;
  if (uri) {
    uri = uri.trim();
    if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
      uri = uri.slice(1, -1).trim();
    }
  }

  if (!uri || (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))) {
    console.log(
      "MONGODB_URI is not configured or is missing a valid mongodb:// or mongodb+srv:// prefix. Falling back to JSON file database."
    );
    return false;
  }

  try {
    if (isConnected) return true;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    isConnected = true;
    console.log("Connected to MongoDB successfully via Mongoose.");
    return true;
  } catch (error) {
    console.error("Failed to connect to MongoDB, falling back to JSON file database:", error);
    return false;
  }
}

export function isMongoEnabled(): boolean {
  return isConnected;
}
