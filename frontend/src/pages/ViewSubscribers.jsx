import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { FaTrashAlt } from "react-icons/fa";

const ViewSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/subscribers`
        );
        setSubscribers(res.data);
      } catch (error) {
        toast.error("Failed to load subscribers");
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/subscribers/${id}`);
      setSubscribers((prev) => prev.filter((sub) => sub._id !== id));
      toast.success("Subscriber deleted");
    } catch (error) {
      toast.error("Failed to delete subscriber");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const filtered = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayed = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Newsletter Subscribers</h2>

      <div className="flex justify-between items-center gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="bg-white w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <span className="inline-block px-3 py-1 bg-sky-600 text-white rounded-full text-sm font-semibold shadow-sm">
          Total Subscribers: {subscribers.length}
        </span>
      </div>


      {loading ? (
        <p className="text-center text-gray-500">Loading subscribers...</p>
      ) : displayed.length === 0 ? (
        <p className="text-center text-gray-400">No subscribers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-3">Email</th>
                {/* <th className="px-4 py-3">IP Address</th> */}
                <th className="px-4 py-3">Subscribed On</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 text-sm">
              {displayed.map((sub) => (
                <tr key={sub._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{sub.email}</td>
                  {/* <td className="px-4 py-2">{sub.ipAddress || "N/A"}</td> */}
                  <td className="px-4 py-2">
                    {new Date(sub.subscribedAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setConfirmDeleteId(sub._id)}
                      className="text-red-600 hover:text-red-800 text-sm p-2 rounded-full hover:bg-red-100"
                      title="Delete"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${currentPage === i + 1
                  ? "bg-sky-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Are you sure?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete the subscriber.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
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

export default ViewSubscribers;
