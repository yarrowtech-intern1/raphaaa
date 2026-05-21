import React, { useRef, useState, useEffect } from "react";
import JoditEditor from "jodit-react";
import axios from "axios";
import { toast } from "sonner";

const PAGES = [
  { type: "terms",               label: "Terms & Conditions",     color: "sky" },
  { type: "shipping-policy",     label: "Shipping Policy",        color: "emerald" },
  { type: "return-policy",       label: "Return & Refund Policy", color: "rose" },
  { type: "cancellation-policy", label: "Cancellation Policy",    color: "amber" },
];

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function AdminLegalSettings() {
  const editor = useRef(null);
  const [activeType, setActiveType] = useState("terms");
  const [content, setContent]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BACKEND}/api/legal/${activeType}`)
      .then(({ data }) => setContent(data.content || ""))
      .catch(() => toast.error("Failed to load content"))
      .finally(() => setLoading(false));
  }, [activeType]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${BACKEND}/api/legal/${activeType}`,
        { content },
        { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
      );
      toast.success("Saved successfully!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const active = PAGES.find((p) => p.type === activeType);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-800">Legal Pages</h1>
        <p className="text-xs text-gray-400 mt-1">Edit all legal policy pages shown to customers</p>
      </div>

      {/* Tab switcher */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PAGES.map((p) => (
          <button
            key={p.type}
            onClick={() => setActiveType(p.type)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition border ${
              activeType === p.type
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-sky-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">{active?.label}</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
              saving ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700 text-white"
            }`}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400 text-sm">
              <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              Loading…
            </div>
          ) : (
            <JoditEditor
              ref={editor}
              value={content}
              onBlur={(val) => setContent(val)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
