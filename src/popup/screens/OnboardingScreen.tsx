import React, {useState, useRef} from 'react';
import {AppSettings, CvExtractedProfile} from '../../types';
import {SPACING, RADIUS, type Colors, type ThemeMode} from '../../theme';
import {saveSettings} from '../store/settings';
import {extractProfileFromCv} from '../services/nvidia-ai';
import Icon from '../components/Icon';

interface Props {
  settings: AppSettings;
  themeMode: ThemeMode;
  colors: Colors;
  onDone: () => void;
}

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Welcome', 'Upload CV', 'Verify', 'Ready'];

export default function OnboardingScreen({settings, themeMode, colors, onDone}: Props) {
  const [step, setStep] = useState(0);
  const [cvFileName, setCvFileName] = useState('');
  const [cvContent, setCvContent] = useState('');
  const [extractedProfile, setExtractedProfile] = useState<CvExtractedProfile | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const [verifFullName, setVerifFullName] = useState('');
  const [verifEmail, setVerifEmail] = useState('');
  const [verifPhone, setVerifPhone] = useState('');
  const [verifEducation, setVerifEducation] = useState('');
  const [verifSkills, setVerifSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [editingSkillIdx, setEditingSkillIdx] = useState(-1);
  const [editingSkillVal, setEditingSkillVal] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const c = colors;
  const isLight = c.bg === '#F7F9FC';

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvFileName(file.name);
    try {
      const text = await file.text();
      setCvContent(text);
      setIsExtracting(true);
      try {
        const profile = await extractProfileFromCv(text);
        setExtractedProfile(profile);
        setVerifFullName(profile.fullName);
        setVerifEmail(profile.email);
        setVerifPhone(profile.phone);
        setVerifEducation(profile.education);
        setVerifSkills(profile.skills);
      } catch {
        alert('Could not extract details from CV. Enter them manually.');
      } finally {
        setIsExtracting(false);
      }
    } catch {
      alert('Failed to read file. Try pasting your CV text.');
    }
  };

  const removeSkill = (idx: number) => setVerifSkills(prev => prev.filter((_, i) => i !== idx));
  const addCustomSkill = () => {
    if (skillInput.trim() && !verifSkills.includes(skillInput.trim())) {
      setVerifSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };
  const startEditSkill = (idx: number) => { setEditingSkillIdx(idx); setEditingSkillVal(verifSkills[idx]); };
  const finishEditSkill = () => {
    if (editingSkillIdx >= 0 && editingSkillVal.trim()) {
      setVerifSkills(prev => prev.map((s, i) => i === editingSkillIdx ? editingSkillVal.trim() : s));
    }
    setEditingSkillIdx(-1);
    setEditingSkillVal('');
  };

  const handleFinish = async () => {
    const updated: AppSettings = {
      ...settings,
      onboardingDone: true,
      skills: verifSkills.join(', '),
      profile: {
        ...settings.profile,
        fullName: verifFullName,
        email: verifEmail,
        phone: verifPhone,
        cvContent: cvContent || settings.profile.cvContent,
        cvFileName: cvFileName || settings.profile.cvFileName,
      },
    };
    await saveSettings(updated);
    onDone();
  };

  const canProceed = () => {
    if (step === 2) return verifFullName.trim().length > 0;
    return true;
  };

  const s = styles(c);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div style={s.stepContent}>
            <div style={s.iconCircle}>
              <Icon name="briefcase-search" size={36} color={c.accent} />
            </div>
            <h1 style={s.title}>Applicator</h1>
            <p style={s.desc}>
              Turn job postings into tailored cover letters. Upload your CV, paste job descriptions, and let AI craft your applications.
            </p>
          </div>
        );
      case 1:
        return (
          <div style={s.formContent}>
            <h2 style={s.formTitle}>Upload Your CV</h2>
            <p style={s.formSubtitle}>We'll extract your name, contact, skills, and education.</p>
            <input ref={fileInputRef} type="file" accept=".txt,.pdf,.doc,.docx" onChange={onFileChange} style={{display: 'none'}} />
            <button style={s.uploadBtn} onClick={handleFilePick} disabled={isExtracting}>
              <Icon name="cloud-upload-outline" size={28} color={isExtracting ? c.textTertiary : c.green} />
              <span style={s.uploadBtnText}>{cvFileName || 'Select PDF, DOCX, or TXT'}</span>
            </button>
            {isExtracting && (
              <div style={s.row}>
                <div style={s.spinner} />
                <span style={{fontSize: 13, color: c.green, fontWeight: 500}}>Analyzing your CV...</span>
              </div>
            )}
            {cvFileName && !isExtracting && (
              <div style={s.badge}>
                <Icon name="check-circle" size={16} color={c.green} />
                <span style={{fontSize: 13, color: c.green, fontWeight: 500}}>{cvFileName}</span>
              </div>
            )}
            {extractedProfile && !isExtracting && (
              <div style={s.summaryCard}>
                <div style={{fontSize: 13, fontWeight: 700, color: c.textPrimary, marginBottom: 8}}>Extracted Details</div>
                <div style={{fontSize: 13, color: c.textSecondary}}>Name: {extractedProfile.fullName || '—'}</div>
                {extractedProfile.email && <div style={{fontSize: 13, color: c.textSecondary}}>Email: {extractedProfile.email}</div>}
                {extractedProfile.phone && <div style={{fontSize: 13, color: c.textSecondary}}>Phone: {extractedProfile.phone}</div>}
                {extractedProfile.skills.length > 0 && (
                  <div style={{fontSize: 13, color: c.textSecondary}}>Skills: {extractedProfile.skills.slice(0, 5).join(', ')}{extractedProfile.skills.length > 5 ? '...' : ''}</div>
                )}
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div style={s.formContent}>
            <h2 style={s.formTitle}>Review Your Profile</h2>
            <p style={s.formSubtitle}>{cvContent ? 'Edit anything that looks wrong.' : 'Enter your details manually.'}</p>
            <label style={s.label}>FULL NAME *</label>
            <input style={s.input} value={verifFullName} onChange={e => setVerifFullName(e.target.value)} placeholder="John Doe" />
            <label style={s.label}>EMAIL</label>
            <input style={s.input} value={verifEmail} onChange={e => setVerifEmail(e.target.value)} placeholder="john@example.com" />
            <label style={s.label}>PHONE</label>
            <input style={s.input} value={verifPhone} onChange={e => setVerifPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
            <label style={s.label}>EDUCATION</label>
            <input style={s.input} value={verifEducation} onChange={e => setVerifEducation(e.target.value)} placeholder="BS Computer Science, XYZ University" />
            <label style={s.label}>SKILLS</label>
            <div style={s.skillsGrid}>
              {verifSkills.map((skill, i) => (
                <div key={i} style={s.skillTag}>
                  {editingSkillIdx === i ? (
                    <input style={s.editSkillInput} value={editingSkillVal} onChange={e => setEditingSkillVal(e.target.value)} onBlur={finishEditSkill} onKeyDown={e => e.key === 'Enter' && finishEditSkill()} autoFocus />
                  ) : (
                    <span style={{fontSize: 13, fontWeight: 500, color: c.green, cursor: 'pointer'}} onClick={() => startEditSkill(i)}>{skill}</span>
                  )}
                  <button style={s.skillRemoveBtn} onClick={() => removeSkill(i)}><Icon name="close-circle" size={16} color={c.green} /></button>
                </div>
              ))}
            </div>
            <div style={s.skillInputRow}>
              <input style={s.skillInput} value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill..." onKeyDown={e => e.key === 'Enter' && addCustomSkill()} />
              <button style={s.addSkillBtn} onClick={addCustomSkill}><Icon name="plus" size={20} color={c.textWhite} /></button>
            </div>
          </div>
        );
      case 3:
        return (
          <div style={s.stepContent}>
            <div style={s.iconCircle}>
              <Icon name="check-circle" size={36} color={c.accent} />
            </div>
            <h1 style={s.title}>You're All Set!</h1>
            <p style={s.desc}>Your profile is ready. You can always update it from Settings.</p>
            <div style={s.summaryCard2}>
              <div style={s.summaryRow}><Icon name="account-outline" size={16} color={c.green} /><span style={s.summaryLabel}>Name</span><span style={s.summaryValue}>{verifFullName || '—'}</span></div>
              <div style={s.summaryRow}><Icon name="email-outline" size={16} color={c.green} /><span style={s.summaryLabel}>Email</span><span style={s.summaryValue}>{verifEmail || '—'}</span></div>
              <div style={s.summaryRow}><Icon name="phone-outline" size={16} color={c.green} /><span style={s.summaryLabel}>Phone</span><span style={s.summaryValue}>{verifPhone || '—'}</span></div>
              <div style={s.summaryRow}><Icon name="school-outline" size={16} color={c.green} /><span style={s.summaryLabel}>Education</span><span style={s.summaryValue}>{verifEducation || '—'}</span></div>
              <div style={s.summaryRow}><Icon name="lightning-bolt-outline" size={16} color={c.green} /><span style={s.summaryLabel}>Skills</span><span style={s.summaryValue}>{verifSkills.length > 0 ? `${verifSkills.length} skills` : '—'}</span></div>
              {cvFileName && <div style={s.summaryRow}><Icon name="file-document-outline" size={16} color={c.green} /><span style={s.summaryLabel}>CV</span><span style={s.summaryValue}>{cvFileName}</span></div>}
            </div>
          </div>
        );
    }
  };

  return (
    <div style={s.container}>
      <div style={s.progress}>
        {STEP_LABELS.map((label, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <div style={{
              width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i <= step ? c.accent : c.surfaceElevated,
              color: i <= step ? '#FFFFFF' : c.textTertiary, fontWeight: 700, fontSize: 12,
            }}>{i + 1}</div>
            {i < TOTAL_STEPS - 1 && <div style={{width: 24, height: 2, background: i < step ? c.accent : c.border}} />}
          </div>
        ))}
      </div>
      <div style={{flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px'}}>
          {renderStep()}
        </div>
      </div>
      <div style={s.bottom}>
        {step < TOTAL_STEPS - 1 ? (
          <button style={{...s.primaryBtn, opacity: (!canProceed() || isExtracting) ? 0.5 : 1}} onClick={() => canProceed() && setStep(step + 1)} disabled={!canProceed() || isExtracting}>
            {isExtracting && step === 1 ? (
              <div style={s.spinnerSmall} />
            ) : (
              <Icon name="arrow-right" size={18} color="#FFFFFF" />
            )}
            <span style={s.primaryBtnText}>{isExtracting && step === 1 ? 'Analyzing...' : 'Continue'}</span>
          </button>
        ) : (
          <button style={s.primaryBtn} onClick={handleFinish}>
            <Icon name="check" size={18} color="#FFFFFF" />
            <span style={s.primaryBtnText}>Get Started</span>
          </button>
        )}
        {step > 0 && (
          <button style={s.backBtn} onClick={() => setStep(step - 1)}>
            <Icon name="arrow-left" size={16} color={c.textSecondary} />
            <span style={{fontSize: 14, color: c.textSecondary}}>Back</span>
          </button>
        )}
      </div>
    </div>
  );
}

const styles = (c: Colors) => ({
  container: {
    height: 600, display: 'flex', flexDirection: 'column' as const, background: c.bg, fontFamily: 'system-ui',
  },
  progress: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    padding: '16px 24px', flexShrink: 0,
  },
  stepContent: {
    flex: 1, display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  formContent: {
    padding: '0 0 16px 0', overflow: 'auto',
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    background: c.accentBg, display: 'flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  title: {fontSize: 26, fontWeight: 700, color: c.textPrimary, textAlign: 'center' as const, marginBottom: 8},
  desc: {fontSize: 14, color: c.textSecondary, textAlign: 'center' as const, lineHeight: 1.6, maxWidth: 320, marginBottom: 16},
  formTitle: {fontSize: 20, fontWeight: 700, color: c.textPrimary, textAlign: 'center' as const, marginBottom: 4},
  formSubtitle: {fontSize: 13, color: c.textSecondary, textAlign: 'center' as const, marginBottom: 20, padding: '0 20px'},
  label: {fontSize: 11, fontWeight: 600, color: c.textSecondary, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.8},
  input: {
    width: '100%', padding: '10px 14px', border: `1px solid ${c.border}`, borderRadius: RADIUS.sm,
    fontSize: 14, color: c.textPrimary, background: c.surface, outline: 'none', marginBottom: 12,
    boxSizing: 'border-box' as const,
  },
  uploadBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '20px', border: `2px dashed ${c.green}`, borderRadius: RADIUS.md,
    background: c.surface, cursor: 'pointer', marginTop: 16,
  },
  uploadBtnText: {fontSize: 14, fontWeight: 600, color: c.green},
  row: {display: 'flex', alignItems: 'center', gap: 8, marginTop: 12},
  spinner: {
    width: 16, height: 16, border: `2px solid ${c.green}`, borderTopColor: 'transparent',
    borderRadius: '50%', animation: 'spin 0.6s linear infinite',
  },
  spinnerSmall: {
    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF',
    borderRadius: '50%', animation: 'spin 0.6s linear infinite',
  },
  badge: {display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12},
  summaryCard: {
    background: c.surface, borderRadius: RADIUS.md, padding: 16, marginTop: 16,
    border: `1px solid ${c.border}`,
  },
  summaryCard2: {
    background: c.surface, borderRadius: RADIUS.md, padding: 16, marginTop: 16,
    border: `1px solid ${c.border}`, width: '100%', display: 'flex', flexDirection: 'column' as const, gap: 12,
  },
  summaryRow: {display: 'flex', alignItems: 'center', gap: 8},
  summaryLabel: {fontSize: 12, color: c.textSecondary, width: 60},
  summaryValue: {fontSize: 13, fontWeight: 500, color: c.textPrimary, flex: 1},
  skillsGrid: {display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 8},
  skillTag: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: c.greenBg, borderRadius: RADIUS.full, padding: '5px 10px',
  },
  editSkillInput: {
    fontSize: 13, fontWeight: 500, color: c.green, border: 'none',
    background: 'transparent', outline: 'none', padding: 0, minWidth: 40,
  },
  skillRemoveBtn: {background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex'},
  skillInputRow: {display: 'flex', gap: 8, marginBottom: 12},
  skillInput: {
    flex: 1, padding: '10px 14px', border: `1px solid ${c.border}`, borderRadius: RADIUS.sm,
    fontSize: 14, color: c.textPrimary, background: c.surface, outline: 'none',
  },
  addSkillBtn: {
    width: 40, height: 40, borderRadius: RADIUS.sm, background: c.green,
    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  bottom: {padding: '16px 24px', paddingBottom: 20, flexShrink: 0},
  primaryBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '14px', border: 'none', borderRadius: RADIUS.xl,
    background: c.green, color: '#FFFFFF', cursor: 'pointer', fontSize: 15, fontWeight: 600,
  },
  primaryBtnText: {fontSize: 15, fontWeight: 600, color: '#FFFFFF'},
  backBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    width: '100%', padding: '10px', marginTop: 8,
    background: 'none', border: 'none', cursor: 'pointer',
  },
});
