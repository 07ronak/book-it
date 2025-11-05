import express from "express";
import {
  getAllExperiences,
  getExperienceById,
} from "../controllers/experienceController.js";

const router = express.Router();

// GET /experiences - Get all experiences
router.get("/", getAllExperiences);

// GET /api/experiences/:id - Get experience by ID with slots
router.get("/:id", getExperienceById);

export default router;
