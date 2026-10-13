import { useEffect, useState } from 'react';
import { getPages, getHeatmap } from './api.js';

export default function Heatmap({ tick }) {
  const [pages, setPages] = useState([]);
  const [page, setPage] = useState('');
  const [clicks, setClicks] = useState([]);
  const [size, setSize] = useState(18);        // dot size in px
  const [intensity, setIntensity] = useState(35); // dot opacity in %

  // Load the page list (on open, and on refresh)
  useEffect(() => {
    getPages().then((p) => {
      setPages(p);
      setPage((current) => current || p[0] || '');
    });
  }, [tick]);

  // Load clicks for the chosen page
  useEffect(() => {
    if (page) getHeatmap(page).then(setClicks);
  }, [page, tick]);

  // Use the biggest recorded page size so dots land in the right place
  const w = Math.max(1, ...clicks.map((c) => c.page_width || 0));
  const h = Math.max(1, ...clicks.map((c) => c.page_height || 0));

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold">Click heatmap</h2>

      <div className="mt-4 flex flex-wrap items-end gap-6">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase text-slate-500">
            Page
          </label>
          <select
            value={page}
            onChange={(e) => setPage(e.target.value)}
            className="min-w-[18rem] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          >
            {pages.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase text-slate-500">
            Dot size: {size}px
          </label>
          <input
            type="range" min="6" max="40" value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="accent-sky-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase text-slate-500">
            Intensity: {intensity}%
          </label>
          <input
            type="range" min="10" max="100" value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="accent-sky-500"
          />
        </div>

        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
          {clicks.length} clicks
        </span>
      </div>

      {pages.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">
          No pages tracked yet. Open the demo page and click around.
        </p>
      ) : clicks.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">
          No clicks recorded on this page yet.
        </p>
      ) : (
        <div
          className="relative mt-5 w-full max-w-4xl overflow-hidden rounded-lg border border-slate-300 bg-slate-50 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px]"
          style={{ aspectRatio: `${w} / ${h}` }}
        >
          {clicks.map((c, i) => (
            <span
              key={i}
              title={`(${c.x}, ${c.y})`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 transition hover:scale-150"
              style={{
                left: `${(c.x / w) * 100}%`,
                top: `${(c.y / h) * 100}%`,
                width: size,
                height: size,
                opacity: intensity / 100,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}