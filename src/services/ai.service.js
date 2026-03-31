import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

function cleanSchema(schema) {
  if (Array.isArray(schema)) return schema.map(cleanSchema);
  if (schema && typeof schema === "object") {
    const { $schema, additionalProperties, ...rest } = schema;
    return Object.fromEntries(
      Object.entries(rest).map(([k, v]) => [k, cleanSchema(v)]),
    );
  }
  return schema;
}

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY is not defined in the environment variables.",
  );
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating the match score between the candidate's profile and the job description",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question asked during the interview"),
        intention: z
          .string()
          .describe("The intention behind asking the technical question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take, etc.",
          ),
      }),
    )
    .describe(
      "A technical question that can be asked during the interview along with the intention behind asking it and how to answer it",
    ),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The behavioral question asked during the interview"),
        intention: z
          .string()
          .describe("The intention behind asking the behavioral question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take, etc.",
          ),
      }),
    )
    .describe(
      "A behavioral question that can be asked during the interview along with the intention behind asking it and how to answer it",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill that the candidate is lacking"),
        severity: z
          .enum(["Low", "Medium", "High"])
          .describe("The severity of the skill gap"),
      }),
    )
    .describe(
      "List of skills that the candidate is lacking along with the severity of each skill gap",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z.number().describe("The day number in the preparation plan"),
        focusAreas: z
          .string()
          .describe("The main focus area for this day of the preparation plan"),
        task: z.array(
          z.string().describe("The tasks to be completed on this day"),
        ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to follow in order to improve their chances of success in the interview. The plan is divided into days, and each day has a list of tasks to be completed.",
    ),
});

const generateInterviewReport = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {
  const prompt = `Generate an interview report for a candidate based on the following job description and candidate profile. The report should include a match score between 0 and 100, a list of technical questions with their intentions and answers, a list of behavioral questions with their intentions and answers, a list of skill gaps with their severity, and a day-wise preparation plan for the candidate to follow. 
    Resume Content: ${resume}      
    Job Description: ${jobDescription}
    Candidate Profile: ${selfDescription}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: cleanSchema(z.toJSONSchema(interviewReportSchema)),
    },
  });

  return JSON.parse(response.text);
};

const resumeParserSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    basics: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        label: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        url: { type: Type.STRING },
        summary: { type: Type.STRING },
      },
      required: ["name"],
    },
    work: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          position: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          summary: { type: Type.STRING },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["name", "position"],
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          area: { type: Type.STRING },
          studyType: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          score: { type: Type.STRING },
        },
        required: ["institution"],
      },
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          level: { type: Type.STRING },
        },
        required: ["name"],
      },
    },
  },
};

export const parseResumeToSchema = async (rawText) => {
  const prompt = `
You are an expert HR Data Extraction tool. 
Map the following scraped resume text EXACTLY to the JSON schema.
Extract all work history, education, skills, and basic details.
If a field is missing in the text, omit it.
Do NOT hallucinate information.
--- TEXT ---
${rawText}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: resumeParserSchema,
    },
  });

  return JSON.parse(response.text);
};

export default generateInterviewReport;
