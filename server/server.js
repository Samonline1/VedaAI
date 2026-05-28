import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/connection";
import assignmentRouter from "./routes/assignmentRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const clientOrigin = process.env.CLIENT_ORIGIN || "*";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", clientOrigin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/assignments", assignmentRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

async function startServer() {
  const dbConnected = await connectDB();

  if (dbConnected) {
    console.log("Database connection verified.");
  } else {
    console.log("Running in persistent JSON file database fallback mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VedaAI API running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
