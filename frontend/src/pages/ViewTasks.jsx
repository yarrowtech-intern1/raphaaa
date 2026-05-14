import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaCheckCircle, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { MdOutlineAssignment, MdFilterList } from "react-icons/md";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

/* ── status config ── */
const STATUS = {
  completed:     { label: "Completed",     pill: "bg-emerald-100 text-emerald-700 border-emerald-200", bar: "bg-emerald-500", pct: "w-full",  dot: "bg-emerald-500" },
  working:       { label: "In Progress",   pill: "bg-amber-100   text-amber-700   border-amber-200",   bar: "bg-amber-400",   pct: "w-2/3",   dot: "bg-amber-400"   },
  "not-completed":{ label: "Not Started",  pill: "bg-red-100     text-red-600     border-red-200",     bar: "bg-red-400",     pct: "w-0",     dot: "bg-red-400"     },
};
const getStatus = (s) => STATUS[s] || STATUS["not-completed"];

const ViewTasks = () => {
  const [tasks,         setTasks]         = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm,    setSearchTerm]    = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [currentPage,   setCurrentPage]   = useState(1);
  const [editingId,     setEditingId]     = useState(null);
  const [editForm,      setEditForm]      = useState({ title: "", description: "" });
  const [deleteModal,   setDeleteModal]   = useState({ open: false, id: null });

  const TASKS_PER_PAGE = 5;
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const isAdmin = userInfo?.role === "admin";

  /* ── data ── */
  const fetchTasks = async () => {
    try {
      const url = isAdmin
        ? `${import.meta.env.VITE_BACKEND_URL}/api/tasks`
        : `${import.meta.env.VITE_BACKEND_URL}/api/tasks/user/${userInfo.email}`;
      const data = await fetch(url).then((r) => r.json());
      setTasks(data);
    } catch { toast.error("Failed to fetch tasks"); }
  };

  useEffect(() => { fetchTasks(); }, []);

  useEffect(() => {
    let list = [...tasks];
    if (searchTerm && isAdmin)
      list = list.filter((t) =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (statusFilter && statusFilter !== "all")
      list = list.filter((t) => t.status === statusFilter);
    setFilteredTasks(list);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tasks]);

  const handleDelete = async (id) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${id}`, { method: "DELETE" });
    toast.success("Task deleted");
    fetchTasks();
  };

  const handleStatusToggle = async (id, current) => {
    const next = current === "working" ? "completed" : "working";
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    toast.success("Status updated");
    fetchTasks();
  };

  const saveEdit = async (id) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    toast.success("Task updated");
    setEditingId(null);
    fetchTasks();
  };

  /* ── pagination ── */
  const totalPages  = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
  const currentList = filteredTasks.slice((currentPage - 1) * TASKS_PER_PAGE, currentPage * TASKS_PER_PAGE);

  /* ── stats ── */
  const totalCount     = tasks.length;
  const workingCount   = tasks.filter((t) => t.status === "working").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <MdOutlineAssignment className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{isAdmin ? "All Tasks" : "My Tasks"}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{totalCount} task{totalCount !== 1 ? "s" : ""} total</p>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Total",     val: totalCount,     dot: "bg-gray-400"    },
            { label: "Working",   val: workingCount,   dot: "bg-amber-400"   },
            { label: "Done",      val: completedCount, dot: "bg-emerald-500" },
          ].map(({ label, val, dot }) => (
            <div key={label} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm text-xs font-semibold text-gray-700">
              <span className={`w-2 h-2 rounded-full ${dot}`} />{label}: {val}
            </div>
          ))}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="p-4 flex flex-col sm:flex-row gap-3">
        {isAdmin && (
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search by name, email or title…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>
        )}
        <div className="relative">
          <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition appearance-none cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="working">In Progress</option>
            <option value="completed">Completed</option>
            <option value="not-completed">Not Started</option>
          </select>
        </div>
      </div>

      {/* ── Task list ── */}
      {currentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <MdOutlineAssignment className="text-3xl text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No tasks found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((task) => {
            const st = getStatus(task.status);
            return (
              <div
                key={task._id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Coloured left accent */}
                <div className="flex">
                  <div className={`w-1 shrink-0 ${st.bar}`} />
                  <div className="flex-1 p-5">

                    {editingId === task._id ? (
                      /* ── Edit mode ── */
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition font-semibold"
                          placeholder="Task title"
                        />
                        <textarea
                          rows={3}
                          value={editForm.description}
                          onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none transition"
                          placeholder="Description"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(task._id)}
                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── View mode ── */
                      <div>
                        {/* Top row */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-base font-bold text-gray-900">{task.title}</h3>
                              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${st.pill}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">{task.description}</p>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-3">
                          {isAdmin && (
                            <span className="flex items-center gap-1">
                              <span className="font-semibold text-gray-600">{task.name}</span>
                              <span>·</span>
                              <span>{task.email}</span>
                            </span>
                          )}
                          <span>Created {new Date(task.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
                            <span>Progress</span>
                            <span className="font-semibold">
                              {task.status === "completed" ? "100%" : task.status === "working" ? "66%" : "0%"}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${st.bar} ${st.pct}`} />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleStatusToggle(task._id, task.status)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition"
                          >
                            <FaCheckCircle className="text-xs" />
                            {task.status === "working" ? "Mark Complete" : "Mark Working"}
                          </button>
                          <button
                            onClick={() => { setEditingId(task._id); setEditForm({ title: task.title, description: task.description }); }}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition"
                          >
                            <FaEdit className="text-xs" /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, id: task._id })}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition"
                          >
                            <FaTrash className="text-xs" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <HiChevronLeft />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <HiChevronRight />
          </button>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteModal.open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeleteModal({ open: false, id: null })}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-red-500 text-lg" />
            </div>
            <h3 className="text-base font-bold text-gray-800 text-center mb-1">Delete Task?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, id: null })}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { handleDelete(deleteModal.id); setDeleteModal({ open: false, id: null }); }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTasks;
