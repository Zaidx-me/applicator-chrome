# Applicator — Chrome Extension

AI-powered cover letter generator that extracts job descriptions from LinkedIn and Indeed, creates tailored cover letters via NVIDIA API, and opens Gmail compose with one click.

## Features

- **Job extraction** — injects buttons on LinkedIn job cards and Indeed listings
- **Cover letter generation** — uses your CV + job details to write personalized cover letters
- **Career advisor chat** — ask questions about your job search, interview prep, etc.
- **Follow-up emails** — generate polite follow-ups from any saved cover letter
- **History** — all generated cover letters saved locally with view/copy/Gmail/delete
- **Onboarding** — upload your CV (paste text), AI extracts profile, skills, and contact info
- **Theme** — light/dark mode with glassmorphism UI
- **Zero external dependencies** — inline SVG icons, no icon font libraries

## Quick Start

```bash
npm install
npm run build
```

Load `dist/` as an unpacked extension in Chrome (`chrome://extensions` → Load unpacked).

## Usage

1. **Upload CV** on first run (paste text, AI extracts your profile)
2. **Browse jobs** on LinkedIn or Indeed — click the injected Extract button
3. **Paste text** or the extracted output into the Home screen
4. Click **Generate All** to produce cover letters
5. Click **Gmail** to open compose with subject and body pre-filled
6. Use **Follow Up** from History to send a polite check-in email

## Build

```bash
npm run build    # production (dist/)
npm run dev      # development with watch mode
```

## Permissions

- `storage` — save cover letters and settings
- `activeTab` / `scripting` — inject extraction buttons on job sites
- Host permissions for `linkedin.com`, `indeed.com`, `mail.google.com`

## Architecture

```
src/
  config.ts                    — NVIDIA API key (hidden from git)
  theme.ts                     — color tokens, spacing, radius
  types/index.ts               — shared TypeScript types
  manifest.json                — extension manifest v3
  icons/                       — 16/48/128 PNG icons
  popup/
    index.tsx                  — entry point
    App.tsx                    — root component with routing
    store/settings.ts          — chrome.storage.local wrapper
    services/nvidia-ai.ts      — all NVIDIA API calls
    components/
      Icon.tsx                 — inline SVG icon component (40+ icons)
      GlassCard.tsx            — glassmorphism card wrapper
    screens/
      OnboardingScreen.tsx     — CV upload + AI extraction
      HomeScreen.tsx           — job paste + cover letter generation
      HistoryScreen.tsx        — saved letters + follow up
      ChatScreen.tsx           — career advisor chat
      CoverLetterDetailScreen.tsx — full letter view
      SettingsScreen.tsx       — profile/skills/theme
    styles/global.css          — base reset + scrollbar styling
    index.html                 — popup HTML template
  content/
    linkedin.ts                — LinkedIn job card injection
    indeed.ts                  — Indeed job card injection
  background/
    service-worker.ts          — message relay
```
