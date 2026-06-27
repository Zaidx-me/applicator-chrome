import React, {useState} from 'react';
import {AppData} from '../../types';
import {saveAppData} from '../store/settings';

interface Props {
  data: AppData;
  onBack: () => void;
  onDataChange: (d: AppData) => void;
}

export default function SettingsScreen({data, onBack, onDataChange}: Props) {
  const [apiKey, setApiKey] = useState(data.nvidiaApiKey);
  const [model, setModel] = useState(data.aiModel);
  const [fullName, setFullName] = useState(data.profile.fullName);
  const [email, setEmail] = useState(data.profile.email);
  const [phone, setPhone] = useState(data.profile.phone);
  const [skillsText, setSkillsText] = useState(data.profile.skills.join(', '));
  const [theme, setTheme] = useState(data.theme);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated: AppData = {
        ...data,
        nvidiaApiKey: apiKey,
        aiModel: model,
        profile: {
          ...data.profile,
          fullName,
          email,
          phone,
          skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
        },
        theme,
      };
      await saveAppData(updated);
      onDataChange(updated);
      onBack();
    } catch (e: any) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="app-header">
        <button className="btn-icon" onClick={onBack}>← Back</button>
        <h1>Settings</h1>
        <div style={{width: 60}} />
      </div>
      <div className="scroll-area">
        <div className="card">
          <h3 style={{fontSize: 15, fontWeight: 600, marginBottom: 12}}>API Configuration</h3>
          <div className="form-group">
            <label>NVIDIA API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="nvapi-..."
            />
          </div>
          <div className="form-group">
            <label>AI Model</label>
            <select value={model} onChange={e => setModel(e.target.value)}>
              <option value="meta/llama-3.1-8b-instruct">Llama 3.1 8B</option>
              <option value="meta/llama-3.2-3b-instruct">Llama 3.2 3B</option>
              <option value="mistralai/mistral-7b-instruct-v0.3">Mistral 7B</option>
            </select>
          </div>
        </div>

        <div className="card">
          <h3 style={{fontSize: 15, fontWeight: 600, marginBottom: 12}}>Profile</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
          </div>
          <div className="form-group">
            <label>Skills (comma-separated)</label>
            <textarea
              rows={2}
              value={skillsText}
              onChange={e => setSkillsText(e.target.value)}
              placeholder="React, TypeScript, Python, ..."
            />
          </div>
        </div>

        <div className="card">
          <h3 style={{fontSize: 15, fontWeight: 600, marginBottom: 12}}>Appearance</h3>
          <div className="form-group">
            <select value={theme} onChange={e => setTheme(e.target.value as 'light' | 'dark')}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{width: '100%', marginTop: 8}}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <div style={{height: 20}} />
      </div>
    </>
  );
}
