import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import logo from '../assets/AGC-Logo-Color-.png';

export default function SubmitPage() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('loading');
    setError('');

    const { error: dbError } = await supabase
      .from('prayer_requests')
      .insert({ message: message.trim() });

    if (dbError) {
      setStatus('error');
      setError('Something went wrong. Please try again.');
      return;
    }

    fetch('https://formsubmit.co/ajax/prayerteamagc@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
        _subject: 'New Anonymous Prayer Request',
        _captcha: 'false',
        _template: 'box',
      }),
    }).catch(() => {});

    setStatus('success');
    setMessage('');
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-slate-100 mb-3">Prayer Received</h2>
          <p className="text-slate-400 leading-relaxed mb-8">
            Your request has been submitted anonymously. Someone is praying for you.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="text-emerald-400 underline underline-offset-4 text-sm hover:text-emerald-300 transition-colors"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="AGC Logo" className="w-28 h-auto drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-semibold text-slate-100 mb-3 leading-tight">
              Share Your Prayer Request
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm mx-auto">
              Your request is completely anonymous. Share what is on your heart and it will be lifted in prayer.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Prayer Request
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share what is on your heart..."
              rows={6}
              className="w-full resize-none rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              required
            />
            <div className="flex items-center justify-between mt-2 mb-6">
              <span className="text-xs text-slate-500">{message.length} characters</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Anonymous
              </span>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 bg-red-950 border border-red-800 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !message.trim()}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 text-sm"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Prayer Request
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 mt-4">
              No account required. No personal information collected.
            </p>
          </form>
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-slate-600">
        All For God Center
      </footer>
    </div>
  );
}
