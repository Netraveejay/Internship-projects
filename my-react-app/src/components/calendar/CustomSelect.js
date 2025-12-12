import React, { useState, useRef, useEffect } from "react";

export default function CustomSelect({
  options = [],
  valueIndex = 0,
  onChangeIndex,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(valueIndex);
  const rootRef = useRef(null);

  useEffect(() => {
    setHighlight(valueIndex);
  }, [valueIndex]);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleDocumentClick);
    return () =>
      document.removeEventListener("pointerdown", handleDocumentClick);
  }, []);

  const toggle = () => setOpen((prev) => !prev);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) {
        onChangeIndex && onChangeIndex(highlight);
        setOpen(false);
      } else {
        setOpen(true);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectIndex = (index) => {
    onChangeIndex && onChangeIndex(index);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`custom-select ${className}`}>
      <button
        type="button"
        className="custom-select__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={onKeyDown}
      >
        {options[valueIndex]}
        <span className="custom-select__arrow">▾</span>
      </button>

      {open && (
        <ul role="listbox" className="custom-select__list" tabIndex={-1}>
          {options.map((opt, i) => (
            <li
              key={opt + i}
              role="option"
              aria-selected={i === valueIndex}
              className={`custom-select__option ${
                i === highlight ? "highlight" : ""
              }`}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => selectIndex(i)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
