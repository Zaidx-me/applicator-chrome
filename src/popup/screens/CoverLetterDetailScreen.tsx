import React from 'react';
import {CoverLetter, AppData} from '../../types';
import {updateCoverLetter} from '../store/settings';

interface Props {
  letter: CoverLetter;
  onBack: () => void;
  data: AppData;
  onDataChange: (d: AppData) => void;
}

export default function CoverLetterDetailScreen({letter, onBack, data, onDataChange}: Props) {
  const openGmail = () => {
    const uri = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(letter.toEmail)}&su=${encodeURIComponent(letter.subject)}&body=${encodeURIComponent(letter.body)}`;
    chrome.tabs.create({url: uri});
    updateCoverLetter(letter.id, {sent: true}).then(() => onDataChange({...data}));
  };

  const copyBody = () => {
    navigator.clipboard.writeText(letter.body).then(() => alert('Copied!'));
  };

  return (
    <>
      <div className="app-header">
        <button className="btn-icon" onClick={onBack}>← Back</button>
        <h1 style={{fontSize: 16, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {letter.role} at {letter.company}
        </h1>
        <div style={{width: 60}} />
      </div>
      <div className="scroll-area">
        <div className="card">
          <div style={{fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4}}>Subject</div>
          <div style={{fontSize: 15, fontWeight: 600, marginBottom: 16}}>{letter.subject}</div>
          <div style={{fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4}}>To</div>
          <div style={{fontSize: 14, marginBottom: 16}}>{letter.toEmail}</div>
          <div style={{fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4}}>Body</div>
          <div style={{fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 16}}>{letter.body}</div>
          <div className="card-actions" style={{borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8}}>
            <button className="btn btn-sm btn-primary" onClick={openGmail}>
              📧 {letter.sent ? 'Open Again' : 'Open in Gmail'}
            </button>
            <button className="btn btn-sm btn-secondary" onClick={copyBody}>
              📋 Copy
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
