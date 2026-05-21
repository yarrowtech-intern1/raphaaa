import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FaTruck, FaPlus, FaTrash } from "react-icons/fa";

const BACKEND = import.meta.env.VITE_BACKEND_URL;
const token = () => localStorage.getItem("userToken");

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
      {label}
    </label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
  </div>
);

const numInput = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 bg-gray-50 focus:bg-white transition";

export default function AdminShippingSettings() {
  const [cfg, setCfg]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    axios.get(`${BACKEND}/api/shipping-config`)
      .then(({ data }) => setCfg(data))
      .catch(() => toast.error("Failed to load shipping config"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(
        `${BACKEND}/api/shipping-config`,
        cfg,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setCfg(data.config);
      toast.success("Shipping settings saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const setField = (key, val) => setCfg((p) => ({ ...p, [key]: val }));

  const updateZone = (idx, key, val) => {
    const zones = [...cfg.zoneRates];
    zones[idx] = { ...zones[idx], [key]: val };
    setField("zoneRates", zones);
  };

  const updateZonePins = (idx, raw) => {
    // comma-separated prefixes → array of 2-digit strings
    const pins = raw.split(",").map((s) => s.trim()).filter((s) => /^\d{2}$/.test(s));
    updateZone(idx, "pinPrefixes", pins);
    updateZone(idx, "_pinsRaw", raw); // keep raw for input
  };

  const addZone = () => {
    setField("zoneRates", [
      ...(cfg.zoneRates || []),
      { zone: `Z${Date.now()}`, label: "New Zone", extraCharge: 0, pinPrefixes: [] },
    ]);
  };

  const removeZone = (idx) => {
    setField("zoneRates", cfg.zoneRates.filter((_, i) => i !== idx));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-gray-400 text-sm">
      <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      Loading…
    </div>
  );

  if (!cfg) return <p className="p-8 text-red-500">Failed to load config.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
            <FaTruck className="text-sky-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800">Shipping & Delivery Settings</h1>
            <p className="text-xs text-gray-400 mt-0.5">All delivery charges are calculated from these settings at checkout</p>
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2 ${
            saving ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700 text-white"
          }`}
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
          ) : "Save Settings"}
        </button>
      </div>

      {/* ── Section 1: Base Rules ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Base Shipping Rules</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

          <Field
            label="Base Shipping Fee (₹)"
            hint="Charged when cart is below the free-shipping threshold"
          >
            <input
              type="number" min="0" className={numInput}
              value={cfg.baseShippingFee ?? ""}
              onChange={(e) => setField("baseShippingFee", Number(e.target.value))}
            />
          </Field>

          <Field
            label="Free Shipping Threshold (₹)"
            hint="Orders at or above this amount get free shipping"
          >
            <input
              type="number" min="0" className={numInput}
              value={cfg.freeShippingThreshold ?? ""}
              onChange={(e) => setField("freeShippingThreshold", Number(e.target.value))}
            />
          </Field>

          <Field
            label="COD Extra Charge (₹)"
            hint="Additional fee for Cash on Delivery orders (set 0 to disable)"
          >
            <input
              type="number" min="0" className={numInput}
              value={cfg.codExtraCharge ?? ""}
              onChange={(e) => setField("codExtraCharge", Number(e.target.value))}
            />
          </Field>

          <Field
            label="First Order Free Shipping"
            hint="Every new customer's first order ships free regardless of cart value"
          >
            <label className="flex items-center gap-3 cursor-pointer mt-1">
              <div
                onClick={() => setField("firstOrderFreeShipping", !cfg.firstOrderFreeShipping)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  cfg.firstOrderFreeShipping ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                  cfg.firstOrderFreeShipping ? "left-7" : "left-1"
                }`} />
              </div>
              <span className={`text-sm font-semibold ${cfg.firstOrderFreeShipping ? "text-emerald-600" : "text-gray-400"}`}>
                {cfg.firstOrderFreeShipping ? "Enabled" : "Disabled"}
              </span>
            </label>
          </Field>
        </div>
      </div>

      {/* ── Section 2: How it works ── */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-3">How charges are calculated at checkout</h3>
        <ol className="space-y-2 text-sm text-sky-800">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 shrink-0 bg-sky-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5">1</span>
            <span>If cart total ≥ <strong>₹{cfg.freeShippingThreshold}</strong> → <strong>Free shipping</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 shrink-0 bg-sky-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5">2</span>
            <span>Else if customer's <strong>first order</strong> and toggle is ON → <strong>Free shipping</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 shrink-0 bg-sky-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5">3</span>
            <span>Otherwise → <strong>₹{cfg.baseShippingFee} base fee</strong> + zone surcharge (based on delivery pincode)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 shrink-0 bg-sky-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5">4</span>
            <span>COD orders add <strong>₹{cfg.codExtraCharge}</strong> extra</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 shrink-0 bg-sky-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5">5</span>
            <span>Individual products can override with <strong>Free Shipping</strong> or <strong>Extra Charge</strong> (set in product settings)</span>
          </li>
        </ol>
      </div>

      {/* ── Section 3: Zone Rates ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Zone-Based Surcharges</h2>
            <p className="text-xs text-gray-400 mt-0.5">Added on top of base fee — based on delivery pincode distance from your warehouse</p>
          </div>
          <button
            type="button"
            onClick={addZone}
            className="flex items-center gap-1.5 text-xs font-bold text-sky-600 border border-sky-200 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition"
          >
            <FaPlus className="text-[10px]" /> Add Zone
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {(cfg.zoneRates || []).map((zone, idx) => (
            <div key={idx} className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
              {/* Zone label */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Zone Name</label>
                <input
                  type="text"
                  value={zone.label}
                  onChange={(e) => updateZone(idx, "label", e.target.value)}
                  placeholder="e.g. Local, Remote"
                  className={numInput}
                />
              </div>

              {/* Extra charge */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Extra Charge (₹)</label>
                <input
                  type="number" min="0"
                  value={zone.extraCharge ?? 0}
                  onChange={(e) => updateZone(idx, "extraCharge", Number(e.target.value))}
                  className={numInput}
                />
              </div>

              {/* Pincode prefixes */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Pincode Prefixes (first 2 digits, comma-separated)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={zone._pinsRaw ?? (zone.pinPrefixes || []).join(", ")}
                    onChange={(e) => updateZonePins(idx, e.target.value)}
                    placeholder="e.g. 40, 41, 42"
                    className={`${numInput} flex-1`}
                  />
                  {(cfg.zoneRates || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeZone(idx)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition shrink-0"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Active prefixes: {(zone.pinPrefixes || []).length > 0
                    ? (zone.pinPrefixes || []).join(", ")
                    : <span className="italic">none set — won't match any pincode</span>}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700">
            <strong>How to find pincode prefixes:</strong> The first 2 digits of a 6-digit pincode identify the postal division.
            Example: Mumbai pincodes start with 40/41/42, Bangalore with 56/57/58, Delhi with 11.
            Assign your warehouse state's prefixes to the "Local" zone (₹0 surcharge).
            Neighboring states get "Regional", rest get "National", difficult areas get "Remote".
          </div>
        </div>
      </div>

      {/* Save button bottom */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition shadow-sm ${
            saving ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700 text-white"
          }`}
        >
          {saving ? "Saving…" : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}
