import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

export default function MitraChat() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    { role: 'bot', text: t('mitraWelcome'), suggestions: ['How to vote?', 'How to register?', 'What is Triple-Lock?'] },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/mitra/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'bot', text: data.reply, suggestions: data.suggestions }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again.', suggestions: [] }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="chat-container">
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: '3rem' }}>🤖</span>
            <h1 style={{ fontSize: '1.5rem' }}><span className="gradient-text">{t('mitra')}</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your IVC voting assistant</p>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`chat-bubble ${msg.role}`}>
                  {msg.role === 'bot' && <span style={{ marginRight: 8 }}>🤖</span>}
                  {msg.text}
                </div>
                {msg.suggestions?.length > 0 && (
                  <div className="chat-suggestions" style={{ marginLeft: msg.role === 'bot' ? 0 : 'auto' }}>
                    {msg.suggestions.map((s, j) => (
                      <button key={j} onClick={() => sendMessage(s)}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="chat-bubble bot" style={{ opacity: 0.6 }}>🤖 Thinking...</div>}
            <div ref={messagesEnd} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              className="form-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('askMitra')}
              disabled={loading}
            />
            <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
