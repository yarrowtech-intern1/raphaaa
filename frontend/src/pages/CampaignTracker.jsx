// frontend/src/pages/marketing/CampaignTracker.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";

const CampaignTracker = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [form, setForm] = useState({
        name: "",
        platform: "Google",
        utmLink: "",
        startDate: "",
        endDate: "",
        budget: "",
        status: "Draft"
    });
    const [isPublished, setIsPublished] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("userToken");
    console.log(token);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                }
            });
            setCampaigns(Array.isArray(data.data) ? data.data : []);
        } catch {
            toast.error("Failed to load campaigns");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/${editingId}`, { ...form }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                toast.success("Campaign updated");
            } else {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns`, { ...form }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                toast.success("Campaign added");
            }
            resetForm();
            fetchCampaigns();
        } catch {
            toast.error("Failed to save campaign");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (campaign) => {
        setForm({
            name: campaign.name,
            platform: campaign.platform,
            utmLink: campaign.utmLink,
            startDate: campaign.startDate?.split("T")[0] || "",
            endDate: campaign.endDate?.split("T")[0] || "",
            budget: campaign.budget,
            status: campaign.status
        });
        setEditingId(campaign._id);
        setIsPublished(campaign.status === "Active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Campaign deleted");
            fetchCampaigns();
        } catch {
            toast.error("Failed to delete campaign");
        }
    };

    const resetForm = () => {
        setForm({
            name: "",
            platform: "Google",
            utmLink: "",
            startDate: "",
            endDate: "",
            budget: "",
            status: "Draft"
        });
        setEditingId(null);
        setIsPublished(false);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 mt-10">
            {/* <Toaster richColors position="top-center" /> */}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        {editingId ? "Edit Campaign" : "Create Campaign"}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    {/* Campaign Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Campaign Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-xl bg-gray-50 border border-gray-300 px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-400 outline-none"
                            placeholder="e.g., Winter Sale 2025"
                            required
                        />
                    </div>

                    {/* Platform & Publish Toggle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Platform</label>
                            <select
                                value={form.platform}
                                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                                className="w-full rounded-xl bg-gray-50 border border-gray-300 px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-sky-400 outline-none"
                            >
                                <option>Google</option>
                                <option>Instagram</option>
                                <option>Facebook</option>
                            </select>
                        </div>

                        <div className="flex items-end md:items-center">
                            <label className="inline-flex items-center cursor-pointer select-none">
                                <span className="mr-3 text-sm">Draft</span>
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isPublished}
                                    onChange={(e) => {
                                        setIsPublished(e.target.checked);
                                        setForm({ ...form, status: e.target.checked ? "Active" : "Draft" });
                                    }}
                                />
                                <span className="relative inline-block w-14 h-8 rounded-full bg-gray-300 peer-checked:bg-green-500 transition-colors">
                                    <span className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 peer-checked:translate-x-6" />
                                </span>
                                <span className="ml-3 text-sm font-medium text-gray-800">
                                    Publish now
                                </span>
                            </label>

                        </div>
                    </div>

                    {/* UTM Link */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">UTM Link</label>
                        <input
                            type="text"
                            value={form.utmLink}
                            onChange={(e) => setForm({ ...form, utmLink: e.target.value })}
                            placeholder="https://yourwebsite.com/?utm_source=..."
                            className="w-full rounded-xl bg-gray-50 border border-gray-300 px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-sky-400 outline-none"
                        />
                    </div>

                    {/* Dates & Budget */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full rounded-xl bg-gray-50 border border-gray-300 px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-sky-400 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full rounded-xl bg-gray-50 border border-gray-300 px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-sky-400 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Budget</label>
                            <input
                                type="number"
                                value={form.budget}
                                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                                placeholder="5000"
                                className="w-full rounded-xl bg-gray-50 border border-gray-300 px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-sky-400 outline-none"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3">
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-xl bg-gray-300 px-6 py-3 text-gray-800 font-semibold hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-3 text-white font-semibold shadow-lg hover:opacity-95 disabled:opacity-60 transition"
                        >
                            {loading ? "Saving..." : editingId ? "Update Campaign" : "Save Campaign"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Campaign Table */}
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-sky-500 text-white">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Platform</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Budget</th>
                            <th className="p-4">Clicks</th>
                            <th className="p-4">Impr.</th>
                            <th className="p-4">CTR %</th>
                            <th className="p-4">Conv.</th>
                            <th className="p-4">CVR %</th>
                            <th className="p-4">Track URL</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.length > 0 ? (
                            campaigns.map((c) => (
                                <tr
                                    key={c._id}
                                    className="border-b hover:bg-gray-50 transition"
                                >
                                    <td className="p-4">{c.clicks ?? 0}</td>
                                    <td className="p-4">{c.impressions ?? 0}</td>
                                    <td className="p-4">{c.ctr?.toFixed?.(2) ?? ((c.impressions ? (c.clicks / c.impressions * 100) : 0).toFixed(2))}</td>
                                    <td className="p-4">{c.conversions ?? 0}</td>
                                    <td className="p-4">{c.conversionRate?.toFixed?.(2) ?? ((c.clicks ? (c.conversions / c.clicks * 100) : 0).toFixed(2))}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                readOnly
                                                value={`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/r/${c._id}`}
                                                className="w-56 rounded border px-2 py-1 text-xs"
                                            />
                                            <button
                                                onClick={() => navigator.clipboard.writeText(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/r/${c._id}`)}
                                                className="text-xs bg-gray-800 text-white px-2 py-1 rounded"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 flex justify-center gap-3">
                                        <button
                                            onClick={() => handleEdit(c)}
                                            className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c._id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">
                                    No campaigns found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CampaignTracker;
