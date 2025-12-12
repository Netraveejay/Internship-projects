import React from "react";

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      className={`theme-pill ${theme === "dark" ? "dark" : "light"}`}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className="pill-option light-opt">☀️ </span>
      <span className="pill-option dark-opt">🌙</span>
    </button>
  );
}

export default ThemeToggle;
