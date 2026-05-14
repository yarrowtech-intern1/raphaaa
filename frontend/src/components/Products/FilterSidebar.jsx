import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";

const MIN_BOUND = 500;
const MAX_BOUND = 10000;
const STEP = 50;
const MIN_GAP = 0;

const COLOR_MAP = {
  Red: "#ef4444", Blue: "#3b82f6", Black: "#111827", Green: "#22c55e",
  Yellow: "#eab308", Gray: "#9ca3af", White: "#f9fafb", Pink: "#ec4899",
  Beige: "#d4b896", Navy: "#1e3a5f", Orange: "#f97316", Purple: "#a855f7",
  Brown: "#92400e", Teal: "#14b8a6",
};

const FilterSidebar = ({ onClose }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options`)
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.filter((o) => o.type === "category").map((o) => o.value));
        setGenders(data.filter((o) => o.type === "gender").map((o) => o.value));
        setMaterials(data.filter((o) => o.type === "material").map((o) => o.value));
      })
      .catch(console.error);
  }, []);

  const [filters, setFilters] = useState({
    category: "", gender: "", color: "",
    size: [], material: [], brand: [],
    minPrice: MIN_BOUND, maxPrice: MAX_BOUND,
  });

  const [priceRange, setPriceRange] = useState([MIN_BOUND, MAX_BOUND]);

  const [expanded, setExpanded] = useState({
    category: true, gender: true, color: true,
    size: true, material: true, price: true,
  });

  const toggle = (k) => setExpanded((p) => ({ ...p, [k]: !p[k] }));

  const colors = ["Red", "Blue", "Black", "Green", "Yellow", "Gray", "White", "Pink", "Beige", "Navy", "Orange", "Purple"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  // Sync URL → state
  useEffect(() => {
    const p = Object.fromEntries([...searchParams]);
    const minP = p.minPrice ? Number(p.minPrice) : MIN_BOUND;
    const maxP = p.maxPrice ? Number(p.maxPrice) : MAX_BOUND;
    setFilters({
      category: p.category || "", gender: p.gender || "", color: p.color || "",
      size: p.size ? p.size.split(",") : [],
      material: p.material ? p.material.split(",") : [],
      brand: p.brand ? p.brand.split(",") : [],
      minPrice: isNaN(minP) ? MIN_BOUND : minP,
      maxPrice: isNaN(maxP) ? MAX_BOUND : maxP,
    });
    setPriceRange([
      isNaN(minP) ? MIN_BOUND : Math.max(MIN_BOUND, Math.min(minP, MAX_BOUND)),
      isNaN(maxP) ? MAX_BOUND : Math.max(MIN_BOUND, Math.min(maxP, MAX_BOUND)),
    ]);
  }, [searchParams]);

  const pushParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0) params.append(k, v.join(","));
      else if (
        v !== "" && v != null &&
        !(k === "maxPrice" && Number(v) === MAX_BOUND) &&
        !(k === "minPrice" && Number(v) === MIN_BOUND)
      ) params.append(k, v);
    });
    // preserve sortBy
    const sort = searchParams.get("sortBy");
    if (sort) params.set("sortBy", sort);
    setSearchParams(params);
  };

  const handleFilter = (name, value, type = "radio") => {
    let nf = { ...filters };
    if (type === "checkbox") {
      nf[name] = nf[name].includes(value)
        ? nf[name].filter((x) => x !== value)
        : [...nf[name], value];
    } else {
      nf[name] = nf[name] === value ? "" : value; // toggle radio
    }
    setFilters(nf);
    pushParams(nf);
  };

  const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));

  const handleMinChange = (e) => {
    const next = [clamp(Number(e.target.value), MIN_BOUND, priceRange[1] - MIN_GAP), priceRange[1]];
    setPriceRange(next);
    const nf = { ...filters, minPrice: next[0], maxPrice: next[1] };
    setFilters(nf); pushParams(nf);
  };
  const handleMaxChange = (e) => {
    const next = [priceRange[0], clamp(Number(e.target.value), priceRange[0] + MIN_GAP, MAX_BOUND)];
    setPriceRange(next);
    const nf = { ...filters, minPrice: next[0], maxPrice: next[1] };
    setFilters(nf); pushParams(nf);
  };

  const hasFilters = [...searchParams.keys()].some((k) => k !== "sortBy");

  const clearAll = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get("sortBy");
    if (sort) params.set("sortBy", sort);
    setSearchParams(params);
    onClose?.();
  };

  // ── Section component ──
  const Section = ({ label, sectionKey, activeCount, children }) => (
    <div className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
      <button
        type="button"
        onClick={() => toggle(sectionKey)}
        className="w-full flex items-center justify-between py-1 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
            {label}
          </span>
          {activeCount > 0 && (
            <span className="text-[10px] font-bold bg-sky-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {expanded[sectionKey]
          ? <FaChevronUp className="text-[10px] text-gray-400 group-hover:text-sky-600 transition" />
          : <FaChevronDown className="text-[10px] text-gray-400 group-hover:text-sky-600 transition" />
        }
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${expanded[sectionKey] ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
    </div>
  );

  // ── Pill button ──
  const Pill = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150
        ${active
          ? "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-200"
          : "bg-white border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-700"
        }`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-linear-to-r from-sky-50 to-blue-50">
        <div>
          <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
            Filters
          </h3>
          {hasFilters && (
            <p className="text-[11px] text-sky-600 font-medium mt-0.5">
              {[...searchParams.keys()].filter((k) => k !== "sortBy").length} active
            </p>
          )}
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-100 transition"
          >
            <FaTimes className="text-[10px]" /> Clear all
          </button>
        )}
      </div>

      {/* Filter sections */}
      <div className="px-5 py-4 space-y-4">

        {/* Category */}
        {categories.length > 0 && (
          <Section label="Category" sectionKey="category" activeCount={filters.category ? 1 : 0}>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <Pill key={c} active={filters.category === c} onClick={() => handleFilter("category", c)}>
                  {c}
                </Pill>
              ))}
            </div>
          </Section>
        )}

        {/* Gender */}
        {genders.length > 0 && (
          <Section label="Gender" sectionKey="gender" activeCount={filters.gender ? 1 : 0}>
            <div className="flex flex-wrap gap-1.5">
              {genders.map((g) => (
                <Pill key={g} active={filters.gender === g} onClick={() => handleFilter("gender", g)}>
                  {g}
                </Pill>
              ))}
            </div>
          </Section>
        )}

        {/* Color */}
        <Section label="Color" sectionKey="color" activeCount={filters.color ? 1 : 0}>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const hex = COLOR_MAP[color] || "#ccc";
              const isActive = filters.color === color;
              return (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onClick={() => handleFilter("color", color)}
                  className={`group relative w-7 h-7 rounded-full border-2 transition-all duration-150
                    ${isActive
                      ? "border-sky-500 scale-110 shadow-md shadow-sky-200/60"
                      : "border-gray-200 hover:border-sky-300 hover:scale-105"
                    }`}
                  style={{ backgroundColor: hex }}
                >
                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke={color === "White" || color === "Yellow" || color === "Beige" ? "#374151" : "#fff"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {filters.color && (
            <p className="text-[11px] text-sky-600 font-medium mt-2">
              Selected: {filters.color}
            </p>
          )}
        </Section>

        {/* Size */}
        <Section label="Size" sectionKey="size" activeCount={filters.size.length}>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((size) => {
              const active = filters.size.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleFilter("size", size, "checkbox")}
                  className={`w-10 h-10 rounded-lg border text-xs font-bold transition-all duration-150
                    ${active
                      ? "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-200"
                      : "bg-white border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-700"
                    }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Fabric / Material */}
        {materials.length > 0 && (
          <Section label="Fabric" sectionKey="material" activeCount={filters.material.length}>
            <div className="space-y-1.5">
              {materials.map((m) => {
                const active = filters.material.includes(m);
                return (
                  <label key={m} className="flex items-center gap-2.5 cursor-pointer group">
                    <span
                      className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-all
                        ${active ? "bg-sky-600 border-sky-600" : "border-gray-300 group-hover:border-sky-400"}`}
                    >
                      {active && (
                        <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={active}
                      onChange={() => handleFilter("material", m, "checkbox")}
                    />
                    <span className={`text-sm transition ${active ? "text-sky-700 font-semibold" : "text-gray-600 group-hover:text-gray-800"}`}>
                      {m}
                    </span>
                  </label>
                );
              })}
            </div>
          </Section>
        )}

        {/* Price Range */}
        <Section label="Price Range" sectionKey="price" activeCount={
          (priceRange[0] > MIN_BOUND || priceRange[1] < MAX_BOUND) ? 1 : 0
        }>
          <div className="space-y-3">
            {/* Price display pills */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 rounded-lg px-2.5 py-1">
                ₹{priceRange[0].toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 mx-1">to</span>
              <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 rounded-lg px-2.5 py-1">
                ₹{priceRange[1].toLocaleString()}
              </span>
            </div>

            {/* Dual range slider */}
            <div className="relative py-2 mx-1">
              <div className="h-1.5 bg-gray-100 rounded-full" />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-linear-to-r from-sky-500 to-blue-600"
                style={{
                  left: `${((priceRange[0] - MIN_BOUND) / (MAX_BOUND - MIN_BOUND)) * 100}%`,
                  right: `${(1 - (priceRange[1] - MIN_BOUND) / (MAX_BOUND - MIN_BOUND)) * 100}%`,
                }}
              />
              <input
                type="range" min={MIN_BOUND} max={MAX_BOUND} step={STEP}
                value={priceRange[0]} onChange={handleMinChange}
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-auto accent-sky-600 cursor-pointer"
              />
              <input
                type="range" min={MIN_BOUND} max={MAX_BOUND} step={STEP}
                value={priceRange[1]} onChange={handleMaxChange}
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-auto accent-sky-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium px-1">
              <span>₹{MIN_BOUND.toLocaleString()}</span>
              <span>₹{MAX_BOUND.toLocaleString()}</span>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default FilterSidebar;
