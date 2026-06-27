import React, {useState, useRef, useEffect} from 'react';
import {AppData, ChatMessage} from '../../types';
import {loadChatHistory, saveChatHistory} from '../store/settings';
import {chatCompletion} from '../services/nvidia-ai';

interface Props {
  data: AppData;
  onBack: () => void;
  onDataChange: (d: AppData) => void;
}

export default function ChatScreen({data, onBack, onDataChange}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory().then(setMessages);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !data.nvidiaApiKey) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const text = await chatCompletion(
        data.nvidiaApiKey,
        updated.map(m => ({role: m.role, content: m.content})),
        'You are a helpful career assistant. Help with cover letters, job applications, interview prep, and career advice.',
        data.aiModel,
      );
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: Date.now(),
      };
      const final = [...updated, assistantMsg];
      setMessages(final);
      await saveChatHistory(final);
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error: ' + e.message,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    saveChatHistory([]);
  };

  return (
    <>
      <div className="app-header">
        <button className="btn-icon" onClick={onBack}>← Back</button>
        <h1>Chat</h1>
        <button className="btn-icon" onClick={clearChat} style={{color: 'var(--error)'}}>🗑️</button>
      </div>
      <div className="chat-area" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💬</div>
            <h3>Career Chat</h3>
            <p>Ask for help with cover letters, interviews, or career advice</p>
          </div>
        ) : messages.map(m => (
          <div key={m.id} className={`chat-bubble ${m.role}`}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant" style={{opacity: 0.6}}>Thinking...</div>
        )}
      </div>
      <div className="chat-input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything..."
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </>
  );
}
