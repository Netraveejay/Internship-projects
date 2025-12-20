import React from "react";
import { FaUserTie } from "react-icons/fa";

// Custom glasses with a "taped bridge" for extra nerdiness
const NerdyGlasses = ({ size = 100, color = "#000" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left and Right Lenses */}
    <circle cx="20" cy="28" r="8" stroke={color} strokeWidth="4" />
    <circle cx="44" cy="28" r="8" stroke={color} strokeWidth="4" />

    {/* The Bridge */}
    <line x1="28" y1="28" x2="36" y2="28" stroke={color} strokeWidth="4" />

    {/* ✅ NERDY DETAIL: White tape on the bridge */}
    <rect
      x="29"
      y="25"
      width="6"
      height="6"
      fill="#fff"
      stroke={color}
      strokeWidth="1"
    />
    <line
      x1="29"
      y1="27"
      x2="35"
      y2="29"
      stroke={color}
      strokeWidth="0.5"
      opacity="0.5"
    />
  </svg>
);

// Pocket Protector component
const PocketProtector = ({ size, color }) => (
  <svg
    width={size * 0.25}
    height={size * 0.3}
    viewBox="0 0 24 30"
    style={{
      position: "absolute",
      bottom: "7%",
      right: "15%",
      zIndex: 2,
    }}
  >
    {/* Pocket Lining */}
    <rect
      x="10"
      y="6"
      width="16"
      height="18"
      fill="fgad"
      stroke="#ccccccdd"
      strokeWidth="1"
      rx="1"
    />
    {/* Pens */}
    <rect x="15" y="2" width="3" height="12" fill="blue" rx="0.5" />
    <rect x="16" y="0" width="3" height="14" fill="black" rx="0.5" />
    <rect x="17" y="4" width="3" height="10" fill="red" rx="0.5" />
  </svg>
);

const AnalystIcon = ({ size = 80, color = "orange" }) => {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Analyst body with tie */}
      <FaUserTie size={size} color={color} />

      {/* ✅ NERDY DETAIL: Pocket Protector with pens */}
      <PocketProtector size={size} color={color} />

      {/* Glasses positioned precisely on the head */}
      <div
        style={{
          position: "absolute",
          width: size * 0.7,
          height: size * 0.7,
          top: "-5%", // Adjusted for FaUserTie head position
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      >
        <NerdyGlasses size="100%" color="#000" />
      </div>
    </div>
  );
};

export default AnalystIcon;
