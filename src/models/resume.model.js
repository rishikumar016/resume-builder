import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  network: String,
  username: String,
  url: String,
});

const LocationSchema = new mongoose.Schema({
  address: String,
  postalCode: String,
  city: String,
  countryCode: String,
  region: String,
});

const BasicsSchema = new mongoose.Schema({
  name: String,
  label: String,
  image: String,
  email: String,
  phone: String,
  url: String,
  summary: String,
  location: LocationSchema,
  profiles: [ProfileSchema],
});

const WorkSchema = new mongoose.Schema({
  name: String,
  position: String,
  url: String,
  startDate: String,
  endDate: String,
  summary: String,
  highlights: [String],
});

const VolunteerSchema = new mongoose.Schema({
  organization: String,
  position: String,
  url: String,
  startDate: String,
  endDate: String,
  summary: String,
  highlights: [String],
});

const EducationSchema = new mongoose.Schema({
  institution: String,
  url: String,
  area: String,
  studyType: String,
  startDate: String,
  endDate: String,
  score: String,
  courses: [String],
});

const AwardSchema = new mongoose.Schema({
  title: String,
  date: String,
  awarder: String,
  summary: String,
});

const CertificateSchema = new mongoose.Schema({
  name: String,
  date: String,
  issuer: String,
  url: String,
});

const PublicationSchema = new mongoose.Schema({
  name: String,
  publisher: String,
  releaseDate: String,
  url: String,
  summary: String,
});

const SkillSchema = new mongoose.Schema({
  name: String,
  level: String,
  keywords: [String],
});

const LanguageSchema = new mongoose.Schema({
  language: String,
  fluency: String,
});

const InterestSchema = new mongoose.Schema({
  name: String,
  keywords: [String],
});

const ReferenceSchema = new mongoose.Schema({
  name: String,
  reference: String,
});

const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  highlights: [String],
  keywords: [String],
  startDate: String,
  endDate: String,
  url: String,
  roles: [String],
  entity: String,
  type: String,
});

const MetaSchema = new mongoose.Schema({
  theme: { type: String, default: "modern" },
  colorPalette: {
    primary: { type: String, default: "#3b82f6" },
    secondary: { type: String, default: "#1e40af" },
    accent: { type: String, default: "#f59e0b" },
    text: { type: String, default: "#1f2937" },
    background: { type: String, default: "#ffffff" },
  },
  typography: {
    fontFamily: { type: String, default: "Inter, sans-serif" },
    fontSize: { type: String, default: "14px" },
    lineHeight: { type: String, default: "1.5" },
  },
  layout: {
    order: {
      type: [String],
      default: ["basics", "work", "education", "skills", "projects"],
    },
    hiddenSections: { type: [String], default: [] },
  },
});

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, default: "My Resume" },
    basics: { type: BasicsSchema, default: () => ({}) },
    work: { type: [WorkSchema], default: [] },
    volunteer: { type: [VolunteerSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    awards: { type: [AwardSchema], default: [] },
    certificates: { type: [CertificateSchema], default: [] },
    publications: { type: [PublicationSchema], default: [] },
    skills: { type: [SkillSchema], default: [] },
    languages: { type: [LanguageSchema], default: [] },
    interests: { type: [InterestSchema], default: [] },
    references: { type: [ReferenceSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    meta: { type: MetaSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", ResumeSchema);
