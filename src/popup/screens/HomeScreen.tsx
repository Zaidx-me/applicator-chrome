import React, {useState, useRef, useEffect} from 'react';
import {AppSettings, CoverLetter} from '../../types';
import {SPACING, RADIUS, type Colors, type ThemeMode} from '../../theme';
import {loadSettings, saveSettings, saveCoverLetter, loadHistory, saveHistory, updateCoverLetter} from '../store/settings';
import {extractAllJobs, generateCoverLetter} from '../services/nvidia-ai';
import Icon from '../components/Icon';
import {CoverLetter as CL} from '../../types';

interface Props {
  settings: AppSettings;
  colors: Colors;
  themeMode: ThemeMode;
  onNavigate: (screen: 'settings' | 'history' | 'chat' | 'coverLetterDetail') => void;
  onSettingsChange: (s: AppSettings) => void;
}

export default function HomeScreen({settings, colors, themeMode, onNavigate, onSettingsChange}: Props) {
  const [inputText, setInputText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const c = colors;
  const isLight = c.bg === '#F7F9FC';

  useEffect(() => {
    loadHistory().then(setHistoryData);
  }, []);

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setExtracting(true);
    try {
      const jobs = await extractAllJobs(inputText, settings.skills, settings.profile.cvContent || undefined, settings.aiModel);
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

  const handleGenerate = async (job: {company: string; role_type: string; extracted_email?: string}, resultId: string) => {
    const key = `${resultId}-${job.company}-${job.role_type}`;
    setGeneratingId(key);
    try {
      const result = await generateCoverLetter(job, {
        fullName: settings.profile.fullName,
        email: settings.profile.email,
        phone: settings.profile.phone,
        skills: settings.skills.split(',').map(s => s.trim()).filter(Boolean),
        cvContent: settings.profile.cvContent,
      }, settings.aiModel);
      const letter: CoverLetter = {
        id: Date.now().toString(),
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
          <button
            onClick={handleExtract}
            disabled={extracting || !inputText.trim()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px', border: 'none', borderRadius: RADIUS.xl,
              background: c.accent, color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              opacity: extracting || !inputText.trim() ? 0.5 : 1,
            }}
          >
            {extracting ? (
              <div style={{width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.6s linear infinite'}} />
            ) : <Icon name="auto-fix" size={18} color="#FFFFFF" />}
            <span>{extracting ? 'Extracting...' : 'Extract Jobs'}</span>
          </button>
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
                {result.jobs.map((job: any, i: number) => {
                  const key = `${result.id}-${job.company}-${job.role_type}`;
                  const loading = generatingId === key;
                  const existingLetter: CoverLetter | undefined = undefined;
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
                        onClick={async () => {
                          setGeneratingId(key);
                          try {
                            const result = await generateCoverLetter(job, {
                              fullName: settings.profile.fullName,
                              email: settings.profile.email,
                              phone: settings.profile.phone,
                              skills: settings.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
                              cvContent: settings.profile.cvContent,
                            }, settings.aiModel);
                            const letter: CoverLetter = {
                              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                              jobId: '',
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
                        }}
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
            <p style={{fontSize: 13, textAlign: 'center', maxWidth: 280}}>Paste job postings above to extract and generate cover letters</p>
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
