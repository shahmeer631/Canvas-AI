import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore.js';

interface PromptBarProps {
  onGenerate: (prompt: string) => void;
}

const SAMPLE_PROMPTS = [
  'Create a star layout with 1 center node and 6 surrounding nodes',
  'Create a 3x4 grid of circles labeled A-L',
  'Create 4 rectangles in a row and 1 circle above center',
  'Create 6 circles around one center circle',
];

// ============================================================
// Prompt input bar
// ============================================================

const PromptBar: React.FC<PromptBarProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [showExamples, setShowExamples] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const examplesRef = useRef<HTMLDivElement>(null);
  const status = useCanvasStore((s) => s.status);
  const errorMessage = useCanvasStore((s) => s.errorMessage);

  const isLoading = status === 'loading';
  const canSubmit = prompt.trim().length > 0 && !isLoading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onGenerate(prompt.trim());
    setShowExamples(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const pickSample = (s: string) => {
    setPrompt(s);
    setShowExamples(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (showExamples && examplesRef.current) {
      examplesRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [showExamples]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Error banner */}
      {errorMessage && status === 'error' && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-body animate-fade-in">
          ⚠ {errorMessage}
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        <div
          className={`
            relative rounded-2xl border transition-all duration-200
            ${isLoading
              ? 'border-accent-blue/40 bg-surface-2'
              : 'border-border-default bg-surface-2 hover:border-border-default focus-within:border-accent-blue/60'
            }
          `}
        >
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowExamples(true)}
            onBlur={() => setTimeout(() => setShowExamples(false), 200)}
            disabled={isLoading}
            placeholder="Describe your canvas layout… e.g. 'Create 6 circles in a star pattern'"
            rows={2}
            className="
              w-full bg-transparent resize-none px-5 py-4 pr-36 text-sm font-body
              text-white/90 placeholder-white/25 outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              leading-relaxed
            "
          />

          {/* Actions */}
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            {/* Example prompts toggle */}
            <button
              type="button"
              onClick={() => setShowExamples((v) => !v)}
              className="text-xs text-white/30 hover:text-white/60 transition px-2 py-1 rounded-lg hover:bg-white/5"
            >
              examples
            </button>

            {/* Generate button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="
                relative overflow-hidden px-5 py-2 rounded-xl text-sm font-display font-600
                transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                bg-accent-blue text-white hover:bg-blue-400 active:scale-95
              "
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                  Generating…
                </span>
              ) : (
                'Generate'
              )}
            </button>
          </div>
        </div>

        {/* Sample prompts — inline so the page can scroll to reveal them */}
        {showExamples && (
          <div
            ref={examplesRef}
            className="mt-3 bg-surface-2 border border-border-default rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
          >
            <div className="px-4 py-2.5 text-xs text-white/30 font-body border-b border-border-subtle">
              Sample prompts
            </div>
            {SAMPLE_PROMPTS.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickSample(s)}
                className="w-full text-left px-4 py-3 text-sm font-body text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="mt-2 text-xs text-white/25 text-center font-body">
        Press <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-border-subtle text-white/40">Enter</kbd> to generate · <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-border-subtle text-white/40">⌘Z</kbd> undo · drag nodes to reposition · page scroll ↓ to see sample prompts
      </p>
    </div>
  );
};

export default PromptBar;
