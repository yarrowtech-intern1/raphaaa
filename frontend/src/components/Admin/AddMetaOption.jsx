import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FaPen, FaCheck, FaTrash, FaPlus } from "react-icons/fa";
import { BiCategoryAlt } from "react-icons/bi";

const TABS = [
  { key: "category",   label: "Categories",  color: "bg-blue-500",   light: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500"   },
  { key: "collection", label: "Collections", color: "bg-violet-500", light: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
  { key: "gender",     label: "Genders",     color: "bg-pink-500",   light: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-200",   dot: "bg-pink-500"   },
  { key: "material",   label: "Fabrics",     color: "bg-amber-500",  light: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-500"  },
];

const AddMetaOption = () => {
  const [type,       setType]       = useState("category");
  const [value,      setValue]      = useState("");
  const [options,    setOptions]    = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [editingId,  setEditingId]  = useState(null);
  const [editedVal,  setEditedVal]  = useState("");
  const [adding,     setAdding]     = useState(false);

  const fetchOptions = async () => {
    const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options`);
    setOptions(data);
  };

  const fetchCategoryCounts = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
      const counts = (Array.isArray(data) ? data : []).reduce((acc, product) => {
        const key = String(product?.category || "").trim().toLowerCase();
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      setCategoryCounts(counts);
    } catch (error) {
      setCategoryCounts({});
    }
  };

  useEffect(() => {
    fetchOptions();
    fetchCategoryCounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) return toast.error("Please enter a value");
    setAdding(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options`, { type, value: value.trim() });
      toast.success("Option added");
      setValue("");
      fetchOptions();
      if (type === "category") fetchCategoryCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add");
    } finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options/${id}`);
      toast.success("Deleted");
      fetchOptions();
      fetchCategoryCounts();
    } catch { toast.error("Failed to delete"); }
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options/${id}`, { value: editedVal });
      toast.success("Updated");
      setEditingId(null);
      fetchOptions();
      fetchCategoryCounts();
    } catch { toast.error("Update failed"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
          <BiCategoryAlt className="text-white text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Manage Categories</h1>
          <p className="text-xs text-gray-400 mt-0.5">Add or remove product categories, collections, genders and fabrics</p>
        </div>
      </div>

      {/* ── Add form ── */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
      >
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Add New Option</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Type selector as pills */}
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setType(t.key)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  type === t.key
                    ? `${t.light} ${t.text} ${t.border} shadow-sm`
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Input + add */}
          <div className="flex gap-2 flex-1">
            <input
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              placeholder={`New ${TABS.find((t) => t.key === type)?.label.slice(0, -1).toLowerCase()}…`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition disabled:opacity-50"
            >
              <FaPlus className="text-xs" /> Add
            </button>
          </div>
        </div>
      </form>

      {/* ── 4 columns ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {TABS.map((tab) => {
          const items = options.filter((o) => o.type === tab.key);
          return (
            <div key={tab.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Card header */}
              <div className={`flex items-center justify-between px-4 py-3 ${tab.light} border-b ${tab.border}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${tab.dot}`} />
                  <h3 className={`text-sm font-bold ${tab.text}`}>{tab.label}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tab.light} ${tab.text} border ${tab.border}`}>
                  {items.length}
                </span>
              </div>

              {/* Items */}
              <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto">
                {items.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No {tab.label.toLowerCase()} yet</p>
                )}
                {items.map((opt) => (
                  <div
                    key={opt._id}
                    className="group flex items-center gap-2 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl px-3 py-2 transition-all"
                  >
                    {editingId === opt._id ? (
                      <>
                        <input
                          type="text"
                          value={editedVal}
                          onChange={(e) => setEditedVal(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(opt._id)}
                          className="w-6 h-6 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 transition"
                          title="Save"
                        >
                          <FaCheck className="text-[10px]" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center shrink-0 transition text-xs font-bold"
                          title="Cancel"
                        >✕</button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-gray-700 font-medium truncate">{opt.value}</span>
                        {tab.key === "category" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                            {categoryCounts[String(opt.value || "").trim().toLowerCase()] || 0} products
                          </span>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                          <button
                            onClick={() => { setEditingId(opt._id); setEditedVal(opt.value); }}
                            className="w-6 h-6 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition"
                            title="Edit"
                          >
                            <FaPen className="text-[10px]" />
                          </button>
                          <button
                            onClick={() => handleDelete(opt._id)}
                            className="w-6 h-6 rounded-lg bg-red-100 hover:bg-red-200 text-red-500 flex items-center justify-center transition"
                            title="Delete"
                          >
                            <FaTrash className="text-[10px]" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick-add shortcut */}
              <div className={`px-3 py-2.5 border-t ${tab.border} ${tab.light}`}>
                <button
                  type="button"
                  onClick={() => setType(tab.key)}
                  className={`w-full flex items-center justify-center gap-1.5 text-[11px] font-bold ${tab.text} hover:opacity-80 transition`}
                >
                  <FaPlus className="text-[9px]" /> Add {tab.label.slice(0, -1)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AddMetaOption;
