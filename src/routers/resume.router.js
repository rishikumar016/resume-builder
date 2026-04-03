import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import upload from "../middleware/file-middleware.js";
import {
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
  importResumeFromPdf,
  exportResumePdf,
} from "../controllers/resume.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/").post(createResume).get(getUserResumes);

router.post("/import", upload.single("pdf"), importResumeFromPdf);

router.get("/:id/pdf", exportResumePdf);

router.route("/:id").get(getResumeById).put(updateResume).delete(deleteResume);

export default router;
