# Applicator — Chrome Extension

AI-powered cover letter generator. Scrape job posts from LinkedIn, Indeed, Rozee.pk, and WhatsApp Web. Generate tailored cover letters via NVIDIA API. Open Gmail compose with one click.

## Features

- **Scrape jobs** — extract all visible job postings from LinkedIn, Indeed, Rozee.pk, and WhatsApp Web messages
- **Cover letter generation** — uses your CV + job details to write personalized cover letters
- **Generate All** — one-click cover letters for every job in a batch
- **Career advisor chat** — ask about job search, interview prep, etc.
- **Follow-up emails** — generate polite follow-ups from any saved cover letter
- **History** — all saved cover letters with view/copy/Gmail/delete
- **Onboarding** — upload CV text, AI extracts your profile, skills, and contact info
- **Settings** — profile, skills, NVIDIA API key, light/dark theme
- **No hardcoded keys** — you enter your own NVIDIA API key (stored locally in chrome.storage)
- **Zero external icon dependencies** — inline SVG icons

## Quick Start

```bash
npm install
npm run build
```

Load `dist/` as an unpacked extension in Chrome (`chrome://extensions` → Load unpacked).

## Usage

1. **Add API key** — go to Settings and enter your NVIDIA API key (get one free at build.nvidia.com)
2. **Upload CV** on first run (paste text, AI extracts your profile)
3. **Scrape jobs** — click Scrape → choose a site → it opens, extracts all visible jobs, and fills the text area
4. **Or paste text** — paste job descriptions manually
5. Click **Extract Jobs** to parse companies and roles
6. Click **Generate All** or per-job **Generate** to write cover letters
7. Click **Gmail** to open compose with subject and body pre-filled
8. Use **Follow Up** from History to send a polite check-in email

## Build

```bash
npm run build    # production (dist/)
npm run dev      # development with watch mode
```

## Scrape Sources

| Site | URL | Content Script |
|------|-----|---------------|
| LinkedIn | linkedin.com/jobs | Extracts all visible job cards |
| Indeed | indeed.com | Extracts all visible job cards |
| Rozee.pk | rozee.pk | Extracts job listings |
| WhatsApp Web | web.whatsapp.com | Extracts job-related messages from active chat |

## Permissions

- `storage` — save cover letters and settings
- `activeTab` / `scripting` — inject extraction on job sites
- Host permissions for linkedin.com, indeed.com, rozee.pk, web.whatsapp.com, mail.google.com, integrate.api.nvidia.com

## Architecture

```
src/
  theme.ts                     — color tokens, spacing, radius
  types/index.ts               — shared TypeScript types
  manifest.json                — extension manifest v3
  icons/                       — 16/48/128 PNG icons
  popup/
    index.tsx                  — entry point
    App.tsx                    — root component with routing
    store/settings.ts          — chrome.storage.local wrapper
    services/nvidia-ai.ts      — all NVIDIA API calls (key via setApiKey)
    components/
      Icon.tsx                 — inline SVG icon component (50+ icons)
    screens/
      OnboardingScreen.tsx     — CV upload + AI extraction
      HomeScreen.tsx           — scrape, paste, extract, generate all
      HistoryScreen.tsx        — saved letters + follow up
      ChatScreen.tsx           — career advisor chat
      CoverLetterDetailScreen.tsx — full letter view
      SettingsScreen.tsx       — profile/skills/api key/theme
    styles/global.css          — base reset + spin animation
    index.html                 — popup HTML template
  content/
    linkedin.ts                — LinkedIn job extraction
    indeed.ts                  — Indeed job extraction
    whatsapp.ts                — WhatsApp Web message extraction
    rozee.ts                   — Rozee.pk job extraction
  background/
    service-worker.ts          — side panel setup
```
