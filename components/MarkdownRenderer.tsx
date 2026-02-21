import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractText(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child: any) => {
      if (typeof child === 'string') return child;
      // Skip KaTeX MathML (duplicate accessibility text) to avoid double-counting
      const cn = child?.props?.className;
      if (typeof cn === 'string' && cn.includes('katex-mathml')) return '';
      if (child?.props?.children) return extractText(child.props.children);
      return '';
    })
    .join('');
}

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex, rehypeHighlight]}
      components={{
        h1: ({ children }) => {
          const id = slugify(extractText(children));
          return (
            <h1 id={id} className="text-3xl font-bold text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-200 scroll-mt-20">
              {children}
            </h1>
          );
        },
        h2: ({ children }) => {
          const id = slugify(extractText(children));
          return (
            <h2 id={id} className="text-2xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-100 scroll-mt-20">
              {children}
            </h2>
          );
        },
        h3: ({ children }) => {
          const id = slugify(extractText(children));
          return (
            <h3 id={id} className="text-xl font-semibold text-slate-900 mt-6 mb-2 scroll-mt-20">
              {children}
            </h3>
          );
        },
        h4: ({ children }) => {
          const id = slugify(extractText(children));
          return (
            <h4 id={id} className="text-lg font-semibold text-blue-900 mt-6 mb-2 pl-3 border-l-[3px] border-blue-400 scroll-mt-20">
              {children}
            </h4>
          );
        },
        p: ({ children }) => (
          <p className="text-slate-700 leading-relaxed mb-4">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-outside pl-6 space-y-1 mb-4 text-slate-700">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside pl-6 space-y-1 mb-4 text-slate-700">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        blockquote: ({ children }) => {
          // Detect lightbulb callout: check if first child text starts with 💡
          const childArray = React.Children.toArray(children);
          const firstText = childArray
            .map((child: any) => {
              if (typeof child === 'string') return child;
              if (child?.props?.children) {
                const nested = React.Children.toArray(child.props.children);
                return nested.map((n: any) => {
                  if (typeof n === 'string') return n;
                  if (n?.props?.children) {
                    const deep = React.Children.toArray(n.props.children);
                    return deep.map((d: any) => (typeof d === 'string' ? d : '')).join('');
                  }
                  return '';
                }).join('');
              }
              return '';
            })
            .join('');
          const isCallout = firstText.includes('\u{1F4A1}');

          if (isCallout) {
            return (
              <blockquote
                className="not-italic my-7 rounded-xl border border-amber-300 px-6 py-5"
                style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' }}
              >
                {children}
              </blockquote>
            );
          }
          return (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50/50 text-slate-600 italic">
              {children}
            </blockquote>
          );
        },
        hr: () => (
          <hr className="my-8 border-slate-200" />
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-slate-200">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-slate-200 bg-slate-50 px-4 py-2 text-left font-semibold text-slate-900">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-slate-200 px-4 py-2 text-slate-700">{children}</td>
        ),
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          }
          return (
            <code className={`${className} block`} {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto my-4 text-sm">
            {children}
          </pre>
        ),
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt || ''}
            className="rounded-xl shadow-md my-6 max-w-full h-auto"
          />
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-slate-900">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
