import { useEffect, useState } from 'react';
import Sessions from './Sessions.jsx';
import Heatmap from './Heatmap.jsx';

export default function App() {
  const [tab, setTab] = useState('sessions');
  const [auto, setAuto] = useState(false);
  const [tick, setTick] = useState(0); // bump this number to make children re-fetch

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, [auto]);

  const tabClass = (name) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition ${
      tab === name
        ? 'bg-white text-slate-900 shadow'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight">
            📊 User Analytics
          </h1>

          <nav className="flex gap-2">
            <button className={tabClass('sessions')} onClick={() => setTab('sessions')}>
              Sessions
            </button>
            <button className={tabClass('heatmap')} onClick={() => setTab('heatmap')}>
              Heatmap
            </button>
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={auto}
                onChange={(e) => setAuto(e.target.checked)}
                className="h-4 w-4 accent-sky-400"
              />
              Auto-refresh
              {auto && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              )}
            </label>
            <button
              onClick={() => setTick((t) => t + 1)}
              className="rounded-lg bg-sky-500 px-3 py-1.5 font-medium text-white transition hover:bg-sky-400"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {tab === 'sessions' ? <Sessions tick={tick} /> : <Heatmap tick={tick} />}
      </main>
    </div>
  );
}