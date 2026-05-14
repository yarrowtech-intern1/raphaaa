import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { MdOutlineAddTask } from "react-icons/md";
import { FaUser, FaEnvelope, FaTag } from "react-icons/fa";
import { HiDocumentText } from "react-icons/hi2";

const CreateTask = () => {
  const [formData, setFormData] = useState({ name: "", email: "", title: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || { name: "Unknown", email: "unknown@example.com" };
    setFormData((p) => ({ ...p, name: userInfo.name, email: userInfo.email }));
  }, []);

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, title, description } = formData;
    if (!title || !description) return toast.error("Title and description are required.");

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, title, description }),
      });
      if (!res.ok) throw new Error();
      toast.success("Task created successfully!");
      setFormData((p) => ({ ...p, title: "", description: "" }));
    } catch {
      toast.error("Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <MdOutlineAddTask className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Create New Task</h1>
            <p className="text-xs text-gray-400 mt-0.5">Assign a task to your team</p>
          </div>
        </div>

        {/* ── Assigned-by chips ── */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
              <FaUser className="text-indigo-500 text-xs" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Assigned by</p>
              <p className="text-sm font-semibold text-gray-800">{formData.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
              <FaEnvelope className="text-sky-500 text-xs" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Email</p>
              <p className="text-sm font-semibold text-gray-800">{formData.email}</p>
            </div>
          </div>
        </div>

        {/* ── Form card ── */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-700">Task Details</h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                <FaTag className="text-indigo-400 text-[10px]" /> Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Update product listings for Q2 sale"
                required
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:bg-white transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                <HiDocumentText className="text-indigo-400 text-sm" /> Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the task in detail — what needs to be done, any deadlines, or special instructions..."
                required
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:bg-white resize-none transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                ${loading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md"
                }`}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating…</>
              ) : (
                <><MdOutlineAddTask className="text-base" /> Create Task</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
