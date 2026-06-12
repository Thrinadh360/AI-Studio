import React from 'react';
 
interface CsyncLogoProps {
  className?: string;
  size?: number | string;
  animate?: boolean;
  withBackground?: boolean;
}
 
export const CsyncLogo: React.FC<CsyncLogoProps> = ({
  className = '',
  size = 48,
  animate = true,
  withBackground = false
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      id="csync-brand-logo"
    >
      <defs>
        {/* Futuristic Rainbow Hologram Gradients */}
        <linearGradient id="holoSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2ff" />
          <stop offset="30%" stopColor="#d946ef" />
          <stop offset="65%" stopColor="#ff007f" />
          <stop offset="100%" stopColor="#ffdd00" />
        </linearGradient>

        <linearGradient id="hexBoundaryGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#b063ff" />
          <stop offset="50%" stopColor="#ff007f" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="fineInnerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f2ff" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="letterCGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#00f2ff" />
          <stop offset="70%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#ff007f" />
        </linearGradient>

        <radialGradient id="hexFillGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#090a21" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#04091a" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#02030b" stopOpacity="0.98" />
        </radialGradient>

        <filter id="holoGlow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <filter id="hexNeonShield">
          <feGaussianBlur stdDeviation="12" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      <style>{`
        @keyframes csync-spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes csync-spin-ccw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes csync-pulse-dot {
          0%, 100% { opacity: 0.75; r: 8px; filter: drop-shadow(0 0 4px #00f2ff); }
          50% { opacity: 1; r: 13px; filter: drop-shadow(0 0 12px #ff007f); }
        }
        @keyframes csync-glow-hex {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(255, 0, 127, 0.4)) rotate(0.3deg); }
          50% { filter: drop-shadow(0 0 16px rgba(0, 242, 255, 0.75)) rotate(-0.3deg); }
        }
        .csync-spin-cw {
          transform-origin: 150px 150px;
          animation: csync-spin-cw 12s linear infinite;
        }
        .csync-spin-ccw {
          transform-origin: 150px 150px;
          animation: csync-spin-ccw 8s linear infinite;
        }
        .csync-pulse-dot {
          transform-origin: 150px 150px;
          animation: csync-pulse-dot 2s ease-in-out infinite;
        }
        .csync-glow-hex {
          transform-origin: 150px 150px;
          animation: csync-glow-hex 4s ease-in-out infinite;
        }
      `}</style>
 
      {/* Rounded square dark background box resembling the app icon uploaded */}
      {withBackground && (
        <rect
          width="300"
          height="300"
          rx="68"
          fill="#02040e"
          stroke="url(#holoSweepGrad)"
          strokeWidth="4.5"
          opacity="0.98"
        />
      )}
 
      {/* Outer concentric scanning circles with gaps (rotating clockwise) */}
      <circle
        cx="150"
        cy="150"
        r="116"
        stroke="url(#holoSweepGrad)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeDasharray="55 25 30 40"
        className={animate ? 'csync-spin-cw' : ''}
        opacity="0.95"
      />
 
      {/* Deep inner secondary fine dashed circle (rotating counter-clockwise) */}
      <circle
        cx="150"
        cy="150"
        r="128"
        stroke="url(#fineInnerGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="20 12 40 18"
        className={animate ? 'csync-spin-ccw' : ''}
        opacity="0.75"
      />
 
      {/* Regular Hexagon outline */}
      <polygon
        points="150,62 226,106 226,194 150,238 74,194 74,106"
        stroke="url(#hexBoundaryGrad)"
        strokeWidth="11"
        strokeLinejoin="round"
        className={animate ? 'csync-glow-hex' : ''}
        fill="url(#hexFillGrad)"
      />
 
      {/* Stylized sharp white letter 'C' in high-contrast display with neon gradients */}
      <path
        d="M188,118 C180,105 168,96 150,96 C118,96 98,118 98,150 C98,182 118,204 150,204 C168,204 180,195 188,182"
        stroke="url(#letterCGrad)"
        strokeWidth="16.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#holoGlow)"
      />
 
      {/* Core focus center cyan and magenta dynamic dot */}
      <circle
        cx="150"
        cy="150"
        r="11"
        fill="#ff007f"
        className={animate ? 'csync-pulse-dot' : ''}
      />
      <circle
        cx="150"
        cy="150"
        r="5.5"
        fill="#00f2ff"
      />
    </svg>
  );
};
