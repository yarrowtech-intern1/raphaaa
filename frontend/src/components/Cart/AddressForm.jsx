import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaHome, FaBriefcase, FaMapMarkerAlt } from "react-icons/fa";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { HiCheckCircle, HiTrash } from "react-icons/hi2";
import axios from "axios";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

/* ── Indian states for Shiprocket ── */
const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const EMPTY_ADDRESS = {
  firstName: "", lastName: "", phone: "",
  address: "", landmark: "",
  city: "", state: "", postalCode: "",
  country: "India", addressType: "Home",
};

const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition placeholder-gray-400";
const labelCls = "block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5";

const AddressForm = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate  = useNavigate();
  const location = useLocation();
  const authHeaders = () => {
    const token = localStorage.getItem("userToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const [addresses, setAddresses]   = useState([]);
  const [form,      setForm]        = useState(EMPTY_ADDRESS);
  const [locating,  setLocating]    = useState(false);
  const [saving,    setSaving]      = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (!user) {
      const redirect = encodeURIComponent(location.pathname || "/checkout");
      navigate(`/login?redirect=${redirect}`);
    }
  }, [user, navigate, location.pathname]);

  /* ── fetch saved addresses ── */
  useEffect(() => {
    if (!user) return;
    if (!localStorage.getItem("userToken")) return;
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/addresses`,
      { headers: authHeaders() })
      .then(({ data }) => setAddresses(data))
      .catch(console.error);
  }, [user]);

  const upd = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  /* ── Auto-fill city/state from pincode (India only) ── */
  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    upd("postalCode", val);
    if (val.length === 6 && form.country === "India") {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const [result] = await res.json();
        if (result.Status === "Success" && result.PostOffice?.length > 0) {
          const po = result.PostOffice[0];
          setForm((p) => ({
            ...p, postalCode: val,
            city: po.District || p.city,
            state: po.State   || p.state,
          }));
          toast.success("City & State auto-filled from pincode!");
        }
      } catch { /* silent */ }
      finally { setPincodeLoading(false); }
    }
  };

  /* ── GPS auto-fill ── */
  const handleGPS = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const a    = data.address || {};
          setForm((p) => ({
            ...p,
            address:    a.road || a.neighbourhood || a.suburb || a.display_name || p.address,
            city:       a.city || a.town || a.village || p.city,
            state:      a.state || p.state,
            postalCode: a.postcode || p.postalCode,
            country:    a.country || p.country,
          }));
          toast.success("Address auto-filled from your location!");
        } catch { toast.error("Could not fetch address from location."); }
        finally { setLocating(false); }
      },
      (err) => {
        toast.error(err.code === 1 ? "Location permission denied." : "Could not get location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phone.length < 10) return toast.error("Enter a valid 10-digit phone number.");
    setSaving(true);
    try {
      let data;
      if (editingIndex !== null) {
        const putRes = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/addresses/${editingIndex}`,
          form,
          { headers: authHeaders() }
        );
        data = putRes.data;
      } else {
        const postRes = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/addresses`,
          form,
          { headers: authHeaders() }
        );
        data = postRes.data;
      }
      setAddresses(data.addresses);
      window.dispatchEvent(new CustomEvent("address:list-updated", { detail: data.addresses || data }));
      toast.success(editingIndex !== null ? "Address updated!" : "Address saved!");
      setForm(EMPTY_ADDRESS);
      setEditingIndex(null);
    } catch { toast.error("Failed to save address."); }
    finally { setSaving(false); }
  };

  /* ── Delete ── */
  const handleDelete = async (index) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/addresses/${index}`,
        { headers: authHeaders() }
      );
      setAddresses(data.addresses);
      window.dispatchEvent(new CustomEvent("address:list-updated", { detail: data.addresses || data }));
      toast.success("Address removed.");
    } catch { toast.error("Failed to delete."); }
  };

  const handleEdit = (index) => {
    const addr = addresses[index];
    if (!addr) return;
    setForm({
      firstName: addr.firstName || "",
      lastName: addr.lastName || "",
      phone: String(addr.phone || ""),
      address: addr.address || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
      addressType: addr.addressType || "Home",
    });
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const typeIcon = { Home: <FaHome />, Work: <FaBriefcase />, Other: <FaMapMarkerAlt /> };

  return (
    <div className="space-y-6">
      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Address type toggle */}
        <div>
          <label className={labelCls}>Address Type</label>
          <div className="flex gap-2">
            {["Home", "Work", "Other"].map((t) => (
              <button key={t} type="button"
                onClick={() => upd("addressType", t)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all
                  ${form.addressType === t
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                {typeIcon[t]} {t}
              </button>
            ))}
          </div>
        </div>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>First Name *</label>
            <input type="text" value={form.firstName} required
              onChange={(e) => upd("firstName", e.target.value)}
              placeholder="Raktim" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Last Name</label>
            <input type="text" value={form.lastName}
              onChange={(e) => upd("lastName", e.target.value)}
              placeholder="Maity" className={inputCls} />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className={labelCls}>Mobile Number *</label>
          <div className="flex">
            <span className="flex items-center px-3 border border-r-0 border-gray-200 bg-gray-100 rounded-l-xl text-sm font-medium text-gray-600 shrink-0">
              🇮🇳 +91
            </span>
            <input type="tel" value={form.phone} required maxLength={10}
              onChange={(e) => upd("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              className={`${inputCls} rounded-l-none border-l-0 focus:border-l-2`} />
          </div>
          {form.phone && form.phone.length < 10 && (
            <p className="text-xs text-red-500 mt-1">Enter a valid 10-digit number</p>
          )}
        </div>

        {/* Street address + landmark */}
        <div>
          <label className={labelCls}>Street Address *</label>
          <input type="text" value={form.address} required
            onChange={(e) => upd("address", e.target.value)}
            placeholder="House / Flat no., Street, Area"
            className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Landmark <span className="text-gray-400 font-normal normal-case tracking-normal">(optional)</span></label>
          <input type="text" value={form.landmark}
            onChange={(e) => upd("landmark", e.target.value)}
            placeholder="Near park, opposite school…"
            className={inputCls} />
        </div>

        {/* Pincode + City */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>PIN Code *</label>
            <div className="relative">
              <input type="text" value={form.postalCode} required maxLength={6}
                onChange={handlePincodeChange}
                placeholder="6-digit PIN"
                className={inputCls} />
              {pincodeLoading && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
          <div>
            <label className={labelCls}>City *</label>
            <input type="text" value={form.city} required
              onChange={(e) => upd("city", e.target.value)}
              placeholder="Auto-filled from PIN"
              className={inputCls} />
          </div>
        </div>

        {/* State + Country */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>State * <span className="text-sky-500 font-medium normal-case tracking-normal text-[10px]">(required for delivery)</span></label>
            {form.country === "India" ? (
              <select value={form.state} required
                onChange={(e) => upd("state", e.target.value)}
                className={inputCls}
              >
                <option value="">Select State</option>
                {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input type="text" value={form.state} required
                onChange={(e) => upd("state", e.target.value)}
                placeholder="State / Province" className={inputCls} />
            )}
          </div>
          <div>
            <label className={labelCls}>Country *</label>
            <select value={form.country} required
              onChange={(e) => { upd("country", e.target.value); upd("state", ""); }}
              className={inputCls}
            >
              {["India","United States","United Kingdom","Canada","Australia",
                "Germany","France","Japan","Singapore","UAE"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* GPS button */}
        <button type="button" onClick={handleGPS} disabled={locating}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-sm font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {locating ? (
            <><span className="w-4 h-4 border-2 border-sky-400/40 border-t-sky-600 rounded-full animate-spin" /> Detecting location…</>
          ) : (
            <><FaLocationCrosshairs className="text-base" /> Use My Current Location</>
          )}
        </button>

        {/* Save button */}
        <button type="submit" disabled={saving}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
            ${saving
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-linear-to-r from-sky-600 to-blue-700 text-white hover:opacity-90 shadow-sm shadow-sky-200"
            }`}
        >
          {saving
            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
            : <><HiCheckCircle className="text-lg" /> {editingIndex !== null ? "Update Address" : "Save Address"}</>
          }
        </button>
      </form>

      {/* ── Saved addresses ── */}
      {addresses.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Saved Addresses</p>
          <div className="space-y-3">
            {addresses.map((addr, idx) => (
              <div key={idx}
                className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center text-sm shrink-0 mt-0.5">
                  {typeIcon[addr.addressType] || <FaHome />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-800">
                      {[addr.firstName, addr.lastName].filter(Boolean).join(" ") || "—"}
                    </p>
                    {addr.addressType && (
                      <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full">{addr.addressType}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {addr.address}{addr.landmark ? `, ${addr.landmark}` : ""}<br />
                    {addr.city}{addr.state ? `, ${addr.state}` : ""} — {addr.postalCode}<br />
                    {addr.country}
                  </p>
                  {addr.phone && <p className="text-xs text-gray-500 mt-0.5">📞 +91 {addr.phone}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(idx)}
                    className="px-2 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-sky-600 hover:bg-sky-50 hover:border-sky-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition"
                  >
                    <HiTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressForm;
