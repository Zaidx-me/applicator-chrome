export interface CvExtractedProfile {
  fullName: string;
  email: string;
  phone: string;
  skills: string[];
  education: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  cvUri: string | null;
  cvFileName: string | null;
  cvContent: string | null;
  profileImageUri: string | null;
}

export interface CoverLetter {
  id: string;
  jobId: string;
  subject: string;
  body: string;
  toEmail: string;
  toPhone?: string;
  company: string;
  role: string;
  createdAt: number;
  sent: boolean;
}

export interface ExtractedJob {
  company: string;
  role_type: string;
  location?: string;
  extracted_email?: string;
}

export interface BatchResult {
  id: string;
  jobs: ExtractedJob[];
  coverLetters: CoverLetter[];
  processedAt: number;
  sourceText: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AppSettings {
  toEmail: string;
  cvLink: string;
  skills: string;
  onboardingDone: boolean;
  themeMode: 'light' | 'dark';
  aiModel: string;
  profile: UserProfile;
}
