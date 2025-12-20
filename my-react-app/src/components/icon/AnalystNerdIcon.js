import React from "react";

const AnalystNerdIcon = ({ size = 64, stroke = "#111" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Head */}
    <circle
      cx="32"
      cy="18"
      r="10"
      stroke={stroke}
      strokeWidth="2"
      fill="none"
    />

    {/* Glasses (round nerdy) */}
    <circle
      cx="27"
      cy="18"
      r="3"
      stroke={stroke}
      strokeWidth="1.5"
      fill="none"
    />
    <circle
      cx="37"
      cy="18"
      r="3"
      stroke={stroke}
      strokeWidth="1.5"
      fill="none"
    />
    <line x1="30" y1="18" x2="34" y2="18" stroke={stroke} strokeWidth="1.5" />

    {/* Eyes */}
    <circle cx="27" cy="18" r="0.8" fill={stroke} />
    <circle cx="37" cy="18" r="0.8" fill={stroke} />

    {/* Hair fringe */}
    <path
      d="M24 14c2-3 16-3 16 0"
      stroke={stroke}
      strokeWidth="1.2"
      fill="none"
    />

    {/* Smile */}
    <path
      d="M26 22c3 2 12 2 14 0"
      stroke={stroke}
      strokeWidth="1.5"
      fill="none"
    />

    {/* Body (shirt outline) */}
    <path
      d="M26 28 L38 28 L38 40 L26 40 Z"
      stroke={stroke}
      strokeWidth="1.5"
      fill="none"
    />

    {/* Tie (simple) */}
    <path
      d="M32 28 L34 34 L32 36 L30 34 Z"
      stroke={stroke}
      strokeWidth="1"
      fill="none"
    />

    {/* Small chart bars beside body */}
    <line x1="18" y1="42" x2="18" y2="38" stroke={stroke} strokeWidth="1" />
    <line x1="22" y1="42" x2="22" y2="34" stroke={stroke} strokeWidth="1" />
    <line x1="26" y1="42" x2="26" y2="30" stroke={stroke} strokeWidth="1" />
  </svg>
);

export default AnalystNerdIcon;
