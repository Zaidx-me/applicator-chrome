import React, {useState} from 'react';
import {AppData} from '../../types';
import {loadAppData, saveAppData, saveCoverLetter, loadExtractions, saveExtraction} from '../store/settings';
import {extractJobs, generateCoverLetter} from '../services/nvidia-ai';
import {CoverLetter, ExtractedJobs} from '../../types';

interface Props {
  data: AppData;
  onNavigate: (screen: 'settings' | 'history' | 'chat') => void;
  onDataChange: (d: AppData) => void;
}

export default function HomeScreen({data, onNavigate, onDataChange}: Props) {
  const [inputText, setInputText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [recentJobs, setRecentJobs] = useState<ExtractedJobs[]>([]);

  React.useEffect(() => {
    loadExtractions().then(setRecentJobs);
  }, []);

  const handleExtract = async () => {
    if (!inputText.trim() || !data.nvidiaApiKey) return;
    setExtracting(true);
    try {
      const raw = await extractJobs(data.nvidiaApiKey, inputText);
      const jobs = JSON.parse(raw);
      const extraction: ExtractedJobs = {
        id: Date.now().toString(),
        jobs,
        sourceText: inputText,
        processedAt: Date.now(),
      };
      await saveExtraction(extraction);
      setRecentJobs(prev => [extraction, ...prev]);
      setInputText('');
    } catch (e: any) {
      alert('Extraction failed: ' + e.message);
    } finally {
      setExtracting(false);
    }
  };

  const handleGenerate = async (job: {company: string; role_type: string; extracted_email?: string}, extractionId: string) => {
    if (!data.nvidiaApiKey) return;
    const jobKey = `${extractionId}-${job.company}-${job.role_type}`;
    setGeneratingId(jobKey);
    try {
      const result = await generateCoverLetter(data.nvidiaApiKey, job, data.profile);
      const letter: CoverLetter = {
        id: Date.now().toString(),
        jobId: extractionId,
        subject: result.subject,
        body: result.body,
        toEmail: job.extracted_email || data.profile.email,
        company: job.company,
        role: job.role_type,
        createdAt: Date.now(),
        sent: false,
      };
      await saveCoverLetter(letter);
      const updated = await loadAppData();
      onDataChange(updated);
    } catch (e: any) {
      alert('Generation failed: ' + e.message);
    } finally {
      setGeneratingId(null);
    }
  };

  const openGmail = (letter: CoverLetter) => {
    const uri = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(letter.toEmail)}&su=${encodeURIComponent(letter.subject)}&body=${encodeURIComponent(letter.body)}`;
    chrome.tabs.create({url: uri});
  };

  return (
    <>
      <div className="app-header">
        <h1>Applicator</h1>
        <div className="app-header-actions">
          <button className="btn-icon" onClick={() => onNavigate('chat')}>💬 Chat</button>
          <button className="btn-icon" onClick={() => onNavigate('history')}>📄 History</button>
          <button className="btn-icon" onClick={() => onNavigate('settings')}>⚙️</button>
        </div>
      </div>

      <div className="scroll-area">
        {!data.nvidiaApiKey ? (
          <div className="card" style={{textAlign: 'center', padding: 32}}>
            <h3 style={{marginBottom: 8}}>Welcome to Applicator</h3>
            <p style={{fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16}}>
              Add your NVIDIA API key in Settings to get started.
            </p>
            <button className="btn btn-primary" onClick={() => onNavigate('settings')}>
              Open Settings
            </button>
          </div>
        ) : null}

        <div className="card">
          <label>Paste job description / LinkedIn text</label>
          <textarea
            rows={4}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste job posting text here..."
            style={{marginBottom: 8, resize: 'vertical'}}
          />
          <button
            className="btn btn-primary"
            onClick={handleExtract}
            disabled={extracting || !inputText.trim()}
            style={{width: '100%'}}
          >
            {extracting ? 'Extracting...' : '🔍 Extract Jobs'}
          </button>
        </div>

        {recentJobs.length > 0 ? (
          <>
            <h3 style={{fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)'}}>
              Recent Extractions
            </h3>
            {recentJobs.slice(0, 5).map(ext => (
              <div key={ext.id} className="card">
                <div className="card-top">
                  <span className="card-title">{ext.jobs.length} jobs</span>
                  <span className="badge" style={{background: 'var(--accent-bg)', color: 'var(--accent)'}}>
                    {new Date(ext.processedAt).toLocaleDateString()}
                  </span>
                </div>
                {ext.jobs.map((job, i) => {
                  const jobKey = `${ext.id}-${job.company}-${job.role_type}`;
                  const loading = generatingId === jobKey;
                  const existingLetter = data.coverLetters.find(l => l.jobId === ext.id && l.company === job.company && l.role === job.role_type);
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0', borderBottom: i < ext.jobs.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{flex: 1}}>
                        <div style={{fontSize: 14, fontWeight: 500}}>{job.role_type}</div>
                        <div style={{fontSize: 12, color: 'var(--text-tertiary)'}}>{job.company} {job.location ? `· ${job.location}` : ''}</div>
                      </div>
                      {existingLetter ? (
                        <button className="btn btn-sm btn-primary" onClick={() => openGmail(existingLetter)}>
                          📧 Open in Gmail
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleGenerate(job, ext.id)}
                          disabled={loading}
                        >
                          {loading ? '...' : 'Generate'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        ) : data.nvidiaApiKey ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>No extractions yet</h3>
            <p>Paste job postings above to extract and generate cover letters</p>
          </div>
        ) : null}
      </div>
    </>
  );
}
