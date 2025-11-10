import React, { useEffect, useRef, useState } from "react";

const CustomSelect = ({ name, value = "", options = [], onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Keyboard support
  const onKeyDown = (e) => {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" || e.key === " ") setOpen((o) => !o);
  };

  const handleSelect = (val) => {
    // Preserve your existing handler shape
    onChange?.({ target: { name, value: val } });
    setOpen(false);
  };

  const label = value || placeholder;

  return (
    <div ref={ref} className="relative w-48">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-700 shadow-md
                    border-gray-300 hover:border-indigo-400 focus:outline-none
                    focus:ring-2 focus:ring-indigo-500 transition duration-200
                    flex items-center justify-between`}
      >
        <span className={`${value ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
        <span
          className={`ml-2 transition-transform duration-200 text-gray-500 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl
                    origin-top overflow-hidden
                    transition-[opacity,transform] duration-200
                    ${open ? "opacity-100 scale-y-100" : "opacity-0 scale-y-95 pointer-events-none"}`}
        role="listbox"
        tabIndex={-1}
      >
        {/* Clear option */}
        <div
          onClick={() => handleSelect("")}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
          role="option"
          aria-selected={value === ""}
        >
          {placeholder}
        </div>

        <div className="h-px bg-gray-100" />

        {options.map((opt) => (
          <div
            key={opt}
            onClick={() => handleSelect(opt)}
            role="option"
            aria-selected={value === opt}
            className={`px-4 py-2 text-sm cursor-pointer
                       hover:bg-indigo-50
                       ${value === opt ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-800"}`}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
