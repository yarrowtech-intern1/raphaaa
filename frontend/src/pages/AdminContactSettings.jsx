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