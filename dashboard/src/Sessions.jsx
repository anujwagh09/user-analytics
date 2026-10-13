import { useEffect, useMemo, useState } from 'react';
import { getSessions, getSessionEvents } from './api.js';

const fmt = (d) => new Date(d).toLocaleString();
const path = (url) => {
  try { return new URL(url).pathname; } catch { return url; }
};

function Stat({ label, value, color }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
    </div>
  );
}

export default function Sessions({ tick }) {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  // Load the session list (on open, and whenever tick changes)
  useEffect(() => {
    getSessions()
      .then((s) => { setSessions(s); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tick]);

  // Load the journey of the selected session
  useEffect(() => {
    if (!selected) return;
    setLoadingEvents(true);
    getSessionEvents(selected)
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingEvents(false));
  }, [selected, tick]);

  function openSession(id) {
    setEvents([]);
    setSelected(id);
  }

  const filtered = useMemo(
    () => sessions.filter((s) => s.session_id.toLowerCase().includes(query.toLowerCase())),
    [sessions, query]
  );

  const totalEvents = sessions.reduce((sum, s) => sum + s.total_events, 0);
  const totalClicks = sessions.reduce((sum, s) => sum + (s.clicks || 0), 0);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          ⚠ {error}. Is the backend running on port 5000?
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Sessions" value={sessions.length} color="text-sky-600" />
        <Stat label="Total events" value={totalEvents} color="text-violet-600" />
        <Stat label="Total clicks" value={totalClicks} color="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: session list */}
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Sessions</h2>
            <input
              type="text"
              placeholder="Search session id…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </div>

          {loading ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No sessions found. Open the demo page and click around.
            </p>
          ) : (
            <div className="max-h-[32rem] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Session</th>
                    <th className="px-3 py-2">Events</th>
                    <th className="px-3 py-2">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s.session_id}
                      onClick={() => openSession(s.session_id)}
                      className={`cursor-pointer border-t border-slate-100 transition hover:bg-sky-50 ${
                        s.session_id === selected ? 'bg-sky-100' : ''
                      }`}
                    >
                      <td className="max-w-[10rem] truncate px-3 py-2 font-mono text-xs">
                        {s.session_id}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                          {s.total_events}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500">{fmt(s.last_seen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT: user journey */}
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 text-lg font-semibold">User journey</h2>

          {!selected ? (
            <p className="py-10 text-center text-sm text-slate-500">
              👈 Select a session to see what that visitor did.
            </p>
          ) : loadingEvents && events.length === 0 ? (
            <Spinner />
          ) : (
            <ol className="max-h-[32rem] overflow-auto border-l-2 border-slate-200 pl-5">
              {events.map((e) => (
                <li key={e._id} className="relative mb-5">
                  <span
                    className={`absolute -left-[1.7rem] top-1 h-3 w-3 rounded-full ring-4 ring-white ${
                      e.type === 'click' ? 'bg-amber-500' : 'bg-sky-500'
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                        e.type === 'click'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {e.type === 'click' ? '🖱 click' : '👁 page_view'}
                    </span>
                    <code className="text-sm text-slate-700">{path(e.page_url)}</code>
                    {e.type === 'click' && (
                      <span className="text-xs text-slate-500">at ({e.x}, {e.y})</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{fmt(e.timestamp)}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}