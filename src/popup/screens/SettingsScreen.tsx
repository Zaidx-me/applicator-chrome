import React, {useState} from 'react';
import {AppSettings} from '../../types';
import {SPACING, RADIUS, type Colors, type ThemeMode} from '../../theme';
import {saveSettings} from '../store/settings';
import Icon from '../components/Icon';

interface Props {
  settings: AppSettings;
  colors: Colors;
  themeMode: ThemeMode;
  onBack: () => void;
  onSettingsChange: (s: AppSettings) => void;
}

export default function SettingsScreen({settings, colors, themeMode, onBack, onSettingsChange}: Props) {
  const [fullName, setFullName] = useState(settings.profile.fullName);
  const [email, setEmail] = useState(settings.profile.email);
  const [phone, setPhone] = useState(settings.profile.phone);
  const [skillsText, setSkillsText] = useState(settings.skills);
  const [mode, setMode] = useState(themeMode);
  const [saving, setSaving] = useState(false);
  const c = colors;
  const isLight = c.bg === '#F7F9FC';

  const glassCard = {
    background: isLight ? 'rgba(255,255,255,0.75)' : c.surface,
    backdropFilter: isLight ? 'blur(20px)' : undefined,
    borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.sm,
    border: `1px solid ${isLight ? 'rgba(255,255,255,0.9)' : c.border}`,
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated: AppSettings = {
        ...settings,
        themeMode: mode,
        skills: skillsText,
        profile: {...settings.profile, fullName, email, phone},
      };
      await saveSettings(updated);
      onSettingsChange(updated);
      onBack();
    } catch (e: any) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{height: 600, display: 'flex', flexDirection: 'column', background: c.bg, fontFamily: 'system-ui', color: c.textPrimary}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${c.border}`, flexShrink: 0}}>
        <button onClick={onBack} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex'}}>
          <Icon name="arrow-left" size={22} color={c.textPrimary} />
        </button>
        <h1 style={{fontSize: 18, fontWeight: 700, color: c.textPrimary}}>Settings</h1>
      </div>
      <div style={{flex: 1, overflow: 'auto', padding: 12}}>
        <div style={glassCard}>
          <h3 style={{fontSize: 15, fontWeight: 600, marginBottom: 12, color: c.textPrimary}}>Profile</h3>
          <div style={{marginBottom: 12}}>
            <label style={{fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 4}}>Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" style={inputStyle(c)} />
          </div>
          <div style={{marginBottom: 12}}>
            <label style={{fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 4}}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle(c)} />
          </div>
          <div style={{marginBottom: 12}}>
            <label style={{fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 4}}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" style={inputStyle(c)} />
          </div>
          <div style={{marginBottom: 12}}>
            <label style={{fontSize: 11, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 4}}>Skills (comma-separated)</label>
            <textarea rows={3} value={skillsText} onChange={e => setSkillsText(e.target.value)} placeholder="React, TypeScript, Python, ..." style={{...inputStyle(c), resize: 'vertical'}} />
          </div>
        </div>

        <div style={glassCard}>
          <h3 style={{fontSize: 15, fontWeight: 600, marginBottom: 12, color: c.textPrimary}}>Appearance</h3>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <Icon name={mode === 'dark' ? 'weather-night' : 'weather-sunny'} size={20} color={c.accent} />
            <select value={mode} onChange={e => setMode(e.target.value as 'light' | 'dark')} style={{
              flex: 1, padding: '10px 14px', border: `1px solid ${c.border}`, borderRadius: RADIUS.sm,
              fontSize: 14, color: c.textPrimary, background: c.surface, outline: 'none',
            }}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '14px', border: 'none', borderRadius: RADIUS.xl,
            background: c.accent, color: '#FFFFFF', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            marginTop: 8, opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

const inputStyle = (c: Colors) => ({
  width: '100%', padding: '10px 14px', border: `1px solid ${c.border}`, borderRadius: RADIUS.sm,
  fontSize: 14, color: c.textPrimary, background: c.surface, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'system-ui',
});
