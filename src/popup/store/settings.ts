import {AppData, CoverLetter, ExtractedJobs, ChatMessage, DEFAULT_DATA} from '../../types';

let cache: AppData | null = null;

export async function loadAppData(): Promise<AppData> {
  if (cache) return cache;
  const result = await chrome.storage.local.get('applicator');
  const data = result.applicator ? {...DEFAULT_DATA, ...JSON.parse(result.applicator)} : DEFAULT_DATA;
  cache = data;
  return data;
}

export async function saveAppData(data: AppData): Promise<void> {
  cache = data;
  await chrome.storage.local.set({applicator: JSON.stringify(data)});
}

export function clearCache(): void {
  cache = null;
}

export async function loadCoverLetters(): Promise<CoverLetter[]> {
  const data = await loadAppData();
  return data.coverLetters;
}

export async function saveCoverLetter(letter: CoverLetter): Promise<void> {
  const data = await loadAppData();
  data.coverLetters.unshift(letter);
  if (data.coverLetters.length > 100) data.coverLetters = data.coverLetters.slice(0, 100);
  await saveAppData(data);
}

export async function deleteCoverLetter(id: string): Promise<void> {
  const data = await loadAppData();
  data.coverLetters = data.coverLetters.filter(l => l.id !== id);
  await saveAppData(data);
}

export async function updateCoverLetter(id: string, updates: Partial<CoverLetter>): Promise<void> {
  const data = await loadAppData();
  const idx = data.coverLetters.findIndex(l => l.id === id);
  if (idx >= 0) {
    data.coverLetters[idx] = {...data.coverLetters[idx], ...updates};
    await saveAppData(data);
  }
}

export async function loadExtractions(): Promise<ExtractedJobs[]> {
  const data = await loadAppData();
  return data.extractions;
}

export async function saveExtraction(extraction: ExtractedJobs): Promise<void> {
  const data = await loadAppData();
  data.extractions.unshift(extraction);
  if (data.extractions.length > 50) data.extractions = data.extractions.slice(0, 50);
  await saveAppData(data);
}

export async function loadChatHistory(): Promise<ChatMessage[]> {
  const data = await loadAppData();
  return data.chatMessages;
}

export async function saveChatHistory(messages: ChatMessage[]): Promise<void> {
  const data = await loadAppData();
  data.chatMessages = messages.slice(-50);
  await saveAppData(data);
}
