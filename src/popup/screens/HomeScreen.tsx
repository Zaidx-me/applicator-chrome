import React, {useState, useRef, useEffect, useCallback} from 'react';
import {AppSettings, CoverLetter} from '../../types';
import {SPACING, RADIUS, type Colors, type ThemeMode} from '../../theme';
import {loadSettings, saveSettings, saveCoverLetter, loadHistory, saveHistory, updateCoverLetter} from '../store/settings';
import {extractAllJobs, generateCoverLetter} from '../services/nvidia-ai';
import Icon from '../components/Icon';

interface Props {
  settings: AppSettings;
  colors: Colors;
  themeMode: ThemeMode;
  onNavigate: (screen: 'settings' | 'history' | 'chat' | 'coverLetterDetail') => void;
  onSettingsChange: (s: AppSettings) => void;
}

const SITES = [
  {name: 'LinkedIn', url: 'https://linkedin.com/jobs', icon: 'linkedin'},
  {name: 'Indeed', url: 'https://indeed.com', icon: 'indeed'},
  {name: 'Rozee.pk', url: 'https://rozee.pk', icon: 'rozee'},
  {name: 'WhatsApp Web', url: 'https://web.whatsapp.com', icon: 'whatsapp'},
];

export default function HomeScreen({settings, colors, themeMode, onNavigate, onSettingsChange}: Props) {
  const [inputText, setInputText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [showScrapeMenu, setShowScrapeMenu] = useState(false);
  const [scrapingSite, setScrapingSite] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const scrapeRef = useRef<HTMLDivElement>(null);

  const c = colors;
  const isLight = c.bg === '#F7F9FC';

  useEffect(() => {
    loadHistory().then(setHistoryData);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (scrapeRef.current && !scrapeRef.current.contains(e.target as Node)) {
        setShowScrapeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setExtracting(true);
    try {
      const jobs = await extractAllJobs(inputText, settings.skills, settings.profile.cvContent || undefined);
      const result = {
        id: Date.now().toString(),
        jobs,
        coverLetters: [] as CoverLetter[],
        processedAt: Date.now(),
        sourceText: inputText,
      };
      const history = await loadHistory();
      history.unshift(result);
      await saveHistory(history);
      setHistoryData(history);
      setInputText('');
    } catch (e: any) {
      alert('Extraction failed: ' + e.message);
    } finally {
      setExtracting(false);
    }
  };

  const generateOne = async (job: {company: string; role_type: string; extracted_email?: string}) => {
    try {
      return await generateCoverLetter(job, {
        fullName: settings.profile.fullName,
        email: settings.profile.email,
        phone: settings.profile.phone,
        skills: settings.skills.split(',').map(s => s.trim()).filter(Boolean),
        cvContent: settings.profile.cvContent,
      });
    } catch (e: any) {
      throw e;
    }
  };

  const handleGenerateSingle = async (job: {company: string; role_type: string; extracted_email?: string}, resultId: string) => {
    const key = `${resultId}-${job.company}-${job.role_type}`;
    setGeneratingId(key);
    try {
      const result = await generateOne(job);
      if (!result) return;
      const letter: CoverLetter = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        jobId: resultId,
        subject: result.subject,
        body: result.body,
        toEmail: job.extracted_email || settings.profile.email,
        company: job.company,
        role: job.role_type,
        createdAt: Date.now(),
        sent: false,
      };
      await saveCoverLetter(letter);
      const h = await loadHistory();
      setHistoryData(h);
    } catch (e: any) {
      alert('Generation failed: ' + e.message);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateAll = async (result: any) => {
    setGeneratingAll(true);
    try {
      for (const job of result.jobs) {
        const resultCL = await generateCoverLetter(job, {
          fullName: settings.profile.fullName,
          email: settings.profile.email,
          phone: settings.profile.phone,
          skills: settings.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
          cvContent: settings.profile.cvContent,
        });
        const letter: CoverLetter = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          jobId: result.id,
          subject: resultCL.subject,
          body: resultCL.body,
          toEmail: job.extracted_email || settings.profile.email,
          company: job.company,
          role: job.role_type,
          createdAt: Date.now(),
          sent: false,
        };
        await saveCoverLetter(letter);
      }
      const h = await loadHistory();
      setHistoryData(h);
      alert('All cover letters generated!');
    } catch (e: any) {
      alert('Generate All failed: ' + e.message);
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleScrape = async (site: string) => {
    setShowScrapeMenu(false);
    setScrapingSite(site);
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      const tab = tabs[0];
      if (tab?.id && tab.url?.includes(site.replace('https://', '').replace('http://', '').split('/')[0])) {
        const results = await chrome.tabs.sendMessage(tab.id, {type: 'EXTRACT_ALL_JOBS'});
        if (results?.text) {
          setInputText(prev => prev + (prev ? '\n\n' : '') + results.text);
        } else {
          alert('No jobs found on this page. Try navigating to a jobs listing page first.');
        }
      } else {
        chrome.tabs.create({url: site});
      }
    } catch {
      chrome.tabs.create({url: site});
    } finally {
      setScrapingSite(null);
    }
  };

  const openGmail = (letter: CoverLetter) => {
    const uri = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(letter.toEmail)}&su=${encodeURIComponent(letter.subject)}&body=${encodeURIComponent(letter.body)}`;
    chrome.tabs.create({url: uri});
    updateCoverLetter(letter.id, {sent: true});
  };

  const style = (isLight: boolean) => ({
    glassCard: {
      background: isLight ? 'rgba(255,255,255,0.75)' : c.surface,
      backdropFilter: isLight ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: isLight ? 'blur(20px)' : 'none',
      borderRadius: RADIUS.md,
      border: `1px solid ${isLight ? 'rgba(255,255,255,0.9)' : c.border}`,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
    },
  });
  const s = style(isLight);

  return (
    <div style={{height: 600, display: 'flex', flexDirection: 'column', background: c.bg, fontFamily: 'system-ui', color: c.textPrimary}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${c.border}`, flexShrink: 0}}>
        <h1 style={{fontSize: 22, fontWeight: 700, letterSpacing: -0.3, color: c.textPrimary}}>Applicator</h1>
        <div style={{display: 'flex', gap: 4, alignItems: 'center'}}>
          <button style={headerBtn(c)} onClick={() => onNavigate('chat')}><Icon name="chat" size={18} color={c.textSecondary} /></button>
          <button style={headerBtn(c)} onClick={() => onNavigate('history')}><Icon name="file-document-outline" size={18} color={c.textSecondary} /></button>
          <button style={headerBtn(c)} onClick={() => onNavigate('settings')}><Icon name="cog" size={18} color={c.textSecondary} /></button>
        </div>
      </div>

      <div style={{flex: 1, overflow: 'auto', padding: '12px 16px'}}>
        <div style={s.glassCard}>
          <label style={{fontSize: 12, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'block'}}>
            Paste job description
          </label>
          <textarea
            ref={textRef}
            rows={4}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste job posting text here..."
            style={{
              width: '100%', padding: '10px 12px', border: `1px solid ${c.border}`, borderRadius: RADIUS.sm,
              fontSize: 14, color: c.textPrimary, background: c.surface, outline: 'none', resize: 'vertical',
              marginBottom: 10, boxSizing: 'border-box', fontFamily: 'system-ui',
            }}
          />
          <div style={{display: 'flex', gap: 8}}>
            <button
              onClick={handleExtract}
              disabled={extracting || !inputText.trim()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                flex: 1, padding: '12px', border: 'none', borderRadius: RADIUS.xl,
                background: c.accent, color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                opacity: extracting || !inputText.trim() ? 0.5 : 1,
              }}
            >
              {extracting ? (
                <div style={{width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.6s linear infinite'}} />
              ) : <Icon name="auto-fix" size={18} color="#FFFFFF" />}
              <span>{extracting ? 'Extracting...' : 'Extract Jobs'}</span>
            </button>
            <div ref={scrapeRef} style={{position: 'relative'}}>
              <button
                onClick={() => setShowScrapeMenu(!showScrapeMenu)}
                disabled={scrapingSite !== null}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '12px 16px', border: `1px solid ${c.border}`, borderRadius: RADIUS.xl,
                  background: isLight ? 'rgba(255,255,255,0.5)' : c.surface, color: c.textSecondary,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  opacity: scrapingSite ? 0.5 : 1,
                }}
              >
                {scrapingSite ? (
                  <div style={{width: 14, height: 14, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: c.accent, borderRadius: '50%', animation: 'spin 0.6s linear infinite'}} />
                ) : <Icon name="web" size={18} color={c.textSecondary} />}
                <span>{scrapingSite ? 'Opening...' : 'Scrape'}</span>
              </button>
              {showScrapeMenu && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 100,
                  background: isLight ? '#FFFFFF' : c.surface,
                  borderRadius: RADIUS.md, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: `1px solid ${c.border}`, overflow: 'hidden', minWidth: 180,
                }}>
                  <div style={{padding: '8px 12px', fontSize: 11, fontWeight: 600, color: c.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${c.border}`}}>
                    Scrape from site
                  </div>
                  {SITES.map(site => (
                    <button
                      key={site.name}
                      onClick={() => handleScrape(site.url)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '10px 14px', border: 'none', background: 'none',
                        fontSize: 14, color: c.textPrimary, cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = c.bg === '#F7F9FC' ? '#F0F0F5' : '#1A1A2E'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <Icon name={site.icon as any} size={18} color={c.accent} />
                      <span>{site.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {historyData.length > 0 ? (
          <>
            <h3 style={{fontSize: 13, fontWeight: 600, color: c.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5}}>
              Recent Extractions
            </h3>
            {historyData.slice(0, 5).map((result: any) => (
              <div key={result.id} style={s.glassCard}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                  <span style={{fontSize: 15, fontWeight: 600, color: c.textPrimary}}>{result.jobs.length} jobs</span>
                  <span style={{
                    padding: '3px 10px', borderRadius: RADIUS.full, fontSize: 11, fontWeight: 600,
                    background: c.accentBg, color: c.accent,
                  }}>
                    {new Date(result.processedAt).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                  </span>
                </div>
                <button
                  onClick={() => handleGenerateAll(result)}
                  disabled={generatingAll}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '10px', border: 'none', borderRadius: RADIUS.sm,
                    background: c.accent, color: '#FFFFFF', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', marginBottom: 10, opacity: generatingAll ? 0.5 : 1,
                  }}
                >
                  {generatingAll ? (
                    <div style={{width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.6s linear infinite'}} />
                  ) : <Icon name="auto-fix" size={16} color="#FFFFFF" />}
                  <span>{generatingAll ? 'Generating All...' : `Generate All (${result.jobs.length})`}</span>
                </button>
                {result.jobs.map((job: any, i: number) => {
                  const key = `${result.id}-${job.company}-${job.role_type}`;
                  const loading = generatingId === key;
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0', borderBottom: i < result.jobs.length - 1 ? `1px solid ${c.border}` : 'none',
                      gap: 8,
                    }}>
                      <div style={{flex: 1, minWidth: 0}}>
                        <div style={{fontSize: 14, fontWeight: 500, color: c.textPrimary}}>{job.role_type}</div>
                        <div style={{fontSize: 12, color: c.textTertiary}}>{job.company}{job.location ? ` · ${job.location}` : ''}</div>
                      </div>
                      <button
                        onClick={() => handleGenerateSingle(job, result.id)}
                        disabled={loading}
                        style={{
                          padding: '6px 12px', border: 'none', borderRadius: RADIUS.sm,
                          background: c.surfaceElevated, color: c.textSecondary,
                          fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                          opacity: loading ? 0.5 : 1,
                        }}
                      >
                        {loading ? '...' : 'Generate'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 8, color: c.textTertiary}}>
            <Icon name="briefcase-search" size={40} color={c.textTertiary} />
            <h3 style={{fontSize: 16, color: c.textPrimary, margin: 0}}>No extractions yet</h3>
            <p style={{fontSize: 13, textAlign: 'center', maxWidth: 280}}>Paste job postings above or use Scrape to pull from a job site</p>
          </div>
        )}
      </div>
    </div>
  );
}

const headerBtn = (c: Colors) => ({
  background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});
