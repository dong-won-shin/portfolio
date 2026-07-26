import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

const sessionKey = (slug: string) => `blog-view-counted:${slug}`;

const isLocal = () =>
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

interface ViewCounterProps {
  slug: string;
  className?: string;
}

const ViewCounter: React.FC<ViewCounterProps> = ({ slug, className = '' }) => {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setViews(null);

    // Count at most once per browser session; the API also de-dupes per
    // visitor per day. Local dev only reads, so the numbers stay honest.
    let counted = true;
    try {
      counted = sessionStorage.getItem(sessionKey(slug)) !== null;
    } catch {
      /* storage blocked (private mode) — just read */
    }
    const shouldCount = !counted && !isLocal();

    const request = shouldCount
      ? fetch('/api/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        })
      : fetch(`/api/views?slug=${encodeURIComponent(slug)}`);

    request
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || typeof data?.views !== 'number') return;
        setViews(data.views);
        if (shouldCount) {
          try {
            sessionStorage.setItem(sessionKey(slug), '1');
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        /* counter is decorative — never break the post over it */
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (views === null) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm text-slate-400 ${className}`}>
      <Eye className="w-4 h-4" aria-hidden="true" />
      <span>
        {views.toLocaleString()} {views === 1 ? 'view' : 'views'}
      </span>
    </span>
  );
};

export default ViewCounter;
