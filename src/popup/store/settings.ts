import {AppSettings, CoverLetter, BatchResult, ChatMessage, CvExtractedProfile} from '../../types';

const SETTINGS_KEY = 'applicator_settings';
const COVER_LETTERS_KEY = 'applicator_cover_letters';
const HISTORY_KEY = 'applicator_history';
const CHAT_KEY = 'applicator_chat';

let settingsCache: {settings: AppSettings | null; letters: CoverLetter[] | null; history: BatchResult[] | null; chat: ChatMessage[] | null} = {
  settings: null, letters: null, history: null, chat: null,
};

const DEFAULT_SETTINGS: AppSettings = {
  toEmail: '',
  cvLink: '',
  skills: '',
  onboardingDone: false,
  themeMode: 'light',
  aiModel: 'meta/llama-3.1-8b-instruct',
  profile: {fullName: '', email: '', phone: '', cvUri: null, cvFileName: null, cvContent: null, profileImageUri: null},
};

export async function loadSettings(): Promise<AppSettings> {
  if (settingsCache.settings) return settingsCache.settings;
  try {
    const stored = await chrome.storage.local.get(SETTINGS_KEY);
    if (stored[SETTINGS_KEY]) {
      const parsed = JSON.parse(stored[SETTINGS_KEY]);
      const merged: AppSettings = {...DEFAULT_SETTINGS, ...parsed, profile: {...DEFAULT_SETTINGS.profile, ...parsed.profile}};
      settingsCache.settings = merged;
      return merged;
    }
    settingsCache.settings = DEFAULT_SETTINGS;
    return DEFAULT_SETTINGS;
  } catch {
    settingsCache.settings = DEFAULT_SETTINGS;
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  settingsCache.settings = settings;
  await chrome.storage.local.set({[SETTINGS_KEY]: JSON.stringify(settings)});
}

export function clearSettingsCache(): void {
  settingsCache = {settings: null, letters: null, history: null, chat: null};
}

export async function loadCoverLetters(): Promise<CoverLetter[]> {
  if (settingsCache.letters) return settingsCache.letters;
  try {
    const stored = await chrome.storage.local.get(COVER_LETTERS_KEY);
    const letters = stored[COVER_LETTERS_KEY] ? JSON.parse(stored[COVER_LETTERS_KEY]) : [];
    settingsCache.letters = letters;
    return letters;
  } catch {
    return [];
  }
}

export async function saveCoverLetter(letter: CoverLetter): Promise<void> {
  const letters = await loadCoverLetters();
  letters.unshift(letter);
  settingsCache.letters = letters;
  await chrome.storage.local.set({[COVER_LETTERS_KEY]: JSON.stringify(letters.slice(-100))});
}

export async function updateCoverLetter(id: string, updates: Partial<CoverLetter>): Promise<void> {
  const letters = await loadCoverLetters();
  const idx = letters.findIndex(l => l.id === id);
  if (idx >= 0) {
    letters[idx] = {...letters[idx], ...updates};
    settingsCache.letters = letters;
    await chrome.storage.local.set({[COVER_LETTERS_KEY]: JSON.stringify(letters)});
  }
}

export async function deleteCoverLetter(id: string): Promise<void> {
  const letters = await loadCoverLetters();
  const filtered = letters.filter(l => l.id !== id);
  settingsCache.letters = filtered;
  await chrome.storage.local.set({[COVER_LETTERS_KEY]: JSON.stringify(filtered)});
}

export async function loadHistory(): Promise<BatchResult[]> {
  if (settingsCache.history) return settingsCache.history;
  try {
    const stored = await chrome.storage.local.get(HISTORY_KEY);
    const history = stored[HISTORY_KEY] ? JSON.parse(stored[HISTORY_KEY]) : [];
    settingsCache.history = history;
    return history;
  } catch {
    return [];
  }
}

export async function saveHistory(history: BatchResult[]): Promise<void> {
  settingsCache.history = history;
  await chrome.storage.local.set({[HISTORY_KEY]: JSON.stringify(history.slice(-50))});
}

export async function loadChatHistory(): Promise<ChatMessage[]> {
  if (settingsCache.chat) return settingsCache.chat;
  try {
    const stored = await chrome.storage.local.get(CHAT_KEY);
    const messages = stored[CHAT_KEY] ? JSON.parse(stored[CHAT_KEY]) : [];
    settingsCache.chat = messages;
    return messages;
  } catch {
    return [];
  }
}

export async function saveChatHistory(messages: ChatMessage[]): Promise<void> {
  settingsCache.chat = messages;
  await chrome.storage.local.set({[CHAT_KEY]: JSON.stringify(messages.slice(-50))});
}
