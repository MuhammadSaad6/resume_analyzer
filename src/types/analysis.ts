export type JobMatchScores = {
  frontend: number;
  backend: number;
  fullstack: number;
  aiEngineer: number;
};

export type ResumeProfile = {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string[];
  education: string[];
};

export type ResumeAnalysisResult = {
  profile: ResumeProfile;
  resumeScore: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  jobMatch: JobMatchScores;
  suggestions: string[];
};

export type AnalyzeResponse = {
  success: boolean;
  data?: ResumeAnalysisResult;
  error?: string;
};
