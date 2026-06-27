export interface Profile {
  fullName: string;
  email: string;
  phone: string;
  skills: string[];
  education: string;
}

export interface CoverLetter {
  id: string;
  jobId: string;
  subject: string;
  body: string;
  toEmail: string;
  company: string;
  role: string;
  createdAt: number;
  sent: boolean;
}

export interface JobData {
  role_type: string;
  company: string;
  location?: string;
  extracted_email?: string;
  coverLetter?: CoverLetter;
}

export interface ExtractedJobs {
  id: string;
  jobs: JobData[];
  sourceText: string;
  processedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AppData {
  nvidiaApiKey: string;
  aiModel: string;
  profile: Profile;
  coverLetters: CoverLetter[];
  extractions: ExtractedJobs[];
  chatMessages: ChatMessage[];
  targetKeywords: string;
  theme: 'light' | 'dark';
}

export const DEFAULT_DATA: AppData = {
  nvidiaApiKey: '',
  aiModel: 'meta/llama-3.1-8b-instruct',
  profile: {fullName: '', email: '', phone: '', skills: [], education: ''},
  coverLetters: [],
  extractions: [],
  chatMessages: [],
  targetKeywords: 'internship, SWE, backend, frontend, fullstack, software engineer, developer, IT',
  theme: 'light',
};
