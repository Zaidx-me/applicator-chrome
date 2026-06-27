import {CONFIG} from '../../config';
import {CvExtractedProfile} from '../../types';

const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'meta/llama-3.1-8b-instruct';

async function callNvidiaApi(body: Record<string, unknown>): Promise<string> {
  const start = Date.now();
  const response = await fetch(NVIDIA_ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: `Bearer ${CONFIG.NVIDIA_API_KEY}`},
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error ${response.status} (${Date.now() - start}ms)\n${errorText.substring(0, 500)}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function extractProfileFromCv(cvText: string): Promise<CvExtractedProfile> {
  const response = await callNvidiaApi({
    model: MODEL,
    messages: [
      {role: 'system', content: `You are a precision CV/resume parsing engine. Extract structured profile data from raw CV text.

Output ONLY valid JSON. No markdown. No explanation. No trailing text.

{
  "fullName": "string or empty",
  "email": "string or empty",
  "phone": "string or empty",
  "skills": ["array of strings"],
  "education": "string or empty"
}

Rules:
- fullName: extract from CV header/contact block. Strip job titles, honorifics.
- email: primary email from contact section. Never fabricate.
- phone: normalize Pakistani numbers to +92 3XX XXXXXXX format. International numbers as-is.
- skills: extract ALL technical and professional skills mentioned.
- education: brief summary (degree, field, institution).`},
      {role: 'user', content: cvText.substring(0, 8000)},
    ],
    temperature: 0.1,
    max_tokens: 1024,
  });
  try {
    const cleaned = response.replace(/```json\s*([\s\S]*?)```/g, '$1').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse extracted profile');
  }
}

export async function extractAllJobs(
  messagesText: string,
  skills: string,
  cvContent?: string,
): Promise<{company: string; role_type: string; location?: string; extracted_email?: string}[]> {
  const cvSection = cvContent ? `\nCANDIDATE'S CV:\n---\n${cvContent.substring(0, 4000)}\n---\n` : '';
  const profileSection = `CANDIDATE SKILLS: ${skills || 'Not provided'}${cvSection}`;

  const response = await callNvidiaApi({
    model: MODEL,
    messages: [
      {role: 'system', content: `You extract job postings from text. Return a JSON array of {company, role_type, location, extracted_email}. Only the JSON array. No explanation.`},
      {role: 'user', content: `${profileSection}\n\nTEXT TO EXTRACT FROM:\n${messagesText}`},
    ],
    temperature: 0.1,
    max_tokens: 2048,
  });
  try {
    const cleaned = response.replace(/```json\s*([\s\S]*?)```/g, '$1').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse extracted jobs');
  }
}

export async function generateCoverLetter(
  job: {company: string; role_type: string; extracted_email?: string},
  profile: {fullName: string; email: string; phone: string; skills: string[]; cvContent?: string | null},
): Promise<{subject: string; body: string}> {
  const skillsText = profile.skills.join(', ');
  const cvSection = profile.cvContent ? `\nCV CONTEXT:\n${profile.cvContent.substring(0, 2000)}\n` : '';
  const response = await callNvidiaApi({
    model: MODEL,
    messages: [
      {role: 'system', content: `You are a professional cover letter writer. Generate a compelling cover letter email.

Rules:
- Subject line starting with "Application for"
- Professional email body (3-4 paragraphs)
- Include candidate skills: ${skillsText}
- Contact: ${profile.email} | ${profile.phone}
- Address hiring manager directly
- End with signature: ${profile.fullName}${cvSection}

Return format:
---SUBJECT---
Your subject line here
---BODY---
Your email body here`},
      {role: 'user', content: `Write a cover letter for ${job.role_type} at ${job.company}.`},
    ],
    temperature: 0.85,
    max_tokens: 1024,
  });
  const subjectMatch = response.match(/---SUBJECT---\s*([\s\S]*?)\s*---BODY---/);
  const bodyMatch = response.match(/---BODY---\s*([\s\S]*)/);
  return {
    subject: subjectMatch?.[1]?.trim() || `Application for ${job.role_type} at ${job.company}`,
    body: bodyMatch?.[1]?.trim() || response.trim(),
  };
}

export async function chatCompletion(
  messages: {role: string; content: string}[],
  systemPrompt: string,
): Promise<string> {
  return callNvidiaApi({
    model: MODEL,
    messages: [{role: 'system', content: systemPrompt}, ...messages],
    temperature: 0.85,
    max_tokens: 2048,
  });
}

export async function generateFollowUp(
  coverLetter: {subject: string; body: string; company: string; role: string},
  profile: {fullName: string; email: string},
): Promise<{subject: string; body: string}> {
  const response = await callNvidiaApi({
    model: MODEL,
    messages: [
      {role: 'system', content: 'You write concise follow-up emails for job applications. Return ONLY the body text.'},
      {role: 'user', content: `Write a follow-up email for ${coverLetter.role} at ${coverLetter.company}.\nCandidate: ${profile.fullName} (${profile.email})\nOriginal subject: "${coverLetter.subject}"\nOriginal body: ${coverLetter.body.substring(0, 1000)}`},
    ],
    max_tokens: 800,
    temperature: 0.7,
  });
  return {subject: `Follow-up: ${coverLetter.subject}`, body: response.trim()};
}
