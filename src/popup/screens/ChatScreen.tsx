import React, {useState, useRef, useEffect} from 'react';
import {AppSettings, ChatMessage} from '../../types';
import {SPACING, RADIUS, type Colors, type ThemeMode} from '../../theme';
import {loadChatHistory, saveChatHistory} from '../store/settings';
import {chatCompletion} from '../services/nvidia-ai';
import Icon from '../components/Icon';

interface Props {
  settings: AppSettings;
  colors: Colors;
  themeMode: ThemeMode;
  onBack: () => void;
}

export default function ChatScreen({settings, colors, onBack}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const c = colors;

  useEffect(() => { loadChatHistory().then(setMessages); }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: Date.now()};
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    try {
      const text = await chatCompletion(
        updated.map(m => ({role: m.role, content: m.content})),
        'You are a helpful career assistant. Help with cover letters, job applications, interview prep, and career advice.',
      );
      const assistantMsg: ChatMessage = {id: (Date.now() + 1).toString(), role: 'assistant', content: text, timestamp: Date.now()};
      const final = [...updated, assistantMsg];
      setMessages(final);
      await saveChatHistory(final);
    } catch (e: any) {
      setMessages(prev => [...prev, {id: (Date.now() + 2).toString(), role: 'assistant', content: 'Error: ' + e.message, timestamp: Date.now()}]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => { setMessages([]); saveChatHistory([]); };

  return (
    <div style={{height: 600, display: 'flex', flexDirection: 'column', background: c.bg, fontFamily: 'system-ui', color: c.textPrimary}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${c.border}`, flexShrink: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <button onClick={onBack} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex'}}>
            <Icon name="arrow-left" size={22} color={c.textPrimary} />
          </button>
          <h1 style={{fontSize: 18, fontWeight: 700, color: c.textPrimary}}>Chat</h1>
        </div>
        <button onClick={clearChat} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex'}}>
          <Icon name="delete-outline" size={18} color={c.error} />
        </button>
      </div>
      <div ref={scrollRef} style={{flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 6}}>
        {messages.length === 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, color: c.textTertiary}}>
            <Icon name="chat" size={40} color={c.textTertiary} />
            <h3 style={{fontSize: 16, color: c.textPrimary}}>Career Chat</h3>
            <p style={{fontSize: 13, textAlign: 'center', maxWidth: 280}}>Ask for help with cover letters, interviews, or career advice</p>
          </div>
        ) : messages.map(m => (
          <div key={m.id} style={{
            padding: '10px 14px', borderRadius: RADIUS.md, maxWidth: '88%',
            fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap',
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? c.accent : c.surfaceElevated,
            color: m.role === 'user' ? '#FFFFFF' : c.textPrimary,
            borderBottomRightRadius: m.role === 'user' ? 4 : RADIUS.md,
            borderBottomLeftRadius: m.role === 'assistant' ? 4 : RADIUS.md,
          }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{
            padding: '10px 14px', borderRadius: RADIUS.md, maxWidth: '88%', alignSelf: 'flex-start',
            background: c.surfaceElevated, color: c.textTertiary, fontSize: 14, opacity: 0.6,
          }}>
            Thinking...
          </div>
        )}
      </div>
      <div style={{display: 'flex', gap: 8, padding: '10px 16px', borderTop: `1px solid ${c.border}`, flexShrink: 0}}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask anything..."
          disabled={loading}
          style={{
            flex: 1, padding: '10px 14px', border: `1px solid ${c.border}`, borderRadius: RADIUS.sm,
            fontSize: 14, color: c.textPrimary, background: c.surface, outline: 'none',
          }}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} style={{
          padding: '8px 16px', border: 'none', borderRadius: RADIUS.sm,
          background: c.accent, color: '#FFFFFF', cursor: 'pointer', fontSize: 14, fontWeight: 600,
          opacity: loading || !input.trim() ? 0.5 : 1,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name="send" size={16} color="#FFFFFF" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
