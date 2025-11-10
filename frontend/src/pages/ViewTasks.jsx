import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";

const ViewTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 2;

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    taskId: null,
  });

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const isAdmin = userInfo?.role === "admin";

  const fetchTasks = async () => {
    try {
      const endpoint = isAdmin
        ? `${import.meta.env.VITE_BACKEND_URL}/api/tasks`
        : `${import.meta.env.VITE_BACKEND_URL}/api/tasks/user/${
            userInfo.email
          }`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setTasks(data);
      setFilteredTasks(data);
    } catch (err) {
      toast.error("Failed to fetch tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    let updated = [...tasks];

    if (searchTerm && isAdmin) {
      updated = updated.filter(
        (task) =>
          task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter && statusFilter !== "all") {
      updated = updated.filter((task) => task.status === statusFilter);
    }

    setFilteredTasks(updated);
    setCurrentPage(1); // reset to page 1
  }, [searchTerm, statusFilter, tasks]);

  const handleDelete = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${id}`, {
        method: "DELETE",
      });
      toast.success("Task deleted");
      fetchTasks();
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "working" ? "completed" : "working";
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success("Status updated");
      fetchTasks();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const startEdit = (task) => {
    setEditingTaskId(task._id);
    setEditForm({ title: task.title, description: task.description });
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditForm({ title: "", description: "" });
  };

  const saveEdit = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      toast.success("Task updated");
      cancelEdit();
      fetchTasks();
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  // Pagination
  const indexOfLast = currentPage * tasksPerPage;
  const indexOfFirst = indexOfLast - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Tasks</h2>

      {/* Top Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {isAdmin && (
          <input
            type="text"
            placeholder="Search by name or email"
            className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-full shadow-sm outline-0 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
        <select
          className="w-full sm:w-1/4 px-4 py-2 border border-gray-300 rounded shadow-sm bg-white outline-0"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="working">Working</option>
          <option value="completed">Completed</option>
          <option value="not completed">Not Completed</option>
        </select>
      </div>

      {currentTasks.length === 0 ? (
        <p className="text-gray-600">No tasks found.</p>
      ) : (
        <div className="space-y-6">
          {currentTasks.map((task) => (
            <div
              key={task._id}
              className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg"
            >
              {editingTaskId === task._id ? (
                <>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full mb-2 px-4 py-2 border rounded-md"
                  />
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full mb-4 px-4 py-2 border rounded-md"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(task._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {task.title}
                    </h3>
                    <p className="text-gray-600 mb-1">{task.description}</p>
                    {isAdmin && (
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Merchantiser:</span> {task.name}{" "}
                        | <span className="font-semibold">Email:</span>{" "}
                        {task.email}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Created: {new Date(task.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Updated: {new Date(task.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        Status:
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full
        ${
          task.status === "completed"
            ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
            : task.status === "not-completed"
            ? "bg-gradient-to-r from-red-400 to-red-600 text-white"
            : "bg-gradient-to-r from-yellow-300 to-yellow-500 text-gray-800"
        }`}
                        >
                          {task.status === "completed"
                            ? "Completed"
                            : task.status === "not-completed"
                            ? "Not Completed"
                            : "Working"}
                        </span>
                      </span>

                      {/* Progress bar */}
                      {task.status !== "not-completed" ? (
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              task.status === "working"
                                ? "w-2/3 bg-yellow-500"
                                : "w-full bg-green-600"
                            }`}
                          ></div>
                        </div>
                      ) : (
                        <div className="w-full h-2 bg-red-300 rounded-full flex items-center justify-center text-[10px] text-white font-bold tracking-wide bg-opacity-80">
                          Not Started
                        </div>
                      )}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleStatusToggle(task._id, task.status)
                        }
                        className="flex items-center gap-1 bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
                      >
                        <FaCheckCircle />
                        Mark as{" "}
                        {task.status === "working" ? "Completed" : "Working"}
                      </button>

                      <button
                        onClick={() => startEdit(task)}
                        className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            taskId: task._id,
                          })
                        }
                        className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>

                  {confirmModal.isOpen && confirmModal.taskId === task._id && (
                    <div
                      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                      onClick={() =>
                        setConfirmModal({ isOpen: false, taskId: null })
                      }
                    >
                      <div
                        className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h3 className="text-lg font-semibold mb-2 text-red-600">
                          Confirm Delete
                        </h3>
                        <p className="text-gray-700 mb-4">
                          Are you sure you want to delete this task?
                        </p>
                        <div className="flex justify-end gap-2">
                          <button
                            className="px-4 py-1 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
                            onClick={() =>
                              setConfirmModal({
                                isOpen: false,
                                taskId: null,
                              })
                            }
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                            onClick={() => {
                              handleDelete(confirmModal.taskId);
                              setConfirmModal({
                                isOpen: false,
                                taskId: null,
                              });
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-full ${
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-800"
                } hover:bg-indigo-500 hover:text-white`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTasks;
