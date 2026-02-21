import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split('\n');
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2]
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\$([^$]+)\$/g, '$1')
        .replace(/\\mathfrak\{([^}]+)\}/g, '$1')
        .replace(/\\mathbb\{([^}]+)\}/g, '$1')
        .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();
      headings.push({
        id: slugify(rawText),
        text: rawText,
        level,
      });
    }
  }

  return headings;
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>('');
  const [tocOpen, setTocOpen] = useState(false);

  const headings = useMemo(() => extractHeadings(content), [content]);

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/blog/${slug}.md`);
        if (!response.ok) {
          throw new Error(`Failed to load blog post: ${response.status}`);
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadMarkdown();
    }

    window.scrollTo(0, 0);
  }, [slug]);

  // Track active heading via IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    // Small delay to let headings render
    const timer = setTimeout(() => {
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el) observer.observe(el);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
      setTocOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">{error}</p>
        <Link to="/" className="text-blue-600 hover:underline font-medium flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Portfolio</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <article>
          <MarkdownRenderer content={content} />
        </article>

        <footer className="mt-16 pt-8 border-t border-slate-200">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
        </footer>
      </main>

      {/* Desktop TOC - right sidebar */}
      {headings.length > 0 && (
        <aside className="hidden xl:block fixed right-[max(0.5rem,calc((100vw-56rem)/2-14rem))] top-24 w-48">
          <div className="border-l border-slate-200 pl-3">
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              On this page
            </h3>
            <nav className="space-y-0.5 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {headings.map((h) => (
                <button
                  key={h.id}
                  onClick={() => scrollToHeading(h.id)}
                  className={`block text-left w-full text-xs leading-snug py-0.5 transition-colors ${
                    h.level === 3 ? 'pl-2.5' : ''
                  } ${
                    activeId === h.id
                      ? 'text-blue-600 font-medium'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {h.text}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* Mobile TOC - floating button + panel */}
      {headings.length > 0 && (
        <div className="xl:hidden">
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
            aria-label="Table of Contents"
          >
            <List className="w-5 h-5" />
          </button>

          {tocOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setTocOpen(false)}
              />
              <div className="fixed bottom-20 right-6 z-50 w-72 max-h-[60vh] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">Table of Contents</h3>
                  <button
                    onClick={() => setTocOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                  >
                    &times;
                  </button>
                </div>
                <nav className="p-3 overflow-y-auto max-h-[calc(60vh-3rem)] space-y-0.5">
                  {headings.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => scrollToHeading(h.id)}
                      className={`block text-left w-full text-sm py-1.5 px-2 rounded transition-colors ${
                        h.level === 3 ? 'pl-5' : ''
                      } ${
                        activeId === h.id
                          ? 'text-blue-600 font-medium bg-blue-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {h.text}
                    </button>
                  ))}
                </nav>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogPost;
