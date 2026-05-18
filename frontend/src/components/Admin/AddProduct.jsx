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
const selectPortalTarget = typeof document !== "undefined" ? document.body : null;
const selectMenuStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
};

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
  const [sizeCharts, setSizeCharts] = useState([]);
  const [selectedSizeChartId, setSelectedSizeChartId] = useState("");
  const [creatingSizeChart, setCreatingSizeChart] = useState(false);
  const [newSizeChart, setNewSizeChart] = useState({
    name: "",
    audience: "Unisex",
    chartImageUrl: "",
    measureImageUrl: "",
    unit: "in",
  });

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

  useEffect(() => {
    const fetchSizeCharts = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/size-charts`);
        setSizeCharts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch size charts:", err);
      }
    };
    fetchSizeCharts();
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

  const handleNewSizeChartImage = async (field, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      setUploadingSizeChart(true);
      const { data } = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      });
      setNewSizeChart((p) => ({ ...p, [field]: data.imageUrl }));
      toast.success("Size chart image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingSizeChart(false);
    }
  };

  const handleCreateSizeChart = async () => {
    if (!newSizeChart.name.trim() || !newSizeChart.chartImageUrl) {
      toast.error("Size chart name and chart image are required");
      return;
    }
    try {
      setCreatingSizeChart(true);
      const { data } = await axios.post(
        `${API_BASE}/api/size-charts`,
        newSizeChart,
        { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
      );
      setSizeCharts((prev) => [data, ...prev]);
      setSelectedSizeChartId(data._id);
      setProductData((p) => ({
        ...p,
        sizeChart: {
          templateId: data._id,
          imageUrl: data.chartImageUrl,
          measureImageUrl: data.measureImageUrl || "",
          title: data.name || "Size Chart",
          audience: data.audience || "Unisex",
        },
      }));
      setNewSizeChart({ name: "", audience: "Unisex", chartImageUrl: "", measureImageUrl: "", unit: "in" });
      toast.success("Size chart saved to library");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create size chart");
    } finally {
      setCreatingSizeChart(false);
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

    try {
      await dispatch(createProduct(payload)).unwrap();
      toast.success("Product added successfully!");
    } catch (err) {
      const details = err?.details;
      const message =
        err?.message ||
        (Array.isArray(details) && details.length ? details[0] : "Failed to add product");
      toast.error(message);
      return;
    }

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
    <div className="min-h-screen p-4 md:p-6 space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Add New Product</h1>
          <p className="text-xs text-gray-400 mt-0.5">Fill all required fields to publish a new product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Section card wrapper ── */}
        {/* Basic Info */}
        <SectionCard title="Basic Information" subtitle="Product name, SKU and description">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name *">
              <input type="text" name="name" value={productData.name}
                onChange={handleProductChange} required
                placeholder="e.g. Classic Crew-Neck T-Shirt" className={inputCls} />
            </Field>
            <Field label="SKU (optional)">
              <input type="text" name="sku" value={productData.sku}
                onChange={handleProductChange}
                placeholder="Auto-filled from first variant" className={inputCls} />
            </Field>
            <Field label="Brand">
              <input type="text" name="brand" value={productData.brand}
                onChange={handleProductChange} placeholder="Brand name" className={inputCls} />
            </Field>
            <Field label="Tags (comma-separated)">
              <input type="text" name="tags" value={productData.tags}
                onChange={handleProductChange} placeholder="casual, trendy, cotton" className={inputCls} />
            </Field>
          </div>
          <Field label="Description *">
            <textarea name="description" value={productData.description}
              onChange={handleProductChange} rows={4} required
              placeholder="Write a compelling product description…" className={inputCls} />
          </Field>
        </SectionCard>

        {/* Pricing */}
        <SectionCard title="Pricing" subtitle="Set MRP, offer discount and final selling price">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="MRP Price (₹) *">
              <input type="number" name="price" value={productData.price}
                onChange={handleProductChange} required min="0" step="0.01"
                placeholder="e.g. 999" className={inputCls} />
            </Field>
            <Field label="Offer % (optional)">
              <input type="number" name="offerPercentage" value={productData.offerPercentage}
                onChange={handleProductChange} min="0" step="0.1"
                placeholder="e.g. 20" className={inputCls} />
            </Field>
            <Field label="Selling Price (auto)">
              <input type="number" name="discountPrice" value={productData.discountPrice}
                readOnly placeholder="Auto calculated"
                className={`${inputCls} bg-gray-100 cursor-not-allowed text-gray-500`} />
            </Field>
          </div>
        </SectionCard>

        {/* Classification */}
        <SectionCard title="Classification" subtitle="Category, collection, gender and material">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Category *">
              <select name="category" value={productData.category}
                onChange={handleProductChange} required className={inputCls}>
                <option value="">Select…</option>
                {metaOptions.category.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Collection *">
              <select name="collections" value={productData.collections}
                onChange={handleProductChange} required className={inputCls}>
                <option value="">Select…</option>
                {metaOptions.collection.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Gender">
              <select name="gender" value={productData.gender}
                onChange={handleProductChange} className={inputCls}>
                <option value="">Select…</option>
                {metaOptions.gender.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Material / Fabric">
              <select name="material" value={productData.material}
                onChange={handleProductChange} className={inputCls}>
                <option value="">Select…</option>
                {metaOptions.material.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          </div>
        </SectionCard>

        {/* Shipping */}
        <SectionCard title="Shipping & Dimensions" subtitle="Weight and package dimensions (optional)">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Weight (kg)">
              <input type="number" name="weight" value={productData.weight}
                onChange={handleProductChange} min="0" step="0.01"
                placeholder="0.5" className={inputCls} />
            </Field>
            {["length", "width", "height"].map((d) => (
              <Field key={d} label={`${d.charAt(0).toUpperCase() + d.slice(1)} (cm)`}>
                <input type="number" name={`dimensions.${d}`}
                  value={productData.dimensions[d]} onChange={handleProductChange}
                  min="0" step="0.1" placeholder="0" className={inputCls} />
              </Field>
            ))}
          </div>
        </SectionCard>

        {/* Size Chart */}
        <SectionCard title="Size Chart" subtitle="Upload a size guide image for customers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Use Saved Size Chart">
              <select
                value={selectedSizeChartId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedSizeChartId(id);
                  const selected = sizeCharts.find((s) => s._id === id);
                  if (selected) {
                    setProductData((p) => ({
                      ...p,
                      sizeChart: {
                        templateId: selected._id,
                        imageUrl: selected.chartImageUrl,
                        measureImageUrl: selected.measureImageUrl || "",
                        title: selected.name || "Size Chart",
                        audience: selected.audience || "Unisex",
                      },
                    }));
                  }
                }}
                className={inputCls}
              >
                <option value="">Select from library…</option>
                {sizeCharts.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.audience})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="New Size Chart Name">
              <input
                type="text"
                value={newSizeChart.name}
                onChange={(e) => setNewSizeChart((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Men Regular Fit Shirt"
                className={inputCls}
              />
            </Field>
            <Field label="Audience">
              <select
                value={newSizeChart.audience}
                onChange={(e) => setNewSizeChart((p) => ({ ...p, audience: e.target.value }))}
                className={inputCls}
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Unisex">Unisex</option>
              </select>
            </Field>
            <Field label="Unit">
              <select
                value={newSizeChart.unit}
                onChange={(e) => setNewSizeChart((p) => ({ ...p, unit: e.target.value }))}
                className={inputCls}
              >
                <option value="in">in</option>
                <option value="cm">cm</option>
              </select>
            </Field>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <label className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 border border-violet-200 text-violet-700 text-sm font-semibold rounded-xl cursor-pointer hover:bg-violet-100 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {uploadingSizeChart ? "Uploading…" : "Upload Size Chart"}
              <input type="file" accept="image/*" onChange={handleSizeChartUpload} className="hidden" />
            </label>
            {productData.sizeChart?.imageUrl && (
              <img src={productData.sizeChart.imageUrl} alt="Size chart"
                className="w-32 rounded-xl border border-gray-200 shadow-sm" />
            )}
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <label className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-xl cursor-pointer hover:bg-blue-100 transition">
              Upload Chart Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleNewSizeChartImage("chartImageUrl", e.target.files?.[0])}
              />
            </label>
            <label className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-xl cursor-pointer hover:bg-blue-100 transition">
              Upload How-To-Measure Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleNewSizeChartImage("measureImageUrl", e.target.files?.[0])}
              />
            </label>
            <button
              type="button"
              disabled={creatingSizeChart}
              onClick={handleCreateSizeChart}
              className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl disabled:opacity-60"
            >
              {creatingSizeChart ? "Saving..." : "Save in Size Chart Library"}
            </button>
          </div>
        </SectionCard>

        {/* Visibility toggles */}
        <SectionCard title="Visibility" subtitle="Control whether this product appears on the store">
          <div className="flex flex-wrap gap-4">
            {[
              { name: "isFeatured", label: "Featured Product", desc: "Show on homepage featured section" },
              { name: "isPublished", label: "Published",        desc: "Visible to customers in the store" },
            ].map(({ name, label, desc }) => (
              <label key={name} className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input type="checkbox" name={name}
                    checked={productData[name]} onChange={handleProductChange}
                    className="sr-only peer" />
                  <div className="w-10 h-5 rounded-full bg-gray-200 peer-checked:bg-violet-600 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </SectionCard>

        {/* Color Variants */}
        <SectionCard
          title={<>Color Variants <span className="text-red-500">*</span></>}
          subtitle="Add at least one color with size, SKU and stock"
          action={
            <button type="button" onClick={addColorVariant}
              className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition shadow-sm">
              + Add Color
            </button>
          }
        >
          <div className="space-y-4">
            {colorVariants.map((cv, cvIdx) => (
              <ColorVariantCard
                key={cv.id} cv={cv} cvIdx={cvIdx}
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
        </SectionCard>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit" disabled={loading}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-sm
              ${loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700 text-white hover:shadow-md"
              }`}
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
              : "Publish Product"
            }
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Section card wrapper ─────────────────────────────────────────────────────
const SectionCard = ({ title, subtitle, children, action }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-100">
      <div>
        <h4 className="text-sm font-bold text-gray-800">{title}</h4>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

// ─── Sub-component: one color variant card ────────────────────────────────────
const ColorVariantCard = ({
  cv, cvIdx, totalColors, uploadingColor,
  onColorChange, onColorNameChange,
  onImageUpload, onImageRemove,
  onAddSize, onRemoveSize, onSizeChange,
  onRemoveColor,
}) => (
  <div className="border border-gray-200 rounded-xl overflow-visible">
    {/* Card header */}
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
      <div className="flex items-center gap-3">
        {cv.color ? (
          <span className="w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0"
            style={{ backgroundColor: cv.color }} />
        ) : (
          <span className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 shrink-0" />
        )}
        <h5 className="text-sm font-bold text-gray-700">
          Color {cvIdx + 1}{cv.colorName ? ` — ${cv.colorName}` : ""}
        </h5>
      </div>
      {totalColors > 1 && (
        <button type="button" onClick={onRemoveColor}
          className="text-[11px] font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded-lg transition">
          Remove
        </button>
      )}
    </div>

    <div className="p-4 space-y-4">
      {/* Color picker + name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Color *</label>
          <Select
            options={COLOR_OPTIONS}
            value={cv.color ? { value: cv.color, label: getColorName(cv.color) } : null}
            onChange={(sel) => onColorChange(sel?.value || "")}
            placeholder="Pick a colour…"
            menuPortalTarget={selectPortalTarget}
            menuPosition="fixed"
            styles={selectMenuStyles}
            formatOptionLabel={(opt) => (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-gray-200 shrink-0"
                  style={{ backgroundColor: opt.value }} />
                <span>{opt.label}</span>
              </div>
            )}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Display Name</label>
          <input type="text" value={cv.colorName} onChange={(e) => onColorNameChange(e.target.value)}
            placeholder="e.g. Midnight Black (auto-filled)"
            className={inputCls} />
        </div>
      </div>

      {/* Photo upload */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Photos for this colour</label>
        <label className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-xl cursor-pointer hover:bg-blue-100 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Upload Photos
          <input type="file" multiple accept="image/*" className="hidden"
            onChange={(e) => onImageUpload(e.target.files)} />
        </label>
        {uploadingColor === cv.id && (
          <span className="ml-3 text-xs text-blue-500 animate-pulse">Uploading…</span>
        )}
        {cv.images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {cv.images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img src={img.url} alt={img.altText}
                  className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm" />
                <button type="button" onClick={() => onImageRemove(idx)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center shadow-sm transition">
                  ×
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center rounded-b-xl py-0.5 font-medium">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sizes, SKU, Stock */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sizes, SKU & Stock *</label>
          <button type="button" onClick={onAddSize}
            className="flex items-center gap-1 text-xs font-bold text-violet-600 border border-violet-200 hover:bg-violet-50 px-2.5 py-1 rounded-lg transition">
            + Size
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
                menuPortalTarget={selectPortalTarget}
                menuPosition="fixed"
                styles={selectMenuStyles}
              />
              <input type="text" value={sz.sku}
                onChange={(e) => onSizeChange(idx, "sku", e.target.value)}
                placeholder="SKU (e.g. BLK-S)" className={inputCls} />
              <div className="flex gap-1 items-center">
                <input type="number" min="0" value={sz.countInStock}
                  onChange={(e) => onSizeChange(idx, "countInStock", e.target.value)}
                  placeholder="Stock" className={inputCls} />
                {cv.sizes.length > 1 && (
                  <button type="button" onClick={() => onRemoveSize(idx)}
                    className="w-7 h-7 shrink-0 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-bold">✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Shared helpers ───────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition";

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    {children}
  </div>
);

export default AddProduct;
