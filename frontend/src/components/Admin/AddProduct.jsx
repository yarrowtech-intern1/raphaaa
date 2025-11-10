import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { createProduct } from "../../redux/slices/adminProductSlice";
import { toast } from "sonner";
import Select from "react-select";

const AddProduct = () => {
  const [colorSearchHex, setColorSearchHex] = useState("");
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    offerPercentage: "",
    countInStock: "",
    sku: "",
    category: "",
    brand: "",
    sizes: [],
    colors: [],
    collections: "",
    material: "",
    gender: "",
    images: [],
    isFeatured: false,
    isPublished: false,
    tags: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    weight: "",
  });
  const { loading } = useSelector((state) => state.adminProducts);
  // const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  // const [metaOptions, setMetaOptions] = useState({ category: [], collection: [], gender: [] });
  // top of AddProduct.jsx
  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

  const [metaOptions, setMetaOptions] = useState({
    category: [],
    collection: [],
    gender: [],
    material: [],        // ← include material from your API
  });
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setMetaLoading(true);
        setMetaError("");

        const { data } = await axios.get(`${API_BASE}/api/meta-options`);

        // Map API -> state buckets; dedupe values just in case
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
      } catch (err) {
        console.error("Failed to load meta options:", err);
        setMetaError("Failed to load categories/collections/gender.");
      } finally {
        setMetaLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // useEffect(() => {
  //   const fetchOptions = async () => {
  //     const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options`);
  //     const categorized = { category: [], collection: [], gender: [] };
  //     res.data.forEach((opt) => categorized[opt.type].push(opt.value));
  //     setMetaOptions(categorized);
  //   };
  //   fetchOptions();
  // }, []);


  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setProductData({ ...productData, [name]: checked });
    } else if (name.startsWith("dimensions.")) {
      const dimensionKey = name.split(".")[1];
      setProductData({
        ...productData,
        dimensions: {
          ...productData.dimensions,
          [dimensionKey]: value,
        },
      });
    } else {
      const updatedData = { ...productData, [name]: value };
      if (name === "offerPercentage") {
        const price = parseFloat(updatedData.price);
        const offer = parseFloat(value);
        if (!isNaN(price) && !isNaN(offer)) {
          const discount = price - (price * offer) / 100;
          updatedData.discountPrice = Math.round(discount);
        }
      }
      setProductData(updatedData);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];

    for (let file of files) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );

        newImages.push({ url: data.imageUrl, altText: file.name });
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.error(`Failed to upload image: ${file.name}`);
      }
    }

    setProductData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const handleImageRemove = (index) => {
    const updated = [...productData.images];
    updated.splice(index, 1);
    setProductData({ ...productData, images: updated });
  };

  const handleMultiSelect = (selectedOptions, name) => {
    const values = selectedOptions.map((opt) => opt.value);
    setProductData({ ...productData, [name]: values });
  };

  const generateWebSafeColors = () => {
    const steps = ["00", "33", "66", "99", "CC", "FF"];
    const colors = [];
    for (let r of steps) {
      for (let g of steps) {
        for (let b of steps) {
          colors.push(`#${r}${g}${b}`);
        }
      }
    }
    return colors;
  };

  const colorNameMap = {
    "#000000": "Black", "#FFFFFF": "White", "#FF0000": "Red",
    "#00FF00": "Lime", "#0000FF": "Blue", "#FFFF00": "Yellow",
    "#00FFFF": "Cyan", "#FF00FF": "Magenta", "#C0C0C0": "Silver",
    "#808080": "Gray", "#800000": "Maroon", "#808000": "Olive",
    "#008000": "Green", "#800080": "Purple", "#008080": "Teal",
    "#000080": "Navy",
  };

  const getColorNameFromHex = (hex) => {
    return colorNameMap[hex.toUpperCase()] || hex.toUpperCase();
  };

  const webSafeColorOptions = generateWebSafeColors().map((hex) => ({
    value: hex,
    label: (
      <div
        className="flex items-center gap-2"
        title={`${getColorNameFromHex(hex)} (${hex})`}
      >
        <span
          className="inline-block w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: hex }}
        ></span>
        {getColorNameFromHex(hex)}
      </div>
    ),
  }));

  const selectedColors = productData.colors.map((hex) => ({
    value: hex,
    label: (
      <div
        className="flex items-center gap-2"
        title={`${getColorNameFromHex(hex)} (${hex})`}
      >
        <span
          className="inline-block w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: hex }}
        ></span>
        {getColorNameFromHex(hex)}
      </div>
    ),
  }));

  // Normalize a few common typos/synonyms (e.g., xll -> XXL, 2xl -> XXL)
  const normalizeSize = (s) => {
    const t = String(s).trim().toUpperCase().replace(/\s+/g, "");
    if (t === "XLL") return "XXL";
    if (t === "2XL") return "XXL";
    if (t === "3XL" || t === "XXXL") return "3XL";
    if (t === "4XL" || t === "XXXXL") return "4XL";
    if (t === "5XL" || t === "XXXXXL") return "5XL";
    return t;
  };

  // Build grouped options for react-select
  const toOpts = (arr) => arr.map((v) => ({ value: v, label: v }));

  // Curated size groups you can tweak anytime
  const SIZE_GROUPED_OPTIONS = [
    {
      label: "Alpha (Adults)",
      options: toOpts(["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]),
    },
    {
      label: "Women – Numeric (US)",
      options: toOpts(["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24"]),
    },
    {
      label: "Men – Waist (in)",
      options: toOpts(["26", "28", "29", "30", "31", "32", "33", "34", "36", "38", "40", "42", "44", "46", "48"]),
    },
    {
      label: "Men – Shirt Neck (in)",
      options: toOpts(["14", "14.5", "15", "15.5", "16", "16.5", "17", "17.5", "18"]),
    },
    {
      label: "Kids / Baby",
      options: toOpts([
        "NB", "0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M",
        "2T", "3T", "4T", "5T",
        "4", "5", "6", "7", "8", "10", "12", "14", "16"
      ]),
    },
  ];



  const handleProductSubmit = async (e) => {
    e.preventDefault();

    try {
      const transformedData = {
        ...productData,
        price: Number(productData.price),
        offerPercentage: productData.offerPercentage
          ? Number(productData.offerPercentage)
          : 0,
        discountPrice: productData.offerPercentage
          ? Math.round(
            Number(productData.price) -
            (Number(productData.price) * Number(productData.offerPercentage)) /
            100
          )
          : productData.discountPrice
            ? Math.round(Number(productData.discountPrice))
            : undefined,
        countInStock: Number(productData.countInStock),
        weight: productData.weight ? Number(productData.weight) : undefined,
        tags: productData.tags
          ? productData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag)
          : [],
        dimensions: {
          length: productData.dimensions.length ? Number(productData.dimensions.length) : undefined,
          width: productData.dimensions.width ? Number(productData.dimensions.width) : undefined,
          height: productData.dimensions.height ? Number(productData.dimensions.height) : undefined,
        },
        images: productData.images.filter((img) => img.url.trim() !== ""),
      };

      if (!transformedData.dimensions.length && !transformedData.dimensions.width && !transformedData.dimensions.height) {
        delete transformedData.dimensions;
      }

      dispatch(createProduct(transformedData));

      toast.success("Product added successfully!");
      setProductData({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        offerPercentage: "",
        countInStock: "",
        sku: "",
        category: "",
        brand: "",
        sizes: [],
        colors: [],
        collections: "",
        material: "",
        gender: "",
        images: [],
        isFeatured: false,
        isPublished: false,
        tags: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        dimensions: {
          length: "",
          width: "",
          height: "",
        },
        weight: "",
      });

    } catch (err) {
      console.error("Error adding product:", err);
      toast.error("Failed to add product");
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-6">Add New Product</h3>
      <p className="text-red-500 font-bold mb-3 animate-pulse">
        {" "}
        * Note that product image you can upload after you can upload the
        product details. You can upload the product image by find using product
        name.
      </p>
      <form onSubmit={handleProductSubmit}>
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Upload Product Images</label>
          <div className="relative inline-block">
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
            >
              📁 Upload Images
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Uploaded Image Preview */}
        {productData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {productData.images.map((img, index) => (
              <div key={index} className="relative rounded-lg p-2 shadow-lg bg-gradient-to-tr from-white via-slate-50 to-gray-100 transition hover:shadow-xl">
                <img src={img.url} alt={img.altText || "preview"} className="w-full object-cover rounded" />
                <input
                  type="text"
                  value={img.altText}
                  onChange={(e) => {
                    const updated = [...productData.images];
                    updated[index].altText = e.target.value;
                    setProductData({ ...productData, images: updated });
                  }}
                  placeholder="Alt text"
                  className="mt-1 px-3 py-1 w-full rounded border border-gray-200 bg-white text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-800 text-sm text-white rounded-full px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Product Name */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Product Name {" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleProductChange}
              required
              placeholder="Enter product name"
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              SKU {" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="sku"
              value={productData.sku}
              onChange={handleProductChange}
              required
              placeholder="Unique product identifier"
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Price {" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleProductChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter product price"
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Offer Percentage
            </label>
            <input
              type="number"
              name="offerPercentage"
              value={productData.offerPercentage}
              onChange={handleProductChange}
              min="0"
              step="0.1"
              placeholder="Enter discount %"
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            />
          </div>
          {/* Discount Price */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Discount Price
            </label>
            <input
              type="number"
              name="discountPrice"
              value={productData.discountPrice}
              onChange={handleProductChange}
              min="0"
              step="0.01"
              placeholder="Auto Generated"
              disabled
              className="w-full px-4 py-2 rounded-md border bg-gray-200 text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            />
          </div>

          {/* Count in Stock */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Count in Stock {" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="countInStock"
              value={productData.countInStock}
              onChange={handleProductChange}
              required
              min="0"
              placeholder="Enter product stock"
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Category {" "}
              <span className="text-red-600">*</span>
            </label>
            <select
              name="category"
              value={productData.category}
              onChange={handleProductChange}
              required
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            >
              <option value="">Select Category</option>
              {metaOptions.category.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Collections */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Collections {" "}
              <span className="text-red-600">*</span>
            </label>
            <select
              name="collections"
              value={productData.collections}
              onChange={handleProductChange}
              required
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            >
              <option value="">Select Collection</option>
              {metaOptions.collection.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={productData.brand}
              onChange={handleProductChange}
              placeholder="Enter product brand"
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Gender
            </label>
            <select
              name="gender"
              value={productData.gender}
              onChange={handleProductChange}
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            >
              <option value="">Select Gender</option>
              {metaOptions.gender.map((gen) => (
                <option key={gen} value={gen}>{gen}</option>
              ))}
            </select>
          </div>

          {/* Sizes and Colors with react-select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Sizes <span className="text-red-600">*</span>
              </label>
              <Select
                isMulti
                name="sizes"
                options={SIZE_GROUPED_OPTIONS}
                value={productData.sizes.map((s) => {
                  const v = normalizeSize(s);
                  return { value: v, label: v };
                })}
                onChange={(selected) =>
                  setProductData((prev) => ({
                    ...prev,
                    sizes: (selected || []).map((opt) => normalizeSize(opt.value)),
                  }))
                }
                className="basic-multi-select"
                classNamePrefix="select"
              />

            </div>

            <div>
              <label className="block text-gray-700 mb-1 font-medium">Colors {" "} <span className="text-red-600">*</span></label>
              <Select
                isMulti
                name="colors"
                options={webSafeColorOptions}
                value={selectedColors}
                onChange={(selected) => handleMultiSelect(selected, "colors")}
                className="basic-multi-select"
                classNamePrefix="select"
              />

            </div>
          </div>

          {/* Material */}
          <div className="md: mt-3">
            <label className="block text-gray-700 mb-1 font-medium">Material</label>
            <select
              name="material"
              value={productData.material}
              onChange={handleProductChange}
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            >
              <option value="">Select Material</option>
              {metaOptions.material.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>


          {/* Weight */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={productData.weight}
              onChange={handleProductChange}
              min="0"
              step="0.01"
              placeholder="Enter product weight"
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={productData.tags}
              onChange={handleProductChange}
              placeholder="e.g., trendy, casual, comfortable"
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="block text-gray-700 mb-1 font-medium">
            Description {" "}
            <span className="text-red-600">*</span>
          </label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleProductChange}
            rows="4"
            required
            placeholder="Enter product description"
            className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          ></textarea>
        </div>

        {/* Images */}
        {/* <div className="mt-4">
          <label className="block text-gray-700 mb-1 font-medium">Product Images *</label>
          {productData.images.map((image, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                placeholder="Image URL"
                value={image.url}
                onChange={(e) => handleImageChange(index, "url", e.target.value)}
                required={index === 0}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                placeholder="Alt text"
                value={image.altText}
                onChange={(e) => handleImageChange(index, "altText", e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
              />
              {productData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Another Image
          </button>
        </div> */}

        {/* Dimensions */}
        <div className="mt-4">
          <label className="block text-gray-700 mb-1 font-medium">Dimensions (cm)</label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              name="dimensions.length"
              placeholder="Length"
              value={productData.dimensions.length}
              onChange={handleProductChange}
              min="0"
              step="0.1"
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            />
            <input
              type="number"
              name="dimensions.width"
              placeholder="Width"
              value={productData.dimensions.width}
              onChange={handleProductChange}
              min="0"
              step="0.1"
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            />
            <input
              type="number"
              name="dimensions.height"
              placeholder="Height"
              value={productData.dimensions.height}
              onChange={handleProductChange}
              min="0"
              step="0.1"
              className="w-full px-4 py-2 rounded-md border bg-white text-gray-800 border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
            />
          </div>
        </div>

        {/* SEO Fields */}
        {/* <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Meta Title</label>
            <input
              type="text"
              name="metaTitle"
              value={productData.metaTitle}
              onChange={handleProductChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Meta Description</label>
            <textarea
              name="metaDescription"
              value={productData.metaDescription}
              onChange={handleProductChange}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Meta Keywords</label>
            <input
              type="text"
              name="metaKeywords"
              value={productData.metaKeywords}
              onChange={handleProductChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div> */}

        {/* Checkboxes */}
        {/* <div className="mt-4 flex gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isFeatured"
              checked={productData.isFeatured}
              onChange={handleProductChange}
              className="mr-2"
            />
            <label className="text-gray-700 font-medium">Featured Product</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublished"
              checked={productData.isPublished}
              onChange={handleProductChange}
              className="mr-2"
            />
            <label className="text-gray-700 font-medium">Published</label>
          </div>
        </div> */}

        <div className="mt-6">
          <button
            type="submit"
            className="bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 hover:brightness-110 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >

            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
