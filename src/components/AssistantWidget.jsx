import { MessageSquareText, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client.js';

const suggestions = [
  'Summarize this week',
  'Show current blockers',
  'What is the recent focus?'
];

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState('Ask about recent reports, blockers, or team activity. The assistant summarizes only the reports your role is allowed to view.');
  const [loading, setLoading] = useState(false);

  async function ask(event) {
    event.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/assistant/chat', { message });
      setAnswer(res.data.answer);
      setMessage('');
    } catch (_error) {
      setAnswer('Assistant is available, but this request could not be completed. Please check that the API server is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`assistant ${open ? 'open' : ''}`}>
      {open && (
        <section className="assistant-panel">
          <header className="assistant-header">
            <div className="assistant-header-icon" aria-hidden="true">
              <Sparkles size={14} />
            </div>
            <div>
              <strong>Assistant</strong>
              <span>Private team summary</span>
            </div>
          </header>
          <div className="assistant-suggestions">
            {suggestions.map((item) => (
              <button key={item} type="button" onClick={() => setMessage(item)}>{item}</button>
            ))}
          </div>
          <div className="assistant-answer">
            <MessageSquareText size={18} />
            <span>{loading ? 'Reading the latest report data...' : answer}</span>
          </div>
          <form onSubmit={ask} className="assistant-form">
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about team reports" />
            <button aria-label="Send" disabled={loading}><Send size={16} /></button>
          </form>
        </section>
      )}
      <button className="assistant-toggle" onClick={() => setOpen((value) => !value)} aria-label="Assistant">
        <Sparkles size={14} />
      </button>
    </div>
  );
}
