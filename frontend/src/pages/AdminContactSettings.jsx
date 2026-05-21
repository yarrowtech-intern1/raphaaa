import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { FaFacebook, FaInstagram, FaPhone, FaEnvelope } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";

const AdminContactSettings = () => {
  const [form, setForm] = useState({
    showFacebook: false,
    facebookUrl: "",
    showInstagram: false,
    instagramUrl: "",
    showTwitter: false,
    twitterUrl: "",
    showGmail: false,
    gmail: "",
    showPhone: false,
    phone: "",
    showTopText: false,
    topText: "",
    // Legal & business
    businessName:          "Raphaaa by Citimart",
    registeredAddress:     "",
    gstin:                 "",
    cin:                   "",
    grievanceOfficerName:  "",
    grievanceOfficerEmail: "",
    grievanceResponseTime: "48 hours",
    // WhatsApp
    whatsappNumber:        "",
    // Exit-intent popup
    exitIntentEnabled:  true,
    exitIntentCoupon:   "WELCOME10",
    exitIntentDiscount: "10%",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/settings/contact`
        );
        setForm((prev) => ({ ...prev, ...data }));
      } catch (error) {
        toast.error("Failed to load contact settings");
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/settings/contact`,
        form
      );
      toast.success("Contact settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const ToggleCheckbox = ({ name, checked, onChange, children }) => (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
        {children}
      </span>
      <div className="relative">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-sky-500 transition-all duration-300" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5 shadow-md" />
      </div>
    </label>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-white shadow-2xl rounded-2xl mt-12 border border-gray-200">
      <h2 className="text-3xl font-bold mb-8 text-sky-700">Contact Settings</h2>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-10">
        {/* === SOCIAL SECTION === */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Social Links
          </h3>

          {/* Facebook */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <FaFacebook className="text-blue-600" /> Show Facebook
              </span>
              <ToggleCheckbox
                name="showFacebook"
                checked={form.showFacebook}
                onChange={handleChange}
              />
            </div>

            <input
              type="url"
              name="facebookUrl"
              placeholder="https://facebook.com/yourpage"
              value={form.facebookUrl}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <FaInstagram className="text-pink-500" /> Show Instagram
              </span>
              <ToggleCheckbox
                name="showInstagram"
                checked={form.showInstagram}
                onChange={handleChange}
              />
            </div>

            <input
              type="url"
              name="instagramUrl"
              placeholder="https://instagram.com/yourhandle"
              value={form.instagramUrl}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
            />
          </div>
        </div>

        {/* === CONTACT SECTION === */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Contact Info
          </h3>

          {/* Gmail */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <FaEnvelope className="text-red-500" /> Show Gmail
              </span>
              <ToggleCheckbox
                name="showGmail"
                checked={form.showGmail}
                onChange={handleChange}
              />
            </div>

            <input
              type="email"
              name="gmail"
              placeholder="yourmail@gmail.com"
              value={form.gmail}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <FaPhone className="text-green-600" /> Show Phone
              </span>
              <ToggleCheckbox
                name="showPhone"
                checked={form.showPhone}
                onChange={handleChange}
              />
            </div>

            <div className="flex rounded-lg shadow-sm border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
              <span className="bg-gray-100 text-gray-700 text-sm flex items-center px-3 select-none">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                placeholder="9876543210"
                value={form.phone.replace("+91", "")}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "phone",
                      value:
                        "+91" +
                        e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                    },
                  })
                }
                className="w-full p-3 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* === TOP BAR TEXT === */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
              <FaMessage className="text-sky-600" /> Show Top-Bar Text
            </span>
            <ToggleCheckbox
              name="showTopText"
              checked={form.showTopText}
              onChange={handleChange}
            />
          </div>
          <input
            name="topText"
            type="text"
            placeholder="e.g. Free shipping on orders over ₹999"
            value={form.topText}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
        </div>

        {/* ── Legal & Business Info ── */}
        <div className="md:col-span-2 border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">
            🏛️ Legal &amp; Business Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "businessName",         label: "Business / Brand Name",          placeholder: "Raphaaa by Citimart" },
              { name: "gstin",                label: "GSTIN",                           placeholder: "27XXXXX (15-digit GST number)" },
              { name: "cin",                  label: "CIN (optional)",                  placeholder: "Company Identification Number" },
              { name: "registeredAddress",    label: "Registered Address",              placeholder: "Full registered address" },
              { name: "grievanceOfficerName", label: "Consumer Grievance Officer Name", placeholder: "Full name" },
              { name: "grievanceOfficerEmail",label: "Grievance Officer Email",         placeholder: "grievance@raphaaa.com" },
              { name: "grievanceResponseTime",label: "Response Time",                   placeholder: "e.g. 48 hours" },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
                <input
                  name={name}
                  type="text"
                  placeholder={placeholder}
                  value={form[name] || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── WhatsApp Support ── */}
        <div className="md:col-span-2 border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">
            💬 WhatsApp Support Widget
          </h2>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              WhatsApp Number <span className="font-normal normal-case text-gray-400">(with country code, digits only)</span>
            </label>
            <input
              name="whatsappNumber"
              type="text"
              placeholder="e.g. 919876543210 (no + or spaces)"
              value={form.whatsappNumber || ""}
              onChange={handleChange}
              className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty to hide the WhatsApp chat widget on the site.</p>
          </div>
        </div>

        {/* ── Exit-Intent Popup ── */}
        <div className="md:col-span-2 border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">
            🎯 Exit-Intent Popup
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3 flex items-center gap-3 mb-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm((p) => ({ ...p, exitIntentEnabled: !p.exitIntentEnabled }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.exitIntentEnabled ? "bg-emerald-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.exitIntentEnabled ? "left-6" : "left-1"}`} />
                </div>
                <span className={`text-sm font-semibold ${form.exitIntentEnabled ? "text-emerald-600" : "text-gray-400"}`}>
                  {form.exitIntentEnabled ? "Enabled" : "Disabled"}
                </span>
              </label>
              <p className="text-xs text-gray-400">Shows a coupon popup when visitor tries to leave the site</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Coupon Code</label>
              <input
                name="exitIntentCoupon"
                type="text"
                placeholder="e.g. STAY10"
                value={form.exitIntentCoupon || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Discount Text</label>
              <input
                name="exitIntentDiscount"
                type="text"
                placeholder="e.g. 10% or ₹100"
                value={form.exitIntentDiscount || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="md:col-span-2 pt-8 text-right">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-sky-500 text-white px-6 py-3 text-sm font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-sky-600 transition duration-200"
          >
            {loading ? "Saving..." : "Update Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminContactSettings;