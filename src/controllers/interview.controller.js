import { PDFParse } from "pdf-parse";
import generateInterviewReport from "../services/ai.service.js";
import InterviewReportModel from "../models/interviewReport.model.js";

const generateInterviewReportController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }
    const resumeContent = await new PDFParse(
      Uint8Array.from(req.file.buffer),
    ).getText();
    const { selfDescription, jobDescription } = req.body;
    const AIreport = await generateInterviewReport({
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
    });

    console.log("AI Report:", AIreport);

    const interviewReport = await InterviewReportModel.create({
      user: req.user._id,
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
      ...AIreport,
    });

    res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport,
    });
  } catch (err) {
    console.error("Error generating interview report:", err);
    res.status(500).json({ error: "Failed to generate interview report" });
  }
};

export default {
  generateInterviewReportController,
};
