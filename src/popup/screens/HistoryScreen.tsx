import React, {useState, useEffect} from 'react';
import {CoverLetter} from '../../types';
import {loadCoverLetters, deleteCoverLetter} from '../store/settings';

interface Props {
  onBack: () => void;
  onViewLetter: (letter: CoverLetter) => void;
}

export default function HistoryScreen({onBack, onViewLetter}: Props) {
  const [letters, setLetters] = useState<CoverLetter[]>([]);

  useEffect(() => {
    loadCoverLetters().then(setLetters);
  }, []);

  const handleDelete = (id: string) => {
    deleteCoverLetter(id).then(() => setLetters(prev => prev.filter(l => l.id !== id)));
  };

  return (
    <>
      <div className="app-header">
        <button className="btn-icon" onClick={onBack}>← Back</button>
        <h1>Cover Letters</h1>
        <div style={{width: 60}} />
      </div>
      <div className="scroll-area">
        {letters.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📄</div>
            <h3>No cover letters yet</h3>
            <p>Generated cover letters will appear here</p>
          </div>
        ) : letters.map(l => (
          <div key={l.id} className="card">
            <div className="card-top">
              <span className="card-title">{l.role} at {l.company}</span>
              <span className="badge" style={{
                background: l.sent ? 'var(--accent-bg)' : 'var(--surface-elevated)',
                color: l.sent ? 'var(--accent)' : 'var(--text-tertiary)',
              }}>
                {l.sent ? 'Sent' : 'Draft'}
              </span>
            </div>
            <div className="card-sub">{new Date(l.createdAt).toLocaleString()}</div>
            <div className="card-actions">
              <button className="btn-icon" onClick={() => onViewLetter(l)}>👁️ View</button>
              <button className="btn-icon" onClick={() => {
                const uri = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(l.toEmail)}&su=${encodeURIComponent(l.subject)}&body=${encodeURIComponent(l.body)}`;
                chrome.tabs.create({url: uri});
              }}>📧 Open in Gmail</button>
              <button className="btn-icon" style={{color: 'var(--error)'}} onClick={() => handleDelete(l.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
        <div style={{height: 20}} />
      </div>
    </>
  );
}
