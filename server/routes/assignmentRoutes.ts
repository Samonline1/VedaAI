import { Router } from "express";
import { assignmentController } from "../controllers/assignmentController";

const router = Router();

// CRUD Endpoints for Assignment Resource
router.post("/", assignmentController.createAssignment);
router.get("/", assignmentController.getAssignments);
router.get("/:id", assignmentController.getAssignmentById);
router.delete("/:id", assignmentController.deleteAssignment);

export default router;
