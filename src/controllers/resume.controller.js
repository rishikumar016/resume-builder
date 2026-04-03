import { Resume } from "../models/resume.model.js";
import { parseResumeToSchema } from "../services/ai.service.js";
import { generatePdfFromUrl } from "../services/pdf.service.js";

// @desc    Create a new resume
// @route   POST /api/resumes
// @access  Private
export const createResume = async (req, res) => {
  try {
    // Extracting fields that user might pass.
    // Defaults are handled by the Mongoose schema.
    const { title, basics, work, education, skills, projects, meta } = req.body;

    const resume = await Resume.create({
      userId: req.user._id,
      title: title || "Untitled Resume",
      basics,
      work,
      education,
      skills,
      projects,
      meta,
    });

    res.status(201).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating resume",
      error: error.message,
    });
  }
};

// @desc    Get all resumes for the logged in user
// @route   GET /api/resumes
// @access  Private
export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({
      updatedAt: -1,
    });
    res.status(200).json({ success: true, data: resumes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching resumes",
      error: error.message,
    });
  }
};

// @desc    Get single resume by ID
// @route   GET /api/resumes/:id
// @access  Private
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found or unauthorized" });
    }

    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching resume",
      error: error.message,
    });
  }
};

// @desc    Update a resume
// @route   PUT /api/resumes/:id
// @access  Private
export const updateResume = async (req, res) => {
  try {
    let resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found or unauthorized" });
    }

    // Update with exactly what is passed (Data-First architecture means raw JSON replacement)
    resume = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating resume",
      error: error.message,
    });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found or unauthorized" });
    }

    await resume.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting resume",
      error: error.message,
    });
  }
};

// @desc    Import resume from PDF
// @route   POST /api/resumes/import
// @access  Private
export const importResumeFromPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No PDF file uploaded" });
    }

    // Parse PDF text
    const pdfData = await pdfParse(req.file.buffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Could not extract text from PDF" });
    }

    // Convert to JSON using Gemini
    const extractedData = await parseResumeToSchema(rawText);

    res.status(200).json({ success: true, data: extractedData });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error importing resume",
      error: error.message,
    });
  }
};

// @desc    Export resume to PDF
// @route   GET /api/resumes/:id/pdf
// @access  Private
// @note    Requires the React frontend print route running.
export const exportResumePdf = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found or unauthorized" });
    }

    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    // Get token from header or cookie to pass to Puppeteer
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.token || "";
    // We assume the frontend has a print layout at this path
    const printUrl = `${frontendUrl}/resume/${req.params.id}/print?token=${token}`;

    const pdfBuffer = await generatePdfFromUrl(printUrl);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resume.title && resume.title.trim() !== "" ? resume.title : "resume"}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.status(200).send(pdfBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating PDF",
      error: error.message,
    });
  }
};
