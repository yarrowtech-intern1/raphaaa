import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { createProduct } from "../../redux/slices/adminProductSlice";
import { toast } from "sonner";
import Select from "react-select";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map((s) => ({
  value: s,
  label: s,
}));

const normalizeSize = (s) => {
  const t = String(s).trim().toUpperCase().replace(/\s+/g, "");
  if (t === "XLL" || t === "2XL") return "XXL";
  if (t === "XXXL") return "3XL";
  if (t === "XXXXL") return "4XL";
  if (t === "XXXXXL") return "5XL";
  return t;
};

const COLOR_NAME_MAP = {
  "#000000": "Black", "#FFFFFF": "White", "#FF0000": "Red",
  "#00FF00": "Lime", "#0000FF": "Blue", "#FFFF00": "Yellow",
  "#00FFFF": "Cyan", "#FF00FF": "Magenta", "#C0C0C0": "Silver",
  "#808080": "Gray", "#800000": "Maroon", "#808000": "Olive",
  "#008000": "Green", "#800080": "Purple", "#008080": "Teal",
  "#000080": "Navy", "#FFA500": "Orange", "#FFC0CB": "Pink",
  "#A52A2A": "Brown", "#F5F5DC": "Beige", "#D2691E": "Chocolate",
  "#DC143C": "Crimson", "#FFD700": "Gold", "#4B0082": "Indigo",
  "#F0E68C": "Khaki", "#E6E6FA": "Lavender", "#90EE90": "LightGreen",
  "#ADD8E6": "LightBlue", "#D3D3D3": "LightGray",
};

const getColorName = (hex) => COLOR_NAME_MAP[hex?.toUpperCase()] || hex?.toUpperCase() || "";

const generateColorOptions = () => {
  const steps = ["00", "33", "66", "99", "CC", "FF"];
  const colors = [];
  for (let r of steps) for (let g of steps) for (let b of steps) colors.push(`#${r}${g}${b}`);
  // Also include common named colors not in web-safe palette
  ["#FFA500", "#FFC0CB", "#A52A2A", "#F5F5DC", "#D2691E", "#DC143C", "#FFD700",
   "#4B0082", "#F0E68C", "#E6E6FA", "#90EE90", "#ADD8E6", "#D3D3D3"].forEach((c) => {
    if (!colors.includes(c)) colors.push(c);
  });
  return colors.map((hex) => ({ value: hex, label: getColorName(hex) }));
};

const COLOR_OPTIONS = generateColorOptions();

const emptySize = () => ({ size: "", sku: "", countInStock: "" });
const emptyColorVariant = (index) => ({
  id: Date.now() + index,
  color: "",
  colorName: "",
  images: [],
  sizes: [emptySize()],
});

const AddProduct = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.adminProducts);

  const [colorVariants, setColorVariants] = useState([emptyColorVariant(0)]);
  const [productData, setProductData] = useState({
    name: "", description: "", price: "", discountPrice: "",
    offerPercentage: "", sku: "", category: "", brand: "",
    collections: "", material: "", gender: "",
    sizeChart: { imageUrl: "", title: "Size Chart" },
    isFeatured: false, isPublished: false, tags: "",
    dimensions: { length: "", width: "", height: "" },
    weight: "",
  });

  const [metaOptions, setMetaOptions] = useState({ category: [], collection: [], gender: [], material: [] });
  const [uploadingColor, setUploadingColor] = useState(null);
  const [uploadingSizeChart, setUploadingSizeChart] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/api/meta-options`).then(({ data }) => {
      const buckets = data.reduce(
        (acc, { type, value }) => {
          if (["category", "collection", "gender", "material"].includes(type)) {
            if (!acc[type].includes(value)) acc[type].push(value);
          }
          return acc;
        },
        { category: [], collection: [], gender: [], material: [] }
      );
      setMetaOptions(buckets);
    }).catch(console.error);
  }, []);

  // ─── Product field handlers ───────────────────────────────────────────────
  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setProductData((p) => ({ ...p, [name]: checked }));
    } else if (name.startsWith("dimensions.")) {
      const key = name.split(".")[1];
      setProductData((p) => ({ ...p, dimensions: { ...p.dimensions, [key]: value } }));
    } else {
      setProductData((p) => {
        const updated = { ...p, [name]: value };
        if (name === "offerPercentage") {
          const price = parseFloat(updated.price);
          const offer = parseFloat(value);
          if (!isNaN(price) && !isNaN(offer))
            updated.discountPrice = Math.round(price - (price * offer) / 100);
        }
        return updated;
      });
    }
  };

  // ─── Size chart upload ────────────────────────────────────────────────────
  const handleSizeChartUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      setUploadingSizeChart(true);
      const { data } = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      });
      setProductData((p) => ({ ...p, sizeChart: { ...p.sizeChart, imageUrl: data.imageUrl } }));
      toast.success("Size chart uploaded");
    } catch {
      toast.error("Failed to upload size chart");
    } finally {
      setUploadingSizeChart(false);
    }
  };

  // ─── Color variant handlers ───────────────────────────────────────────────
  const addColorVariant = () =>
    setColorVariants((prev) => [...prev, emptyColorVariant(prev.length)]);

  const removeColorVariant = (id) =>
    setColorVariants((prev) => prev.filter((cv) => cv.id !== id));

  const updateColorVariant = (id, field, value) =>
    setColorVariants((prev) =>
      prev.map((cv) => (cv.id === id ? { ...cv, [field]: value } : cv))
    );

  // Images for a color
  const handleColorImageUpload = async (id, files) => {
    setUploadingColor(id);
    const uploaded = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const { data } = await axios.post(`${API_BASE}/api/upload`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
        });
        uploaded.push({ url: data.imageUrl, altText: file.name });
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setColorVariants((prev) =>
      prev.map((cv) =>
        cv.id === id ? { ...cv, images: [...cv.images, ...uploaded] } : cv
      )
    );
    setUploadingColor(null);
  };

  const removeColorImage = (colorId, imgIndex) =>
    setColorVariants((prev) =>
      prev.map((cv) =>
        cv.id === colorId
          ? { ...cv, images: cv.images.filter((_, i) => i !== imgIndex) }
          : cv
      )
    );

  // Sizes inside a color variant
  const addSize = (colorId) =>
    setColorVariants((prev) =>
      prev.map((cv) =>
        cv.id === colorId ? { ...cv, sizes: [...cv.sizes, emptySize()] } : cv
      )
    );

  const removeSize = (colorId, sizeIndex) =>
    setColorVariants((prev) =>
      prev.map((cv) =>
        cv.id === colorId
          ? { ...cv, sizes: cv.sizes.filter((_, i) => i !== sizeIndex) }
          : cv
      )
    );

  const updateSize = (colorId, sizeIndex, field, value) =>
    setColorVariants((prev) =>
      prev.map((cv) =>
        cv.id === colorId
          ? {
              ...cv,
              sizes: cv.sizes.map((s, i) =>
                i === sizeIndex ? { ...s, [field]: value } : s
              ),
            }
          : cv
      )
    );

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedColorVariants = colorVariants
      .map((cv) => ({
        color: cv.color.trim(),
        colorName: cv.colorName.trim() || getColorName(cv.color),
        images: cv.images,
        sizes: cv.sizes
          .map((s) => ({
            size: normalizeSize(s.size),
            sku: s.sku.trim(),
            countInStock: Number(s.countInStock || 0),
          }))
          .filter((s) => s.size && s.sku),
      }))
      .filter((cv) => cv.color && cv.sizes.length > 0);

    if (!normalizedColorVariants.length) {
      toast.error("Add at least one color with a valid size, SKU and stock.");
      return;
    }

    const allSizes   = [...new Set(normalizedColorVariants.flatMap((cv) => cv.sizes.map((s) => s.size)))];
    const allColors  = [...new Set(normalizedColorVariants.map((cv) => cv.color))];
    const totalStock = normalizedColorVariants.reduce(
      (sum, cv) => sum + cv.sizes.reduce((s2, sz) => s2 + Math.max(0, Number(sz.countInStock || 0)), 0),
      0
    );
    const firstSku = productData.sku?.trim() || normalizedColorVariants[0]?.sizes[0]?.sku;

    const payload = {
      ...productData,
      price: Number(productData.price),
      offerPercentage: productData.offerPercentage ? Number(productData.offerPercentage) : 0,
      discountPrice: productData.offerPercentage
        ? Math.round(Number(productData.price) - (Number(productData.price) * Number(productData.offerPercentage)) / 100)
        : productData.discountPrice ? Math.round(Number(productData.discountPrice)) : undefined,
      countInStock: totalStock,
      sku: firstSku,
      sizes: allSizes,
      colors: allColors,
      colorVariants: normalizedColorVariants,
      variants: [],
      images: normalizedColorVariants[0]?.images || [],
      weight: productData.weight ? Number(productData.weight) : undefined,
      tags: productData.tags
        ? productData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      dimensions: {
        length: productData.dimensions.length ? Number(productData.dimensions.length) : undefined,
        width:  productData.dimensions.width  ? Number(productData.dimensions.width)  : undefined,
        height: productData.dimensions.height ? Number(productData.dimensions.height) : undefined,
      },
      sizeChart: {
        imageUrl: productData.sizeChart?.imageUrl || "",
        title:    productData.sizeChart?.title    || "Size Chart",
      },
    };

    if (!payload.dimensions.length && !payload.dimensions.width && !payload.dimensions.height)
      delete payload.dimensions;

    dispatch(createProduct(payload));
    toast.success("Product added successfully!");

    setProductData({
      name: "", description: "", price: "", discountPrice: "",
      offerPercentage: "", sku: "", category: "", brand: "",
      collections: "", material: "", gender: "",
      sizeChart: { imageUrl: "", title: "Size Chart" },
      isFeatured: false, isPublished: false, tags: "",
      dimensions: { length: "", width: "", height: "" },
      weight: "",
    });
    setColorVariants([emptyColorVariant(0)]);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-white shadow-md rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-6">Add New Product</h3>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic Info ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Product Name *">
            <input
              type="text" name="name" value={productData.name}
              onChange={handleProductChange} required
              placeholder="e.g. Classic Crew-Neck T-Shirt"
              className={inputCls}
            />
          </Field>
          <Field label="SKU (optional — auto from first variant)">
            <input
              type="text" name="sku" value={productData.sku}
              onChange={handleProductChange}
              placeholder="e.g. TSHIRT-001"
              className={inputCls}
            />
          </Field>
          <Field label="Price *">
            <input
              type="number" name="price" value={productData.price}
              onChange={handleProductChange} required min="0" step="0.01"
              placeholder="₹ MRP price"
              className={inputCls}
            />
          </Field>
          <Field label="Offer %">
            <input
              type="number" name="offerPercentage" value={productData.offerPercentage}
              onChange={handleProductChange} min="0" step="0.1"
              placeholder="Discount percentage"
              className={inputCls}
            />
          </Field>
          <Field label="Discount Price (auto)">
            <input
              type="number" name="discountPrice" value={productData.discountPrice}
              readOnly placeholder="Auto calculated"
              className={`${inputCls} bg-gray-100`}
            />
          </Field>
          <Field label="Category *">
            <select name="category" value={productData.category}
              onChange={handleProductChange} required className={inputCls}>
              <option value="">Select Category</option>
              {metaOptions.category.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Collection *">
            <select name="collections" value={productData.collections}
              onChange={handleProductChange} required className={inputCls}>
              <option value="">Select Collection</option>
              {metaOptions.collection.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Gender">
            <select name="gender" value={productData.gender}
              onChange={handleProductChange} className={inputCls}>
              <option value="">Select Gender</option>
              {metaOptions.gender.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Material">
            <select name="material" value={productData.material}
              onChange={handleProductChange} className={inputCls}>
              <option value="">Select Material</option>
              {metaOptions.material.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Brand">
            <input type="text" name="brand" value={productData.brand}
              onChange={handleProductChange} placeholder="Brand name" className={inputCls} />
          </Field>
          <Field label="Weight (kg)">
            <input type="number" name="weight" value={productData.weight}
              onChange={handleProductChange} min="0" step="0.01" className={inputCls} />
          </Field>
          <Field label="Tags (comma-separated)">
            <input type="text" name="tags" value={productData.tags}
              onChange={handleProductChange} placeholder="casual, trendy, cotton" className={inputCls} />
          </Field>
        </div>

        {/* ── Description ── */}
        <Field label="Description *">
          <textarea name="description" value={productData.description}
            onChange={handleProductChange} rows={4} required
            placeholder="Product description"
            className={inputCls} />
        </Field>

        {/* ── Dimensions ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (cm)</label>
          <div className="grid grid-cols-3 gap-2">
            {["length", "width", "height"].map((d) => (
              <input key={d} type="number" name={`dimensions.${d}`}
                value={productData.dimensions[d]} onChange={handleProductChange}
                min="0" step="0.1" placeholder={d.charAt(0).toUpperCase() + d.slice(1)}
                className={inputCls} />
            ))}
          </div>
        </div>

        {/* ── Size Chart ── */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Size Chart Image</label>
          <input type="file" accept="image/*" onChange={handleSizeChartUpload}
            className="text-sm" />
          {uploadingSizeChart && <p className="text-xs text-blue-500 mt-1 animate-pulse">Uploading…</p>}
          {productData.sizeChart?.imageUrl && (
            <img src={productData.sizeChart.imageUrl} alt="Size chart"
              className="mt-2 w-48 rounded border border-gray-200" />
          )}
        </div>

        {/* ── Color Variants (the core section) ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-gray-800">
              Color Variants <span className="text-red-500">*</span>
            </h4>
            <button type="button" onClick={addColorVariant}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
              + Add Color
            </button>
          </div>

          <div className="space-y-6">
            {colorVariants.map((cv, cvIdx) => (
              <ColorVariantCard
                key={cv.id}
                cv={cv}
                cvIdx={cvIdx}
                totalColors={colorVariants.length}
                uploadingColor={uploadingColor}
                onColorChange={(color) => {
                  updateColorVariant(cv.id, "color", color);
                  updateColorVariant(cv.id, "colorName", getColorName(color));
                }}
                onColorNameChange={(name) => updateColorVariant(cv.id, "colorName", name)}
                onImageUpload={(files) => handleColorImageUpload(cv.id, files)}
                onImageRemove={(idx) => removeColorImage(cv.id, idx)}
                onAddSize={() => addSize(cv.id)}
                onRemoveSize={(idx) => removeSize(cv.id, idx)}
                onSizeChange={(idx, field, val) => updateSize(cv.id, idx, field, val)}
                onRemoveColor={() => removeColorVariant(cv.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit" disabled={loading}
          className="bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 hover:brightness-110 text-white font-semibold py-2.5 px-8 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50">
          {loading ? "Adding…" : "Add Product"}
        </button>
      </form>
    </div>
  );
};

// ─── Sub-component: one color variant card ────────────────────────────────────
const ColorVariantCard = ({
  cv, cvIdx, totalColors, uploadingColor,
  onColorChange, onColorNameChange,
  onImageUpload, onImageRemove,
  onAddSize, onRemoveSize, onSizeChange,
  onRemoveColor,
}) => (
  <div className="border-2 border-indigo-100 rounded-xl p-4 bg-gradient-to-br from-white to-indigo-50">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {cv.color && (
          <span className="w-8 h-8 rounded-full border-2 border-white shadow-md inline-block"
            style={{ backgroundColor: cv.color }} />
        )}
        <h5 className="font-semibold text-gray-800">
          Color {cvIdx + 1}{cv.colorName ? `: ${cv.colorName}` : ""}
        </h5>
      </div>
      {totalColors > 1 && (
        <button type="button" onClick={onRemoveColor}
          className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded">
          Remove Color
        </button>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {/* Color picker */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Color (hex) *</label>
        <Select
          options={COLOR_OPTIONS}
          value={cv.color ? { value: cv.color, label: getColorName(cv.color) } : null}
          onChange={(sel) => onColorChange(sel?.value || "")}
          placeholder="Select color"
          formatOptionLabel={(opt) => (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border border-gray-300 inline-block flex-shrink-0"
                style={{ backgroundColor: opt.value }} />
              <span>{opt.label}</span>
            </div>
          )}
        />
      </div>
      {/* Color display name */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Color Display Name</label>
        <input type="text" value={cv.colorName} onChange={(e) => onColorNameChange(e.target.value)}
          placeholder="e.g. Midnight Black (auto-filled)"
          className={inputCls} />
      </div>
    </div>

    {/* Images for this color */}
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-600 mb-2">
        Photos for this color
      </label>
      <label className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded-lg cursor-pointer hover:bg-blue-100 transition">
        📷 Upload Photos
        <input type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => onImageUpload(e.target.files)} />
      </label>
      {uploadingColor === cv.id && (
        <span className="ml-2 text-xs text-blue-500 animate-pulse">Uploading…</span>
      )}
      {cv.images.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {cv.images.map((img, idx) => (
            <div key={idx} className="relative">
              <img src={img.url} alt={img.altText} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => onImageRemove(idx)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center leading-none">
                ×
              </button>
              {idx === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center rounded-b-lg py-0.5">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Sizes for this color */}
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-600">Sizes, SKU & Stock *</label>
        <button type="button" onClick={onAddSize}
          className="text-xs text-indigo-600 border border-indigo-300 px-2 py-1 rounded hover:bg-indigo-50">
          + Add Size
        </button>
      </div>

      <div className="space-y-2">
        {cv.sizes.map((sz, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-2 items-center">
            <Select
              options={SIZE_OPTIONS}
              value={sz.size ? { value: normalizeSize(sz.size), label: normalizeSize(sz.size) } : null}
              onChange={(sel) => onSizeChange(idx, "size", sel?.value || "")}
              placeholder="Size"
              classNamePrefix="sz-select"
            />
            <input type="text" value={sz.sku}
              onChange={(e) => onSizeChange(idx, "sku", e.target.value)}
              placeholder="SKU (e.g. BLK-S)"
              className={inputCls} />
            <div className="flex gap-1 items-center">
              <input type="number" min="0" value={sz.countInStock}
                onChange={(e) => onSizeChange(idx, "countInStock", e.target.value)}
                placeholder="Stock"
                className={inputCls} />
              {cv.sizes.length > 1 && (
                <button type="button" onClick={() => onRemoveSize(idx)}
                  className="text-red-500 hover:text-red-700 px-1">✕</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Shared helpers ───────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition";

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

export default AddProduct;
