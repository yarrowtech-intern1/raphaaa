import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const MIN_BOUND = 500;
const MAX_BOUND = 10000;
const STEP = 50; // adjust if you want finer steps
const MIN_GAP = 0; // set to e.g. 100 if you want min & max to never overlap

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Fetch the genders
  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const res= await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options`);
        const data = await res.json();
        const genderOptions = data.filter(opt => opt.type === "gender").map(opt => opt.value);
        setGenders(genderOptions);
      } catch (error) {
        console.error("Error fetching gender options:", error);
      }
    };
    fetchGenders();
  }, []);

  // Fetch the categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options`);
        const data = await res.json();
        const categoryOptions = data.filter(opt => opt.type === "category").map(opt => opt.value);
        setCategories(categoryOptions);
      } catch (error) {
        console.error("Error fetching category options:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch the materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options`);
        const data = await res.json();
        const materialOptions = data.filter(opt => opt.type === "material").map(opt => opt.value);
        setMaterials(materialOptions);
      } catch (error) {
        console.error("Error fetching material options:", error);
      }
    };
    fetchMaterials();
  }, []);

  const [filters, setFilters] = useState({
    category: "",
    gender: "",
    color: "",
    size: [],
    material: [],
    brand: [],
    minPrice: MIN_BOUND,
    maxPrice: MAX_BOUND,
  });

  // local controlled range (two pointers)
  const [priceRange, setPriceRange] = useState([MIN_BOUND, MAX_BOUND]);

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    gender: true,
    color: true,
    size: true,
    material: true,
    brand: true,
    price: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // const categories = ["Top Wear", "Bottom Wear"];
  const colors = ["Red", "Blue", "Black", "Green", "Yellow", "Gray", "White", "Pink", "Beige", "Navy"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  // const materials = ["Cotton", "Wool", "Denim", "Polyester", "Silk", "Linen", "Viscose", "Fleece"];
  const brands = ["Urban Threads", "Modern Fit", "Street Style", "Beach Breeze", "fashionista", "ChicStyle"];
  // const genders = ["Men", "Women", "Kids"];

  // Sync from URL -> state on mount & whenever URL changes
  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);

    const minP = params.minPrice ? Number(params.minPrice) : MIN_BOUND;
    const maxP = params.maxPrice ? Number(params.maxPrice) : MAX_BOUND;

    setFilters({
      category: params.category || "",
      gender: params.gender || "",
      color: params.color || "",
      size: params.size ? params.size.split(",") : [],
      material: params.material ? params.material.split(",") : [],
      brand: params.brand ? params.brand.split(",") : [],
      minPrice: isNaN(minP) ? MIN_BOUND : minP,
      maxPrice: isNaN(maxP) ? MAX_BOUND : maxP,
    });

    setPriceRange([
      isNaN(minP) ? MIN_BOUND : Math.max(MIN_BOUND, Math.min(minP, MAX_BOUND)),
      isNaN(maxP) ? MAX_BOUND : Math.max(MIN_BOUND, Math.min(maxP, MAX_BOUND)),
    ]);
  }, [searchParams]);

  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      const value = newFilters[key];
      if (Array.isArray(value) && value.length > 0) {
        params.append(key, value.join(","));
      } else if (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !(key === "maxPrice" && Number(value) === MAX_BOUND) &&
        !(key === "minPrice" && Number(value) === MIN_BOUND)
      ) {
        params.append(key, value);
      }
    });
    setSearchParams(params);
    navigate(`?${params.toString()}`);
  };

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    let newFilters = { ...filters };

    if (type === "checkbox") {
      if (checked) {
        newFilters[name] = [...(newFilters[name] || []), value];
      } else {
        newFilters[name] = newFilters[name].filter((item) => item !== value);
      }
    } else {
      newFilters[name] = value;
    }

    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  // --- Two-pointer range handlers (continuous updates) ---
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const handleMinChange = (e) => {
    const nextMin = clamp(Number(e.target.value), MIN_BOUND, priceRange[1] - MIN_GAP);
    const next = [nextMin, priceRange[1]];
    setPriceRange(next);

    const newFilters = { ...filters, minPrice: next[0], maxPrice: next[1] };
    setFilters(newFilters); // ✅ use the updated object, not the old state
    updateURLParams(newFilters); // continuous apply
  };

  const handleMaxChange = (e) => {
    const nextMax = clamp(Number(e.target.value), priceRange[0] + MIN_GAP, MAX_BOUND);
    const next = [priceRange[0], nextMax];
    setPriceRange(next);

    const newFilters = { ...filters, minPrice: next[0], maxPrice: next[1] };
    setFilters(newFilters); // ✅ fix prior bug
    updateURLParams(newFilters); // continuous apply
  };

  // Also allow precise numeric input (optional, kept minimal)
  const onMinInput = (e) => {
    const v = clamp(Number(e.target.value || MIN_BOUND), MIN_BOUND, priceRange[1] - MIN_GAP);
    const next = [v, priceRange[1]];
    setPriceRange(next);
    const nf = { ...filters, minPrice: next[0], maxPrice: next[1] };
    setFilters(nf);
    updateURLParams(nf);
  };

  const onMaxInput = (e) => {
    const v = clamp(Number(e.target.value || MAX_BOUND), priceRange[0] + MIN_GAP, MAX_BOUND);
    const next = [priceRange[0], v];
    setPriceRange(next);
    const nf = { ...filters, minPrice: next[0], maxPrice: next[1] };
    setFilters(nf);
    updateURLParams(nf);
  };

  const pillClass = (isActive) =>
    `px-3 py-1.5 rounded-full border text-sm transition-all duration-200
     ${isActive
      ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white border-transparent shadow-md shadow-sky-200"
      : "bg-white/80 backdrop-blur border-gray-200 text-gray-700 hover:bg-gray-50"
    }`;

  const Section = ({ label, sectionKey, children }) => (
    <div className="border-b border-gray-100/60 pb-4">
      <div
        onClick={() => toggleSection(sectionKey)}
        className="flex justify-between items-center cursor-pointer mb-3 group"
      >
        <p className="text-sm font-semibold tracking-wide text-gray-800 uppercase">
          {label}
        </p>
        {expandedSections[sectionKey] ? (
          <FaChevronUp className="text-gray-400 text-xs transition-transform duration-200 group-hover:text-gray-600" />
        ) : (
          <FaChevronDown className="text-gray-400 text-xs transition-transform duration-200 group-hover:text-gray-600" />
        )}
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out
          ${expandedSections[sectionKey] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div
      className="sticky top-2
                 p-5 md:p-6 bg-white/90 backdrop-blur
                 rounded-2xl shadow-[8px_8px_20px_rgba(9,132,227,0.08),_-6px_-6px_16px_rgba(255,255,255,0.6)]
                 border border-white/60 space-y-6"
    >
      <div className="pb-4 border-b border-gray-100/60">
        <h3 className="text-xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-sky-700 to-blue-700">
          Filters
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">Find products that suit you</p>
      </div>

      <Section label="Category" sectionKey="category">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleFilterChange({ target: { name: "category", value: category, type: "radio" } })}
              className={pillClass(filters.category === category)}
            >
              {category}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Gender" sectionKey="gender">
        <div className="flex flex-wrap gap-2">
          {genders.map((gender) => (
            <button
              key={gender}
              type="button"
              onClick={() => handleFilterChange({ target: { name: "gender", value: gender, type: "radio" } })}
              className={pillClass(filters.gender === gender)}
            >
              {gender}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Color" sectionKey="color">
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleFilterChange({ target: { name: "color", value: color, type: "radio" } })}
              className={pillClass(filters.color === color)}
            >
              {color}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Size" sectionKey="size">
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <label key={size} className="flex items-center">
              <input
                type="checkbox"
                name="size"
                checked={filters.size.includes(size)}
                value={size}
                onChange={handleFilterChange}
                className="hidden"
              />
              <span className={pillClass(filters.size.includes(size))}>{size}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section label="Fabric" sectionKey="material">
        <div className="grid grid-cols-2 gap-2">
          {materials.map((material) => (
            <label key={material} className="flex items-center gap-2 text-sm text-gray-700 hover:text-sky-600">
              <input
                type="checkbox"
                name="material"
                checked={filters.material.includes(material)}
                value={material}
                onChange={handleFilterChange}
                className="accent-sky-500 w-4 h-4"
              />
              {material}
            </label>
          ))}
        </div>
      </Section>

      {/* <Section label="Brand" sectionKey="brand">
        <div className="grid grid-cols-1 gap-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 text-sm text-gray-700 hover:text-sky-600">
              <input
                type="checkbox"
                name="brand"
                checked={filters.brand.includes(brand)}
                value={brand}
                onChange={handleFilterChange}
                className="accent-sky-500 w-4 h-4"
              />
              {brand}
            </label>
          ))}
        </div>
      </Section> */}

      {/* --- NEW: Two-pointer Price Range (continuous) --- */}
      <Section label="Price Range" sectionKey="price">
        <div className="rounded-xl p-3 bg-gradient-to-b from-white to-sky-50 border border-sky-100">
          <div className="relative py-3">
            {/* track */}
            <div className="h-1.5 bg-sky-100 rounded-full" />
            {/* range highlight */}
            <div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-sky-300"
              style={{
                left: `${((priceRange[0] - MIN_BOUND) / (MAX_BOUND - MIN_BOUND)) * 100}%`,
                right: `${(1 - (priceRange[1] - MIN_BOUND) / (MAX_BOUND - MIN_BOUND)) * 100}%`,
              }}
            />
            {/* min slider */}
            <input
              type="range"
              min={MIN_BOUND}
              max={MAX_BOUND}
              step={STEP}
              value={priceRange[0]}
              onChange={handleMinChange}
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-auto accent-sky-600 cursor-pointer"
            />
            {/* max slider */}
            <input
              type="range"
              min={MIN_BOUND}
              max={MAX_BOUND}
              step={STEP}
              value={priceRange[1]}
              onChange={handleMaxChange}
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-auto accent-sky-600 cursor-pointer"
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span className="text-gray-500">Min</span>
              <input
                type="number"
                min={MIN_BOUND}
                max={priceRange[1] - MIN_GAP}
                step={STEP}
                value={priceRange[0]}
                onChange={onMinInput}
                className="w-28 px-2 py-1 rounded-md border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-right"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span className="text-gray-500">Max</span>
              <input
                type="number"
                min={priceRange[0] + MIN_GAP}
                max={MAX_BOUND}
                step={STEP}
                value={priceRange[1]}
                onChange={onMaxInput}
                className="w-28 px-2 py-1 rounded-md border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-right"
              />
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>₹{MIN_BOUND}</span>
            <span className="font-semibold text-sky-700">₹{priceRange[0]} — ₹{priceRange[1]}</span>
            <span>₹{MAX_BOUND}</span>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default FilterSidebar;
