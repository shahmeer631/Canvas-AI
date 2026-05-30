import React from 'react';

// ============================================================
// Shown when canvas has no nodes yet
// ============================================================

const EmptyState: React.FC = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
    {/* Subtle animated rings */}
    <div className="relative w-32 h-32 mb-6">
      <div className="absolute inset-0 rounded-full border border-white/5 animate-ping" style={{ animationDuration: '3s' }} />
      <div className="absolute inset-4 rounded-full border border-white/8 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
      <div className="absolute inset-8 rounded-full border border-white/12 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.3">
          <circle cx="16" cy="16" r="5" fill="#4F8EF7" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const cx = 16 + Math.cos(rad) * 11;
            const cy = 16 + Math.sin(rad) * 11;
            return <circle key={deg} cx={cx} cy={cy} r="2.5" fill="#A78BFA" />;
          })}
        </svg>
      </div>
    </div>

    <p className="font-display font-600 text-white/20 text-lg mb-1">
      Your canvas is empty
    </p>
    <p className="font-body text-white/15 text-sm max-w-xs text-center">
      Type a prompt below and hit Generate to create your first node layout
    </p>
  </div>
);

export default EmptyState;
