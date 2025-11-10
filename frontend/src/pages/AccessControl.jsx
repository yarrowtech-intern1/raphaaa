import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const ROLES = ["customer", "admin", "merchantise", "delivery_boy", "marketing"];

const AccessControl = () => {
  const [form, setForm] = useState({ email: "", name: "", role: "merchantise" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.role) return toast.error("Email and role are required");

    try {
      setLoading(true);
      const { data } = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/role`,
        { email: form.email, role: form.role, name: form.name || undefined },
        { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
      );
      toast.success(data?.message || "Role updated");
      setForm({ email: "", name: "", role: "merchantise" });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update role";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">Access Control</h1>
      <p className="text-sm text-gray-300 mb-6">
        Assign roles to users by email. (Optional name check ensures you’re editing the right user.)
      </p>

      <form onSubmit={onSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="block text-sm mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="user@example.com"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Name (optional)</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Exact full name (optional)"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Role *</label>
          <select
            name="role"
            value={form.role}
            onChange={onChange}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 outline-none"
            required
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-2 rounded"
        >
          {loading ? "Updating..." : "Update Role"}
        </button>
      </form>
    </div>
  );
};

export default AccessControl;
