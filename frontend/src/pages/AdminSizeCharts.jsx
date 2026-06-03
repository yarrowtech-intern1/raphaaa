import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

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
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [genderOptions, setGenderOptions] = useState([]);
  const [uploadField, setUploadField] = useState("");

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
      if (!token) {
        setGenderOptions(["Unisex"]);
        setForm((prev) => ({ ...prev, audience: prev.audience || "Unisex" }));
        return;
      }

      try {
        const { data } = await axios.get(`${API_BASE}/api/meta-options`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const options = (Array.isArray(data) ? data : [])
          .filter((item) => item?.type === "gender" && String(item?.value || "").trim())
          .map((item) => String(item.value).trim());

        const unique = [...new Set(options)];
        if (!unique.includes("Unisex")) unique.push("Unisex");
        setGenderOptions(unique);
        setForm((prev) => ({ ...prev, audience: prev.audience || unique[0] || "Unisex" }));
      } catch {
        setGenderOptions(["Unisex"]);
        setForm((prev) => ({ ...prev, audience: prev.audience || "Unisex" }));
      }
    };
    fetchGenderOptions();
  }, []);

  const uploadImage = async (field, file) => {
    if (!file) return;
    if (!token) {
      toast.error("Please login again (missing token)");
      return;
    }
    const fd = new FormData();
    fd.append("image", file);
    try {
      setUploading(true);
      setUploadField(field);
      const { data } = await axios.post(`${API_BASE}/api/upload`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setForm((p) => ({ ...p, [field]: data.imageUrl }));
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      setUploadField("");
    }
  };

  const createChart = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.chartImageUrl || (!editingId && !form.measureImageUrl)) {
      toast.error(editingId ? "Name and chart image are required" : "Name, chart image, and how-to-measure image are required");
      return;
    }
    try {
      setLoading(true);
      const payload = { ...form, audience: String(form.audience || "").trim() || "Unisex" };
      if (editingId) {
        await axios.put(`${API_BASE}/api/size-charts/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Size chart updated");
      } else {
        await axios.post(`${API_BASE}/api/size-charts`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Size chart created");
      }
      setForm(emptyForm);
      setEditingId("");
      fetchCharts();
    } catch (err) {
      toast.error(err?.response?.data?.message || (editingId ? "Failed to update size chart" : "Failed to create size chart"));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (chart) => {
    setEditingId(chart._id);
    setForm({
      name: chart.name || "",
      audience: chart.audience || "Unisex",
      unit: chart.unit || "in",
      chartImageUrl: chart.chartImageUrl || "",
      measureImageUrl: chart.measureImageUrl || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId("");
    setForm(emptyForm);
  };

  const archiveChart = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/size-charts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Size chart archived");
      setCharts((prev) => prev.filter((c) => c._id !== id));
      if (editingId === id) {
        cancelEdit();
      }
    } catch {
      toast.error("Failed to archive size chart");
    }
  };

  const clearMeasureImage = () => {
    setForm((prev) => ({ ...prev, measureImageUrl: "" }));
  };

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">Size Charts</h1>
        <p className="text-sm text-gray-500">Create reusable size charts using the stored gender categories.</p>
      </div>

      <form onSubmit={createChart} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              {editingId ? "Editing existing chart" : "Create new chart"}
            </p>
            <p className="text-sm text-gray-600">
              {editingId ? "Replace images or update the existing size chart." : "Upload a new reusable size chart."}
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50"
            >
              Cancel Edit
            </button>
          )}
        </div>

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
            {uploading && uploadField === "chartImageUrl" ? "Uploading Chart..." : "Upload Chart Image"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage("chartImageUrl", e.target.files?.[0])} />
          </label>
          <label className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold cursor-pointer">
            {uploading && uploadField === "measureImageUrl" ? "Uploading Measure..." : "Upload How-To-Measure Image"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage("measureImageUrl", e.target.files?.[0])} />
          </label>
          {editingId && (
            <button
              type="button"
              onClick={clearMeasureImage}
              className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold"
            >
              Remove Measure Image
            </button>
          )}
          <button disabled={loading || uploading} className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-60">
            {loading ? "Saving..." : editingId ? "Update Size Chart" : "Save Size Chart"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Chart Preview</p>
            {form.chartImageUrl ? (
              <img src={form.chartImageUrl} alt="Chart preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
            ) : (
              <p className="text-sm text-gray-400">No chart image uploaded yet.</p>
            )}
          </div>
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">How To Measure Preview</p>
            {form.measureImageUrl ? (
              <img src={form.measureImageUrl} alt="How to measure preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
            ) : (
              <p className="text-sm text-gray-400">No how-to-measure image uploaded yet.</p>
            )}
          </div>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Available Size Charts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {charts.map((c) => (
            <div key={c._id} className="border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Chart</p>
                  <img src={c.chartImageUrl} alt={c.name} className="w-full h-28 object-cover rounded-lg border border-gray-200" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Measure</p>
                  <img
                    src={c.measureImageUrl || c.chartImageUrl}
                    alt={`${c.name} measure`}
                    className="w-full h-28 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              </div>
              <p className="font-semibold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-500">{c.audience} • {c.unit}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => archiveChart(c._id)}
                  className="text-xs font-semibold text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSizeCharts;
