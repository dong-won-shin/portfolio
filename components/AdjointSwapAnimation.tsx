import React, { useState, useEffect, useCallback, useMemo } from 'react';
import katex from 'katex';

function tex(s: string) {
  return katex.renderToString(s, { throwOnError: false });
}

// Layout
const S_W = 75;
const N_W = 225;
const GAP = 10;
const H = 60;
const TOTAL_W = 3 * S_W + 3 * N_W + 5 * GAP;

const IDS = ['s0', 'n0', 's1', 'n1', 's2', 'n2'];
function bw(id: string) { return id[0] === 's' ? S_W : N_W; }

// Block order per step — each swap moves ONE noise past ONE signal
const ORDERS = [
  ['s0', 'n0', 's1', 'n1', 's2', 'n2'],  // initial
  ['s0', 's1', 'n0', 'n1', 's2', 'n2'],  // n0 passes s1
  ['s0', 's1', 'n0', 's2', 'n1', 'n2'],  // n1 passes s2
  ['s0', 's1', 's2', 'n0', 'n1', 'n2'],  // n0 passes s2
];

function xPos(order: string[]) {
  const p: Record<string, number> = {};
  let x = 0;
  for (const id of order) { p[id] = x; x += bw(id) + GAP; }
  return p;
}

// Signal labels (constant)
const SIG: Record<string, string> = {
  s0: '\\Delta\\tilde{\\mathbf{R}}_{i}',
  s1: '\\Delta\\tilde{\\mathbf{R}}_{i+1}',
  s2: '\\Delta\\tilde{\\mathbf{R}}_{i+2}',
};

// Noise labels per step — orange highlights the NEWLY added ΔR̃ᵀ factor
const NOISE: Record<string, string[]> = {
  n0: [
    // Step 0: original
    '\\text{Exp}(-\\mathbf{J}_r^{i}\\,\\boldsymbol{\\eta}_i^{gd}\\,\\Delta t)',
    // Step 1: picks up ΔR̃_{i+1}^T
    '\\text{Exp}(-{\\color{#d97706}\\Delta\\tilde{\\mathbf{R}}_{i+1}^{\\mkern1mu T}}\\,\\mathbf{J}_r^{i}\\,\\boldsymbol{\\eta}_i^{gd}\\,\\Delta t)',
    // Step 2: unchanged (n1 is swapping, not n0)
    '\\text{Exp}(-\\Delta\\tilde{\\mathbf{R}}_{i+1}^{\\mkern1mu T}\\,\\mathbf{J}_r^{i}\\,\\boldsymbol{\\eta}_i^{gd}\\,\\Delta t)',
    // Step 3: picks up ΔR̃_{i+2}^T
    '\\text{Exp}(-{\\color{#d97706}\\Delta\\tilde{\\mathbf{R}}_{i+2}^{\\mkern1mu T}}\\,\\Delta\\tilde{\\mathbf{R}}_{i+1}^{\\mkern1mu T}\\,\\mathbf{J}_r^{i}\\,\\boldsymbol{\\eta}_i^{gd}\\,\\Delta t)',
  ],
  n1: [
    // Step 0: original
    '\\text{Exp}(-\\mathbf{J}_r^{i+1}\\,\\boldsymbol{\\eta}_{i+1}^{gd}\\,\\Delta t)',
    // Step 1: unchanged
    '\\text{Exp}(-\\mathbf{J}_r^{i+1}\\,\\boldsymbol{\\eta}_{i+1}^{gd}\\,\\Delta t)',
    // Step 2: picks up ΔR̃_{i+2}^T
    '\\text{Exp}(-{\\color{#d97706}\\Delta\\tilde{\\mathbf{R}}_{i+2}^{\\mkern1mu T}}\\,\\mathbf{J}_r^{i+1}\\,\\boldsymbol{\\eta}_{i+1}^{gd}\\,\\Delta t)',
    // Step 3: unchanged
    '\\text{Exp}(-\\Delta\\tilde{\\mathbf{R}}_{i+2}^{\\mkern1mu T}\\,\\mathbf{J}_r^{i+1}\\,\\boldsymbol{\\eta}_{i+1}^{gd}\\,\\Delta t)',
  ],
  n2: [
    '\\text{Exp}(-\\mathbf{J}_r^{i+2}\\,\\boldsymbol{\\eta}_{i+2}^{gd}\\,\\Delta t)',
    '\\text{Exp}(-\\mathbf{J}_r^{i+2}\\,\\boldsymbol{\\eta}_{i+2}^{gd}\\,\\Delta t)',
    '\\text{Exp}(-\\mathbf{J}_r^{i+2}\\,\\boldsymbol{\\eta}_{i+2}^{gd}\\,\\Delta t)',
    '\\text{Exp}(-\\mathbf{J}_r^{i+2}\\,\\boldsymbol{\\eta}_{i+2}^{gd}\\,\\Delta t)',
  ],
};

const NUM_STEPS = ORDERS.length;

const INFO = [
  {
    title: 'Initial: Signal & noise interleaved',
    desc: 'After the first-order split, signal rotations (blue) and noise exponentials (red) alternate.',
    hl: [] as string[],
  },
  {
    title: 'Swap #1: \u03b7\u1d62 passes through \u0394R\u0303\u1d62\u208a\u2081',
    desc: 'Adjoint identity: Exp(\u03c6)\u00b7R = R\u00b7Exp(R\u1d40\u03c6). The noise picks up \u0394R\u0303\u1d62\u208a\u2081\u1d40 inside Exp (orange).',
    hl: ['n0', 's1'],
  },
  {
    title: 'Swap #2: \u03b7\u1d62\u208a\u2081 passes through \u0394R\u0303\u1d62\u208a\u2082',
    desc: 'The second noise term passes through \u0394R\u0303\u1d62\u208a\u2082, picking up \u0394R\u0303\u1d62\u208a\u2082\u1d40 (orange).',
    hl: ['n1', 's2'],
  },
  {
    title: 'Swap #3: \u03b7\u1d62 passes through \u0394R\u0303\u1d62\u208a\u2082',
    desc: 'The first noise term also passes through \u0394R\u0303\u1d62\u208a\u2082, picking up \u0394R\u0303\u1d62\u208a\u2082\u1d40. All signals are now on the left!',
    hl: ['n0', 's2'],
  },
];

const AdjointSwapAnimation: React.FC = () => {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const next = useCallback(() => {
    setStep(s => {
      if (s >= NUM_STEPS - 1) { setPlaying(false); return 0; }
      return s + 1;
    });
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(next, 2000);
    return () => clearInterval(id);
  }, [playing, next]);

  const pos = useMemo(() => xPos(ORDERS[step]), [step]);
  const info = INFO[step];

  const rendered = useMemo(() => {
    const r: Record<string, string> = {};
    for (const id of IDS) {
      r[id] = id[0] === 's' ? tex(SIG[id]) : tex(NOISE[id][step]);
    }
    return r;
  }, [step]);

  return (
    <div
      className="my-8 rounded-2xl border border-slate-200 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {step + 1}/{NUM_STEPS}
          </span>
          <span className="text-sm font-semibold text-slate-800">{info.title}</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{info.desc}</p>
      </div>

      {/* Animation area */}
      <div className="px-5 overflow-x-auto pb-2">
        <div className="relative mx-auto" style={{ width: TOTAL_W + 20, height: H + 12 }}>
          {/* Multiplication dots */}
          {ORDERS[step].slice(0, -1).map((id, i) => (
            <span
              key={`d-${i}`}
              className="absolute text-slate-400 select-none"
              style={{
                left: pos[id] + bw(id) + 1,
                top: H / 2 - 6,
                width: GAP - 2,
                textAlign: 'center',
                fontSize: 16,
              }}
            >
              &middot;
            </span>
          ))}

          {/* Ellipsis */}
          <span
            className="absolute text-slate-400 select-none"
            style={{ left: TOTAL_W + 2, top: H / 2 - 8, fontSize: 15 }}
          >
            &hellip;
          </span>

          {/* Blocks */}
          {IDS.map(id => {
            const sig = id[0] === 's';
            const hl = info.hl.includes(id);
            return (
              <div
                key={id}
                className="absolute"
                style={{
                  width: bw(id),
                  height: H,
                  transform: `translateX(${pos[id]}px)`,
                  transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  zIndex: hl ? 10 : 1,
                }}
              >
                <div
                  className={`w-full h-full rounded-lg flex items-center justify-center border-2 transition-shadow duration-300 ${
                    sig
                      ? 'bg-blue-50 border-blue-400'
                      : 'bg-red-50 border-red-400'
                  }`}
                  style={{
                    boxShadow: hl
                      ? '0 0 0 3px #fbbf24, 0 4px 12px rgba(251,191,36,0.3)'
                      : '0 1px 3px rgba(0,0,0,0.08)',
                    padding: '0 6px',
                  }}
                >
                  <span
                    style={{ fontSize: '0.55rem', lineHeight: 1, display: 'flex', alignItems: 'center' }}
                    dangerouslySetInnerHTML={{ __html: rendered[id] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 px-5 py-3">
        <button
          onClick={() => { setPlaying(false); setStep(Math.max(0, step - 1)); }}
          disabled={step === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          &larr; Prev
        </button>
        <button
          onClick={() => {
            if (!playing && step >= NUM_STEPS - 1) setStep(0);
            setPlaying(!playing);
          }}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          {playing ? '\u23F8 Pause' : '\u25B6 Play'}
        </button>
        <button
          onClick={() => { setPlaying(false); setStep(Math.min(NUM_STEPS - 1, step + 1)); }}
          disabled={step === NUM_STEPS - 1}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next &rarr;
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-5 pb-3 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-blue-50 border-2 border-blue-400" />
          Signal rotation
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-red-50 border-2 border-red-400" />
          Noise exponential
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: '#d97706' }} />
          Newly added factor
        </span>
      </div>
    </div>
  );
};

export default AdjointSwapAnimation;
