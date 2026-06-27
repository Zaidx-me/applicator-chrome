const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';

async function callNvidiaApi(apiKey: string, body: Record<string, unknown>): Promise<string> {
  const res = await fetch(NVIDIA_ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`},
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NVIDIA API error ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content || '';
}

export async function extractJobs(apiKey: string, text: string, model?: string): Promise<string> {
  const response = await callNvidiaApi(apiKey, {
    model: model || 'meta/llama-3.1-8b-instruct',
    messages: [
      {
        role: 'system',
        content: `You are a job extraction assistant. Extract all job postings from the given text.
Return a JSON array of objects with these fields:
- company (string)
- role_type (string)
- location (string, optional)
- extracted_email (string, optional)

Return ONLY the JSON array. No markdown. No explanation.`,
      },
      {role: 'user', content: text},
    ],
    temperature: 0.1,
    max_tokens: 2048,
  });
  return response.trim();
}

export async function generateCoverLetter(
  apiKey: string,
  job: {company: string; role_type: string; extracted_email?: string},
  profile: {fullName: string; email: string; phone: string; skills: string[]},
  model?: string,
): Promise<{subject: string; body: string}> {
  const skillsText = profile.skills.join(', ');
  const response = await callNvidiaApi(apiKey, {
    model: model || 'meta/llama-3.1-8b-instruct',
    messages: [
      {
        role: 'system',
        content: `You are a professional cover letter writer. Generate a compelling cover letter email.

Rules:
- Subject line starting with "Application for"
- Professional email body (3-4 paragraphs)
- Include the candidate's skills: ${skillsText}
- Include contact info: ${profile.email} | ${profile.phone}
- Address the hiring manager directly
- End with signature: ${profile.fullName}

Return format:
---SUBJECT---
Your subject line here
---BODY---
Your email body here

No other text.`,
      },
      {
        role: 'user',
        content: `Write a cover letter for ${job.role_type} at ${job.company}.${job.extracted_email ? ` Send to: ${job.extracted_email}` : ''}`,
      },
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
  apiKey: string,
  messages: {role: string; content: string}[],
  systemPrompt: string,
  model?: string,
): Promise<string> {
  const body: Record<string, unknown> = {
    model: model || 'meta/llama-3.1-8b-instruct',
    messages: [{role: 'system', content: systemPrompt}, ...messages],
    temperature: 0.85,
    max_tokens: 2048,
  };
  return callNvidiaApi(apiKey, body);
}

export async function generateFollowUp(
  apiKey: string,
  coverLetter: {subject: string; body: string; company: string; role: string},
  profile: {fullName: string; email: string},
  model?: string,
): Promise<{subject: string; body: string}> {
  const response = await callNvidiaApi(apiKey, {
    model: model || 'meta/llama-3.1-8b-instruct',
    messages: [
      {
        role: 'system',
        content: `You write concise follow-up emails for job applications. Return ONLY the body text. No explanation.`,
      },
      {
        role: 'user',
        content: `Write a follow-up email for ${coverLetter.role} at ${coverLetter.company}.
Candidate: ${profile.fullName} (${profile.email})
Original subject: "${coverLetter.subject}"
Original body excerpt: ${coverLetter.body.substring(0, 1000)}`,
      },
    ],
    max_tokens: 800,
    temperature: 0.7,
  });
  return {subject: `Follow-up: ${coverLetter.subject}`, body: response.trim()};
}
