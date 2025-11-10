import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const AdminCollabSettings = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      setImage(data.imageUrl);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFootballerImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      const updated = [...collaborators];
      updated[index].image = data.imageUrl;
      setCollaborators(updated);
      toast.success(`Footballer ${index + 1} image uploaded`);
    } catch {
      toast.error("Footballer image upload failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products`
        );
        setAllProducts(data);
      } catch {
        toast.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  const handleAddCollaborator = () => {
    setCollaborators([...collaborators, { name: "", image: "", products: [] }]);
  };

  const handleCollaboratorChange = (index, field, value) => {
    const updated = [...collaborators];
    updated[index][field] = value;
    setCollaborators(updated);
  };

  const handleProductToggle = (index, productId) => {
    const updated = [...collaborators];
    const exists = updated[index].products.includes(productId);
    updated[index].products = exists
      ? updated[index].products.filter((id) => id !== productId)
      : [...updated[index].products, productId];
    setCollaborators(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/collabs`, {
        title,
        description,
        image,
        isPublished,
        collaborators,
      });
      toast.success("Collab saved!");
      setTitle("");
      setDescription("");
      setIsPublished(false);
      setCollaborators([]);
      setImage("");
      setProductSearch("");
    } catch {
      toast.error("Failed to save collab");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Create Collaboration
          </h2>
          <span
            className={`text-xs px-3 py-1 rounded-full border ${isPublished
                ? "border-green-300 bg-green-50 text-green-600"
                : "border-yellow-300 bg-yellow-50 text-yellow-600"
              }`}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Banner Image */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Collab Banner Image
            </label>
            <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
              <span className="text-xs text-gray-500">
                Click to upload or drag & drop
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {uploading && (
              <p className="text-sm text-gray-500 animate-pulse">Uploading...</p>
            )}
            {image && (
              <img
                src={image}
                alt="Collab Banner"
                className="h-44 w-full object-cover rounded-xl mt-2 border border-gray-200"
              />
            )}
          </div>

          {/* Title + Publish */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Collab Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-gray-50 border border-gray-300 px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none"
                placeholder="e.g., Champion’s Collection"
                required
              />
            </div>

            <div className="flex items-end md:items-center">
              <label className="inline-flex items-center cursor-pointer select-none">
                <span className="mr-3 text-sm">Draft</span>
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <span className="relative inline-block w-14 h-8 rounded-full bg-gray-300 peer-checked:bg-green-500 transition-colors">
                  <span className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-all peer-checked:translate-x-6" />
                </span>
                <span className="ml-3 text-sm font-medium text-gray-800">
                  Publish now
                </span>
              </label>
            </div>
          </div>
            <div className="space-y-2 grid grid-cols-1">
            <label className="text-sm font-medium">Description</label>
            <textarea name="description" id="description" placeholder="Enter description..." className="w-full rounded-xl bg-gray-50 border border-gray-300 px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none" onChange={(e) => setDescription(e.target.value)} value={description}></textarea>
          </div>
          {/* Collaborators */}
          <div className="space-y-6">
            {collaborators.map((collab, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5"
              >
                <h4 className="font-semibold text-lg text-gray-800 mb-4">
                  Person {index + 1}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Person Name"
                    value={collab.name}
                    onChange={(e) =>
                      handleCollaboratorChange(index, "name", e.target.value)
                    }
                    className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400 outline-none"
                  />
                  <label className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm text-gray-600 h-10">
                    <span>Upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFootballerImageUpload(e, index)
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                {collab.image && (
                  <img
                    src={collab.image}
                    alt={`Footballer ${index + 1}`}
                    className="h-28 w-full md:w-auto rounded-lg object-cover mb-4 border border-gray-200"
                  />
                )}

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Select Used Products
                  </p>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400 outline-none"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200 p-3 bg-white">
                    {allProducts
                      .filter((product) =>
                        product.name
                          .toLowerCase()
                          .includes(productSearch.toLowerCase())
                      )
                      .map((product) => (
                        <label
                          key={product._id}
                          className="flex items-center gap-2 text-sm text-gray-700 rounded-md px-2 py-1 hover:bg-gray-100 transition"
                        >
                          <input
                            type="checkbox"
                            checked={collab.products.includes(product._id)}
                            onChange={() =>
                              handleProductToggle(index, product._id)
                            }
                            className="accent-sky-500"
                          />
                          <img
                            src={product.images[0]?.url}
                            alt={product.name}
                            className="w-8 h-8 object-cover rounded border border-gray-200"
                          />
                          <span className="truncate">{product.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={handleAddCollaborator}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-white font-medium shadow hover:bg-sky-600 active:scale-[0.99] transition"
            >
              <span className="text-lg leading-none">＋</span> Add Persons
            </button>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-3 text-white font-semibold shadow-lg hover:opacity-95 disabled:opacity-60 transition"
            >
              {loading ? "Saving..." : "Save Collab"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCollabSettings;
