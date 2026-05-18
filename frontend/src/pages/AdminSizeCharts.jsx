import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
const normalizeAudience = (v) => {
  const s = String(v || "").trim().toLowerCase();
  if (s === "male" || s === "men" || s === "man") return "Men";
  if (s === "female" || s === "women" || s === "woman") return "Women";
  if (s === "kids" || s === "kid" || s === "children" || s === "child") return "Kids";
  return "Unisex";
};

const emptyForm = {
  name: "",
  audience: "",
  unit: "in",
  chartImageUrl: "",
  measureImageUrl: "",
};

const AdminSizeCharts = () => {
  const [charts, setCharts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [genderOptions, setGenderOptions] = useState([]);

  const token = localStorage.getItem("userToken");

  const fetchCharts = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/size-charts`);
      setCharts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load size charts");
    }
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  useEffect(() => {
    const fetchGenderOptions = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/meta-options`);
        const options = (Array.isArray(data) ? data : [])
          .filter((item) => item?.type === "gender" && String(item?.value || "").trim())
          .map((item) => String(item.value).trim());

        const normalized = [...new Set(options.map(normalizeAudience))];
        if (!normalized.includes("Unisex")) normalized.push("Unisex");
        setGenderOptions(normalized);
        setForm((prev) => ({ ...prev, audience: prev.audience || normalized[0] || "Unisex" }));
      } catch {
        setGenderOptions(["Men", "Women", "Kids", "Unisex"]);
        setForm((prev) => ({ ...prev, audience: prev.audience || "Unisex" }));
      }
    };
    fetchGenderOptions();
  }, []);

  const uploadImage = async (field, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      setUploading(true);
      const { data } = await axios.post(`${API_BASE}/api/upload`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm((p) => ({ ...p, [field]: data.imageUrl }));
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const createChart = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.chartImageUrl) {
      toast.error("Name and chart image are required");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/api/size-charts`, { ...form, audience: normalizeAudience(form.audience) }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Size chart created");
      setForm(emptyForm);
      fetchCharts();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create size chart");
    } finally {
      setLoading(false);
    }
  };

  const archiveChart = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/size-charts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Size chart archived");
      setCharts((prev) => prev.filter((c) => c._id !== id));
    } catch {
      toast.error("Failed to archive size chart");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">Size Charts</h1>
        <p className="text-sm text-gray-500">Create reusable Men/Women/Kids size charts for products.</p>
      </div>

      <form onSubmit={createChart} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Chart name (e.g. Men Shirt Slim Fit)"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
          />
          <select
            value={form.audience}
            onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
          >
            {genderOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select
            value={form.unit}
            onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
          >
            <option value="in">in</option>
            <option value="cm">cm</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold cursor-pointer">
            Upload Chart Image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage("chartImageUrl", e.target.files?.[0])} />
          </label>
          <label className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold cursor-pointer">
            Upload How-To-Measure Image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage("measureImageUrl", e.target.files?.[0])} />
          </label>
          <button disabled={loading || uploading} className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-60">
            {loading ? "Saving..." : "Save Size Chart"}
          </button>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Available Size Charts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {charts.map((c) => (
            <div key={c._id} className="border border-gray-200 rounded-xl p-3 space-y-2">
              <img src={c.chartImageUrl} alt={c.name} className="w-full h-36 object-cover rounded-lg border border-gray-200" />
              <p className="font-semibold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-500">{c.audience} • {c.unit}</p>
              <button
                type="button"
                onClick={() => archiveChart(c._id)}
                className="text-xs font-semibold text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
              >
                Archive
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSizeCharts;
