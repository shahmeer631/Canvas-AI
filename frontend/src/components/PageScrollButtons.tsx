import React from 'react';

const SCROLL_STEP = 320;

const btnClass =
  'p-2.5 rounded-xl bg-surface-2/95 backdrop-blur border border-border-subtle text-white/40 hover:text-white/80 hover:bg-white/5 transition shadow-lg';

// ============================================================
// Fixed scroll up / down for the whole page
// ============================================================

const PageScrollButtons: React.FC = () => {
  const scrollUp = () => window.scrollBy({ top: -SCROLL_STEP, behavior: 'smooth' });
  const scrollDown = () => window.scrollBy({ top: SCROLL_STEP, behavior: 'smooth' });

  return (
    <div className="fixed right-4 bottom-6 z-40 flex flex-col gap-2">
      <button
        type="button"
        onClick={scrollUp}
        title="Scroll page up"
        aria-label="Scroll page up"
        className={btnClass}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3L3 9h10L8 3z" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        onClick={scrollDown}
        title="Scroll page down"
        aria-label="Scroll page down"
        className={btnClass}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 13L3 7h10l-5 6z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};

export default PageScrollButtons;
