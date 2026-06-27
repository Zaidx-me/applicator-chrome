import React from 'react';
import {AppSettings, CoverLetter} from '../../types';
import {SPACING, RADIUS, type Colors, type ThemeMode} from '../../theme';
import {updateCoverLetter} from '../store/settings';
import Icon from '../components/Icon';

interface Props {
  settings: AppSettings;
  colors: Colors;
  themeMode: ThemeMode;
  letter: CoverLetter;
  onBack: () => void;
  onSettingsChange: (s: AppSettings) => void;
}

export default function CoverLetterDetailScreen({colors, letter, onBack, onSettingsChange}: Props) {
  const c = colors;
  const isLight = c.bg === '#F7F9FC';

  const openGmail = () => {
    const uri = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(letter.toEmail)}&su=${encodeURIComponent(letter.subject)}&body=${encodeURIComponent(letter.body)}`;
    chrome.tabs.create({url: uri});
    updateCoverLetter(letter.id, {sent: true}).then(() => onSettingsChange({} as any));
  };

  const copyBody = () => {
    navigator.clipboard.writeText(letter.body);
  };

  const glassCard = {
    background: isLight ? 'rgba(255,255,255,0.75)' : c.surface,
    backdropFilter: isLight ? 'blur(20px)' : undefined,
    borderRadius: RADIUS.md, padding: SPACING.lg,
    border: `1px solid ${isLight ? 'rgba(255,255,255,0.9)' : c.border}`,
  };

  return (
    <div style={{height: 600, display: 'flex', flexDirection: 'column', background: c.bg, fontFamily: 'system-ui'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${c.border}`, flexShrink: 0}}>
        <button onClick={onBack} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex'}}>
          <Icon name="arrow-left" size={22} color={c.textPrimary} />
        </button>
        <h1 style={{fontSize: 16, fontWeight: 700, color: c.textPrimary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {letter.role} at {letter.company}
        </h1>
      </div>
      <div style={{flex: 1, overflow: 'auto', padding: 12}}>
        <div style={glassCard}>
          <div style={{fontSize: 12, color: c.textTertiary, marginBottom: 4}}>Subject</div>
          <div style={{fontSize: 15, fontWeight: 600, color: c.textPrimary, marginBottom: 16}}>{letter.subject}</div>
          <div style={{fontSize: 12, color: c.textTertiary, marginBottom: 4}}>To</div>
          <div style={{fontSize: 14, color: c.textPrimary, marginBottom: 16}}>{letter.toEmail}</div>
          <div style={{fontSize: 12, color: c.textTertiary, marginBottom: 4}}>Body</div>
          <div style={{fontSize: 14, lineHeight: 1.6, color: c.textPrimary, whiteSpace: 'pre-wrap', marginBottom: 16}}>{letter.body}</div>
          <div style={{display: 'flex', gap: 8, paddingTop: 12, borderTop: `1px solid ${c.border}`}}>
            <button onClick={openGmail} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none',
              borderRadius: RADIUS.sm, background: c.accent, color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              <Icon name="email-outline" size={16} color="#FFFFFF" />
              <span>{letter.sent ? 'Open Again' : 'Open in Gmail'}</span>
            </button>
            <button onClick={copyBody} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none',
              borderRadius: RADIUS.sm, background: c.surfaceElevated, color: c.textSecondary, fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}>
              <Icon name="content-copy" size={16} color={c.textSecondary} />
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
