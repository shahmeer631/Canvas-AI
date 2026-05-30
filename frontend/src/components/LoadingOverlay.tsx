import React from 'react';

// ============================================================
// Shown while AI is generating
// ============================================================

const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-0/60 backdrop-blur-sm z-20 pointer-events-none animate-fade-in">
    <div className="flex flex-col items-center gap-4">
      {/* Animated dots */}
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-accent-blue"
            style={{
              animation: `bounce 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <p className="font-body text-white/50 text-sm">Generating layout…</p>
    </div>
    <style>{`
      @keyframes bounce {
        0%, 100% { transform: translateY(0); opacity: 0.4; }
        50% { transform: translateY(-8px); opacity: 1; }
      }
    `}</style>
  </div>
);

export default LoadingOverlay;
