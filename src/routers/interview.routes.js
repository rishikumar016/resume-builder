import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import InterviewController from "../controllers/interview.controller.js";
import upload from "../middleware/file-middleware.js";
const interviewRouter = express.Router();

/**
 * @route POST /api/interview
 * @desc Generate an interview report for a candidate based on their resume and the job description
 * @access Private
 */

interviewRouter.post(
  "/",
  authMiddleware,
  upload.single("resume"),
  InterviewController.generateInterviewReportController,
);

export default interviewRouter;
