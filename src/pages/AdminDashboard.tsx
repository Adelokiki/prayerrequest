import { useEffect, useState } from 'react';
import { supabase, type PrayerRequest } from '../lib/supabase';
import { LogOut, BookOpen, CheckCheck, Clock, RefreshCw } from 'lucide-react';
import logo from '../assets/AGC-Logo-Color-.png';

export default function AdminDashboard() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('prayer_requests_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_requests' }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const markAsRead = async (id: string) => {
    await supabase.from('prayer_requests').update({ is_read: true }).eq('id', id);
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, is_read: true } : r));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const filtered = requests.filter((r) => {
    if (filter === 'unread') return !r.is_read;
    if (filter === 'read') return r.is_read;
    return true;
  });

  const unreadCount = requests.filter((r) => !r.is_read).length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="AGC" className="w-6 h-auto" />
          <div>
            <h1 className="text-sm font-semibold text-slate-100">Prayer Requests</h1>
            <p className="text-xs text-slate-400">Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRequests}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Total</p>
            <p className="text-2xl font-semibold text-slate-100">{requests.length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Unread</p>
            <p className="text-2xl font-semibold text-emerald-400">{unreadCount}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Prayed For</p>
            <p className="text-2xl font-semibold text-teal-400">{requests.length - unreadCount}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 mb-6 w-fit">
          {(['all', 'unread', 'read'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === tab
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Request list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-slate-500 text-sm">No prayer requests here yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <div
                key={req.id}
                className={`bg-slate-800 border rounded-xl p-5 transition-all ${
                  req.is_read ? 'border-slate-700 opacity-70' : 'border-emerald-700/40 shadow-lg shadow-emerald-950/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap flex-1">
                    {req.message}
                  </p>
                  {!req.is_read && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                  )}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(req.created_at)}
                  </span>
                  {!req.is_read && (
                    <button
                      onClick={() => markAsRead(req.id)}
                      className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark as prayed for
                    </button>
                  )}
                  {req.is_read && (
                    <span className="flex items-center gap-1.5 text-xs text-teal-600">
                      <CheckCheck className="w-3.5 h-3.5" />
                      Prayed for
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
