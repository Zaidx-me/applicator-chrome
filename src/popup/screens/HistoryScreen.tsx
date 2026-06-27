import React, {useState, useEffect} from 'react';
import {AppSettings, CoverLetter} from '../../types';
import {SPACING, RADIUS, type Colors, type ThemeMode} from '../../theme';
import {loadCoverLetters, deleteCoverLetter, updateCoverLetter} from '../store/settings';
import {generateFollowUp} from '../services/nvidia-ai';
import Icon from '../components/Icon';

interface Props {
  settings: AppSettings;
  colors: Colors;
  themeMode: ThemeMode;
  onBack: () => void;
  onViewLetter: (l: CoverLetter) => void;
}

export default function HistoryScreen({settings, colors, themeMode, onBack, onViewLetter}: Props) {
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState<string | null>(null);
  const c = colors;

  useEffect(() => { loadCoverLetters().then(setLetters); }, []);

  const handleDelete = async (id: string) => {
    await deleteCoverLetter(id);
    setLetters(prev => prev.filter(l => l.id !== id));
  };

  const handleFollowUp = async (letter: CoverLetter) => {
    setFollowUpLoading(letter.id);
    try {
      const result = await generateFollowUp(
        {subject: letter.subject, body: letter.body, company: letter.company, role: letter.role},
        {fullName: settings.profile.fullName, email: settings.profile.email},

      );
      const uri = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(letter.toEmail)}&su=${encodeURIComponent(result.subject)}&body=${encodeURIComponent(result.body)}`;
      chrome.tabs.create({url: uri});
    } catch {
      alert('Failed to generate follow-up');
    } finally {
      setFollowUpLoading(null);
    }
  };

  const openGmail = (l: CoverLetter) => {
    const uri = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(l.toEmail)}&su=${encodeURIComponent(l.subject)}&body=${encodeURIComponent(l.body)}`;
    chrome.tabs.create({url: uri});
    updateCoverLetter(l.id, {sent: true});
  };

  return (
    <div style={{height: 600, display: 'flex', flexDirection: 'column', background: c.bg, fontFamily: 'system-ui', color: c.textPrimary}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${c.border}`, flexShrink: 0}}>
        <button onClick={onBack} style={iconBtn(c)}><Icon name="arrow-left" size={22} color={c.textPrimary} /></button>
        <h1 style={{fontSize: 18, fontWeight: 700}}>Cover Letters</h1>
      </div>
      <div style={{flex: 1, overflow: 'auto', padding: 12}}>
        {letters.length === 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 8, color: c.textTertiary}}>
            <Icon name="file-document-outline" size={40} color={c.textTertiary} />
            <h3 style={{fontSize: 16, color: c.textPrimary, margin: 0}}>No cover letters yet</h3>
            <p style={{fontSize: 13, textAlign: 'center'}}>Generated cover letters will appear here</p>
          </div>
        ) : letters.map(l => (
          <div key={l.id} style={{
            background: c.bg === '#F7F9FC' ? 'rgba(255,255,255,0.75)' : c.surface,
            backdropFilter: c.bg === '#F7F9FC' ? 'blur(20px)' : undefined,
            borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.sm,
            border: `1px solid ${c.bg === '#F7F9FC' ? 'rgba(255,255,255,0.9)' : c.border}`,
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
              <span style={{fontSize: 15, fontWeight: 600, color: c.textPrimary, flex: 1, marginRight: 8}}>{l.role} at {l.company}</span>
              <span style={{
                padding: '3px 10px', borderRadius: RADIUS.full, fontSize: 11, fontWeight: 600,
                background: l.sent ? c.accentBg : c.surfaceElevated,
                color: l.sent ? c.accent : c.textTertiary, flexShrink: 0,
              }}>{l.sent ? 'Sent' : 'Draft'}</span>
            </div>
            <div style={{fontSize: 12, color: c.textTertiary, marginBottom: 8}}>
              {new Date(l.createdAt).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
            </div>
            <div style={{display: 'flex', gap: 12, paddingTop: 10, borderTop: `1px solid ${c.border}`}}>
              <button onClick={() => onViewLetter(l)} style={actionBtn(c)}><Icon name="eye-outline" size={16} color={c.textSecondary} /><span>View</span></button>
              <button onClick={() => openGmail(l)} style={actionBtn(c)}><Icon name="email-outline" size={16} color={c.accent} /><span style={{color: c.accent}}>Gmail</span></button>
              <button onClick={() => handleFollowUp(l)} disabled={followUpLoading === l.id} style={actionBtn(c)}>
                {followUpLoading === l.id ? (
                  <div style={{width: 14, height: 14, border: `2px solid ${c.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite'}} />
                ) : <Icon name="send-check" size={16} color={c.accent} />}
                <span style={{color: c.accent}}>Follow Up</span>
              </button>
              <button onClick={() => handleDelete(l.id)} style={actionBtn(c)}><Icon name="trash-outline" size={16} color={c.error} /><span style={{color: c.error}}>Delete</span></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const iconBtn = (c: Colors) => ({background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex'});
const actionBtn = (c: Colors) => ({display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontSize: 13, color: c.textSecondary});
