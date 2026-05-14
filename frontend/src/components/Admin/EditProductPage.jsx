import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import {
  fetchProductDetails,
  updateProduct,
} from "../../redux/slices/productsSlice";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map((s) => ({
  value: s, label: s,
}));

const normalizeSize = (s) => {
  const t = String(s || "").trim().toUpperCase().replace(/\s+/g, "");
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
};
const getColorName = (hex) => COLOR_NAME_MAP[hex?.toUpperCase()] || hex?.toUpperCase() || "";

const generateColorOptions = () => {
  const steps = ["00", "33", "66", "99", "CC", "FF"];
  const colors = [];
  for (let r of steps) for (let g of steps) for (let b of steps) colors.push(`#${r}${g}${b}`);
  ["#FFA500","#FFC0CB","#A52A2A","#F5F5DC","#D2691E","#DC143C","#FFD700","#4B0082"].forEach((c) => {
    if (!colors.includes(c)) colors.push(c);
  });
  return colors.map((hex) => ({ value: hex, label: getColorName(hex) }));
};
const COLOR_OPTIONS = generateColorOptions();

const emptySize  = () => ({ size: "", sku: "", countInStock: "" });
const makeId     = () => Date.now() + Math.random();

// Convert saved colorVariants (from DB) to local editable state
const dbColorVariantsToState = (dbCVs = []) =>
  dbCVs.map((cv) => ({
    id: makeId(),
    color:     cv.color     || "",
    colorName: cv.colorName || getColorName(cv.color) || "",
    images:    (cv.images   || []).map((img) => ({ url: img.url, altText: img.altText || "" })),
    sizes:     (cv.sizes    || []).map((s) => ({
      size:         s.size         || "",
      sku:          s.sku          || "",
      countInStock: s.countInStock ?? "",
    })),
  }));

const inputCls =
  "w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition";

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

const EditProductPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { id }    = useParams();
  const { selectedProduct, loading, error } = useSelector((state) => state.products);
  const { token } = useSelector((state) => state.auth);

  const [productData, setProductData] = useState({
    name: "", description: "", price: 0, countInStock: 0, sku: "",
    category: "", brand: "", collections: "", material: "", gender: "",
    images: [],
    sizeChart: { imageUrl: "", title: "Size Chart" },
    offerPercentage: 0, discountPrice: 0,
    isFeatured: false, isPublished: false, tags: "",
    dimensions: { length: "", width: "", height: "" }, weight: "",
  });

  const [colorVariants, setColorVariants] = useState([]);
  const [uploading, setUploading]         = useState(false);
  const [uploadingColor, setUploadingColor] = useState(null);
  const [deleting, setDeleting]           = useState(null);
  const [metaOptions, setMetaOptions]     = useState({ category: [], collection: [], gender: [], material: [] });

  // Load meta options
  useEffect(() => {
    axios.get(`${API_BASE}/api/meta-options`).then(({ data }) => {
      const b = data.reduce(
        (acc, { type, value }) => {
          if (["category","collection","gender","material"].includes(type) && !acc[type].includes(value))
            acc[type].push(value);
          return acc;
        },
        { category: [], collection: [], gender: [], material: [] }
      );
      setMetaOptions(b);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (id) dispatch(fetchProductDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!selectedProduct) return;
    setProductData({
      name:           selectedProduct.name           || "",
      description:    selectedProduct.description    || "",
      price:          selectedProduct.price          || 0,
      countInStock:   selectedProduct.countInStock   || 0,
      sku:            selectedProduct.sku            || "",
      category:       selectedProduct.category       || "",
      brand:          selectedProduct.brand          || "",
      collections:    selectedProduct.collections    || "",
      material:       selectedProduct.material       || "",
      gender:         selectedProduct.gender         || "",
      images:         selectedProduct.images         || [],
      sizeChart:      selectedProduct.sizeChart      || { imageUrl: "", title: "Size Chart" },
      offerPercentage: selectedProduct.offerPercentage || 0,
      discountPrice:  selectedProduct.discountPrice  || 0,
      isFeatured:     selectedProduct.isFeatured     || false,
      isPublished:    selectedProduct.isPublished    || false,
      tags:           Array.isArray(selectedProduct.tags)
                        ? selectedProduct.tags.join(", ")
                        : (selectedProduct.tags || ""),
      dimensions:     selectedProduct.dimensions     || { length: "", width: "", height: "" },
      weight:         selectedProduct.weight         || "",
    });

    // Prefer colorVariants; fall back to building from legacy variants
    if (Array.isArray(selectedProduct.colorVariants) && selectedProduct.colorVariants.length > 0) {
      setColorVariants(dbColorVariantsToState(selectedProduct.colorVariants));
    } else if (Array.isArray(selectedProduct.variants) && selectedProduct.variants.length > 0) {
      // Convert legacy flat variants → colorVariants structure
      const colorMap = {};
      for (const v of selectedProduct.variants) {
        const col = v.color || "";
        if (!colorMap[col]) {
          colorMap[col] = {
            id: makeId(),
            color:     col,
            colorName: getColorName(col),
            images:    selectedProduct.images || [],
            sizes:     [],
          };
        }
        colorMap[col].sizes.push({
          size: v.size || "",
          sku:  v.sku  || "",
          countInStock: v.countInStock ?? "",
        });
      }
      setColorVariants(Object.values(colorMap));
    } else {
      setColorVariants([{
        id: makeId(),
        color: selectedProduct.colors?.[0] || "",
        colorName: getColorName(selectedProduct.colors?.[0] || ""),
        images: selectedProduct.images || [],
        sizes: [{ size: selectedProduct.sizes?.[0] || "", sku: selectedProduct.sku || "", countInStock: selectedProduct.countInStock || "" }],
      }]);
    }
  }, [selectedProduct]);

  // Recalculate total stock from colorVariants
  useEffect(() => {
    const total = colorVariants.reduce(
      (sum, cv) => sum + cv.sizes.reduce((s2, sz) => s2 + Math.max(0, Number(sz.countInStock || 0)), 0),
      0
    );
    setProductData((p) => ({ ...p, countInStock: total }));
  }, [colorVariants]);

  // ─── Basic field handlers ────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setProductData((p) => ({ ...p, [name]: checked }));
      return;
    }
    if (name.startsWith("dimensions.")) {
      const key = name.split(".")[1];
      setProductData((p) => ({ ...p, dimensions: { ...p.dimensions, [key]: value } }));
      return;
    }
    setProductData((p) => {
      const u = { ...p, [name]: value };
      if (name === "offerPercentage" || name === "price") {
        const price = parseFloat(name === "price" ? value : u.price);
        const offer = parseFloat(name === "offerPercentage" ? value : u.offerPercentage);
        if (!isNaN(price) && !isNaN(offer))
          u.discountPrice = Math.round(price - (price * offer) / 100);
      }
      return u;
    });
  };

  // ─── Size-chart upload ──────────────────────────────────────────────────
  const handleSizeChartUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      setUploading(true);
      const { data } = await axios.post(`${API_BASE}/api/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      setProductData((p) => ({ ...p, sizeChart: { ...p.sizeChart, imageUrl: data.imageUrl } }));
      toast.success("Size chart uploaded");
    } catch { toast.error("Failed to upload size chart"); }
    finally { setUploading(false); }
  };

  // ─── Color variant helpers ───────────────────────────────────────────────
  const addColorVariant = () =>
    setColorVariants((p) => [...p, { id: makeId(), color: "", colorName: "", images: [], sizes: [emptySize()] }]);

  const removeColorVariant = (id) =>
    setColorVariants((p) => p.filter((cv) => cv.id !== id));

  const updateCV = (id, field, value) =>
    setColorVariants((p) => p.map((cv) => cv.id === id ? { ...cv, [field]: value } : cv));

  // Per-color image upload
  const handleColorImageUpload = async (id, files) => {
    setUploadingColor(id);
    const uploaded = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("image", file);
      try {
        const { data } = await axios.post(`${API_BASE}/api/upload`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        uploaded.push({ url: data.imageUrl, altText: file.name, publicId: data.publicId });
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
    setColorVariants((p) =>
      p.map((cv) => cv.id === id ? { ...cv, images: [...cv.images, ...uploaded] } : cv)
    );
    setUploadingColor(null);
  };

  // Per-color image remove (with Cloudinary delete)
  const handleColorImageRemove = async (colorId, imgIndex) => {
    const cv  = colorVariants.find((c) => c.id === colorId);
    const img = cv?.images[imgIndex];
    if (!img) return;
    setDeleting(`${colorId}-${imgIndex}`);
    try {
      await axios.post(`${API_BASE}/api/upload/delete`, { imageUrl: img.url }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore — remove from UI regardless */ }
    setColorVariants((p) =>
      p.map((c) =>
        c.id === colorId ? { ...c, images: c.images.filter((_, i) => i !== imgIndex) } : c
      )
    );
    setDeleting(null);
  };

  // Sizes
  const addSize = (colorId) =>
    setColorVariants((p) =>
      p.map((cv) => cv.id === colorId ? { ...cv, sizes: [...cv.sizes, emptySize()] } : cv)
    );
  const removeSize = (colorId, idx) =>
    setColorVariants((p) =>
      p.map((cv) => cv.id === colorId ? { ...cv, sizes: cv.sizes.filter((_, i) => i !== idx) } : cv)
    );
  const updateSize = (colorId, idx, field, value) =>
    setColorVariants((p) =>
      p.map((cv) =>
        cv.id === colorId
          ? { ...cv, sizes: cv.sizes.map((s, i) => i === idx ? { ...s, [field]: value } : s) }
          : cv
      )
    );

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();

    const normalizedColorVariants = colorVariants
      .map((cv) => ({
        color:     cv.color.trim(),
        colorName: cv.colorName.trim() || getColorName(cv.color),
        images:    cv.images,
        sizes:     cv.sizes
          .map((s) => ({ size: normalizeSize(s.size), sku: s.sku.trim(), countInStock: Number(s.countInStock || 0) }))
          .filter((s) => s.size && s.sku),
      }))
      .filter((cv) => cv.color && cv.sizes.length > 0);

    if (!normalizedColorVariants.length) {
      toast.error("Add at least one color with a valid size, SKU and stock.");
      return;
    }

    const allSizes  = [...new Set(normalizedColorVariants.flatMap((cv) => cv.sizes.map((s) => s.size)))];
    const allColors = [...new Set(normalizedColorVariants.map((cv) => cv.color))];
    const totalStock = normalizedColorVariants.reduce(
      (sum, cv) => sum + cv.sizes.reduce((s2, sz) => s2 + Math.max(0, sz.countInStock), 0), 0
    );
    const firstSku = productData.sku || normalizedColorVariants[0]?.sizes[0]?.sku;

    const payload = {
      ...productData,
      price: Number(productData.price),
      offerPercentage: Number(productData.offerPercentage || 0),
      countInStock: totalStock,
      sku: firstSku,
      sizes: allSizes,
      colors: allColors,
      colorVariants: normalizedColorVariants,
      variants: [],
      images: normalizedColorVariants[0]?.images || productData.images || [],
      tags: typeof productData.tags === "string"
        ? productData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : productData.tags,
      sizeChart: {
        imageUrl: productData.sizeChart?.imageUrl || "",
        title:    productData.sizeChart?.title    || "Size Chart",
      },
    };

    dispatch(updateProduct({ id, productData: payload }));
    toast.success("Product updated!");
    navigate("/admin/products");
  };

  if (loading) return <p className="p-6">Loading…</p>;
  if (error)   return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200 mb-10">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Edit Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic Info ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Product Name *">
            <input type="text" name="name" value={productData.name}
              onChange={handleChange} required className={inputCls} />
          </Field>
          <Field label="SKU">
            <input type="text" name="sku" value={productData.sku}
              onChange={handleChange} className={inputCls} />
          </Field>
          <Field label="Price *">
            <input type="number" name="price" value={productData.price}
              onChange={handleChange} required min="0" step="0.01" className={inputCls} />
          </Field>
          <Field label="Offer %">
            <input type="number" name="offerPercentage" value={productData.offerPercentage}
              onChange={handleChange} min="0" step="0.1" className={inputCls} />
          </Field>
          <Field label="Discount Price (auto)">
            <input type="number" name="discountPrice" value={productData.discountPrice}
              readOnly className={`${inputCls} bg-gray-100`} />
          </Field>
          <Field label="Total Stock (auto)">
            <input type="number" value={productData.countInStock}
              readOnly className={`${inputCls} bg-gray-100`} />
          </Field>
          <Field label="Category">
            <select name="category" value={productData.category} onChange={handleChange} className={inputCls}>
              <option value="">Select Category</option>
              {metaOptions.category.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Collection">
            <select name="collections" value={productData.collections} onChange={handleChange} className={inputCls}>
              <option value="">Select Collection</option>
              {metaOptions.collection.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Gender">
            <select name="gender" value={productData.gender} onChange={handleChange} className={inputCls}>
              <option value="">Select Gender</option>
              {metaOptions.gender.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Material">
            <select name="material" value={productData.material} onChange={handleChange} className={inputCls}>
              <option value="">Select Material</option>
              {metaOptions.material.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Brand">
            <input type="text" name="brand" value={productData.brand}
              onChange={handleChange} className={inputCls} />
          </Field>
          <Field label="Weight (kg)">
            <input type="number" name="weight" value={productData.weight}
              onChange={handleChange} min="0" step="0.01" className={inputCls} />
          </Field>
          <Field label="Tags (comma-separated)">
            <input type="text" name="tags" value={productData.tags}
              onChange={handleChange} placeholder="casual, trendy, cotton" className={inputCls} />
          </Field>
          <div className="flex items-center gap-6 pt-2">
            {[["isFeatured","Featured"],["isPublished","Published"]].map(([name, label]) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" name={name} checked={productData[name]} onChange={handleChange}
                  className="w-4 h-4 accent-indigo-600" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* ── Description ── */}
        <Field label="Description *">
          <textarea name="description" value={productData.description}
            onChange={handleChange} rows={4} required className={inputCls} />
        </Field>

        {/* ── Dimensions ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (cm)</label>
          <div className="grid grid-cols-3 gap-2">
            {["length","width","height"].map((d) => (
              <input key={d} type="number" name={`dimensions.${d}`}
                value={productData.dimensions?.[d] || ""} onChange={handleChange}
                min="0" step="0.1" placeholder={d.charAt(0).toUpperCase()+d.slice(1)}
                className={inputCls} />
            ))}
          </div>
        </div>

        {/* ── Size Chart ── */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Size Chart Image</label>
          <input type="file" accept="image/*" onChange={handleSizeChartUpload}
            disabled={uploading} className="text-sm" />
          {uploading && <p className="text-xs text-blue-500 mt-1 animate-pulse">Uploading…</p>}
          {productData.sizeChart?.imageUrl && (
            <img src={productData.sizeChart.imageUrl} alt="Size chart"
              className="mt-2 w-48 rounded border border-gray-200" />
          )}
        </div>

        {/* ── Color Variants ── */}
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
              <div key={cv.id}
                className="border-2 border-indigo-100 rounded-xl p-4 bg-gradient-to-br from-white to-indigo-50">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {cv.color && (
                      <span className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: cv.color }} />
                    )}
                    <span className="font-semibold text-gray-800">
                      Color {cvIdx + 1}{cv.colorName ? `: ${cv.colorName}` : ""}
                    </span>
                  </div>
                  {colorVariants.length > 1 && (
                    <button type="button" onClick={() => removeColorVariant(cv.id)}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded">
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Color (hex) *</label>
                    <Select
                      options={COLOR_OPTIONS}
                      value={cv.color ? { value: cv.color, label: getColorName(cv.color) } : null}
                      onChange={(sel) => {
                        updateCV(cv.id, "color", sel?.value || "");
                        updateCV(cv.id, "colorName", getColorName(sel?.value || ""));
                      }}
                      placeholder="Select color"
                      formatOptionLabel={(opt) => (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                            style={{ backgroundColor: opt.value }} />
                          <span>{opt.label}</span>
                        </div>
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Display Name</label>
                    <input type="text" value={cv.colorName}
                      onChange={(e) => updateCV(cv.id, "colorName", e.target.value)}
                      placeholder="e.g. Midnight Black"
                      className={inputCls} />
                  </div>
                </div>

                {/* Images for this color */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-2">Photos</label>
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded-lg cursor-pointer hover:bg-blue-100">
                    📷 Upload Photos
                    <input type="file" multiple accept="image/*" className="hidden"
                      onChange={(e) => handleColorImageUpload(cv.id, e.target.files)} />
                  </label>
                  {uploadingColor === cv.id && (
                    <span className="ml-2 text-xs text-blue-500 animate-pulse">Uploading…</span>
                  )}
                  {cv.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {cv.images.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img src={img.url} alt={img.altText}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                          <button type="button"
                            onClick={() => handleColorImageRemove(cv.id, idx)}
                            disabled={deleting === `${cv.id}-${idx}`}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                            {deleting === `${cv.id}-${idx}` ? "⟳" : "×"}
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

                {/* Sizes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-600">Sizes, SKU & Stock *</label>
                    <button type="button" onClick={() => addSize(cv.id)}
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
                          onChange={(sel) => updateSize(cv.id, idx, "size", sel?.value || "")}
                          placeholder="Size"
                        />
                        <input type="text" value={sz.sku}
                          onChange={(e) => updateSize(cv.id, idx, "sku", e.target.value)}
                          placeholder="SKU" className={inputCls} />
                        <div className="flex gap-1 items-center">
                          <input type="number" min="0" value={sz.countInStock}
                            onChange={(e) => updateSize(cv.id, idx, "countInStock", e.target.value)}
                            placeholder="Stock" className={inputCls} />
                          {cv.sizes.length > 1 && (
                            <button type="button" onClick={() => removeSize(cv.id, idx)}
                              className="text-red-500 hover:text-red-700 px-1">✕</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={uploading || !!deleting}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200">
          {uploading || deleting ? "Processing…" : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
