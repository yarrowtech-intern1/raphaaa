import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "../../redux/slices/adminSlice";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RiFileExcel2Line } from "react-icons/ri";
import axios from "axios";

const UserManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { users, loading, error } = useSelector((state) => state.admin);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewedUser, setViewedUser] = useState(null);
  const usersPerPage = 5;

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "merchantise") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "merchantise")) {
      dispatch(fetchUsers());
    }
  }, [dispatch, user]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [walletCreditModal, setWalletCreditModal] = useState(null); // { userId, userName }
  const [walletCreditAmount, setWalletCreditAmount] = useState("");
  const [walletCreditNote, setWalletCreditNote] = useState("");
  const [walletCreditLoading, setWalletCreditLoading] = useState(false);

  const handleAdminCredit = async () => {
    const amt = Number(walletCreditAmount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setWalletCreditLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/wallet/admin-credit`,
        { userId: walletCreditModal.userId, amount: amt, note: walletCreditNote || "Admin credit" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`₹${amt.toLocaleString("en-IN")} credited to ${walletCreditModal.userName}'s wallet`);
      setWalletCreditModal(null);
      setWalletCreditAmount("");
      setWalletCreditNote("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to credit wallet");
    } finally {
      setWalletCreditLoading(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    message: '',
    onConfirm: null,
  });

  const openConfirm = (message, onConfirm) => {
    setConfirmModal({ visible: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal({ visible: false, message: '', onConfirm: null });
  };

  const handleRoleChange = (userId, newRole) => {
    const userToUpdate = users.find((u) => u._id === userId);
    if (userToUpdate && userToUpdate.role !== newRole) {
      openConfirm(`Change ${userToUpdate.name}'s role to ${newRole}?`, () => {
        dispatch(
          updateUser({
            id: userId,
            name: userToUpdate.name,
            email: userToUpdate.email,
            role: newRole,
          })
        );
        toast.success(`${userToUpdate.name}'s role updated to ${newRole}`, {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        });
      });
    }
  };

  const handleDeleteUser = (userId) => {
    openConfirm("Are you sure you want to delete this user?", () => {
      return dispatch(deleteUser(userId)).then(() => {
        toast.success("User deleted successfully", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        });
      });
    });
  };


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addUser(formData));
    setFormData({ name: "", email: "", password: "", role: "customer" });
  };

  // const handleRoleChange = (userId, newRole) => {
  //   const userToUpdate = users.find((u) => u._id === userId);
  //   if (userToUpdate && userToUpdate.role !== newRole) {
  //     if (
  //       window.confirm(
  //         `Are you sure you want to change ${userToUpdate.name}'s role to ${newRole}?`
  //       )
  //     ) {
  //       dispatch(
  //         updateUser({
  //           id: userId,
  //           name: userToUpdate.name,
  //           email: userToUpdate.email,
  //           role: newRole,
  //         })
  //       );
  //       toast.success(`${userToUpdate.name}'s role updated to ${newRole}`, {
  //         position: toast.POSITION.TOP_RIGHT,
  //         autoClose: 2000,
  //       });
  //     }
  //   }
  // };

  // const handleDeleteUser = (userId) => {
  //   if (window.confirm("Are you sure you want to delete this user?")) {
  //     dispatch(deleteUser(userId));
  //   }
  // };

  const exportToExcel = () => {
    const data = filteredUsers.map(({ name, email, role, createdAt }) => ({
      Name: name,
      Email: email,
      Role: role,
      CreatedAt: new Date(createdAt).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "Users.xlsx");
  };

  const filteredUsers = users
    .filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((u) => {
      if (user?.role === "admin") return true;
      if (user?.role === "merchantise") {
        return (
          // u.role === "customer" ||
          u.role === "delivery_boy"
          // u.role === "merchantise"
        );
      }
      return false;
    })
    .filter((u) => (roleFilter ? u.role === roleFilter : true));

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4"> User Management</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* Add new user form */}
      {/* ... unchanged add user form ... */}
      <div className="p-6 bg-white shadow-md rounded-lg mb-6">
        <h3 className="text-lg font-bold mb-6">Add New User</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 mb-1 font-medium"
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 mb-1 font-medium"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 mb-1 font-medium"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-gray-700 mb-1 font-medium"
              >
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {user?.role === "admin" && (
                  <>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="merchantise">Merchantise</option>
                    <option value="marketing">Marketing</option>
                    <option value="delivery_boy">Delivery Boy</option>
                  </>
                )}

                {user?.role === "merchantise" && (
                  <>
                    <option value="">Select Role</option>
                    {/* <option value="merchantise">Merchantise</option> */}
                    {/* <option value="marketing">Marketing</option> */}
                    <option value="delivery_boy">Delivery Boy</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded shadow"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add User"}
            </button>
          </div>
        </form>
      </div>

      {/* user list management */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-8">
        <h3 className="text-lg font-bold mb-6">Manage Existing Users</h3>
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-3/5 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="md:w-40 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="merchantise">Merchantise</option>
            <option value="marketing">Marketing</option>
            <option value="delivery_boy">Delivery Boy</option>
          </select>

          <button
            onClick={exportToExcel}
            className="w-1/2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            <RiFileExcel2Line className="inline" size={26} /> Export to Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-500">
            <thead className="bg-gray-100 text-xs uppercase text-gray-700">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                {user.role === "admin" && (
                  <th className="py-3 px-4">Change Role</th>
                )}
                {/* <th className="py-3 px-4">Created At</th> */}
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                      {u.name}
                    </td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full text-white w-fit ${u.role === "admin"
                          ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                          : u.role === "merchantise"
                            ? "bg-gradient-to-r from-orange-400 to-pink-500"
                            : u.role === "delivery_boy"
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                              : u.role === "marketing"
                                ? "bg-gradient-to-r from-pink-500 to-red-500"
                                : "bg-gradient-to-r from-green-400 to-blue-400"
                          }`}
                      >
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1).replace("_", " ")}
                      </span>

                    </td>
                    {user.role === "admin" && (
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u._id, e.target.value)
                          }
                          className="p-1 border text-xs rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                          disabled={loading}
                        >
                          <option value="customer">Customer</option>
                          {user?.role === "admin" && (
                            <>
                              <option value="admin">Admin</option>
                              <option value="merchantise">Merchantise</option>
                              <option value="marketing">Marketing</option>
                              <option value="delivery_boy">Delivery Boy</option>
                            </>
                          )}
                          {user?.role === "merchantise" && (
                            <option value="delivery_boy">Delivery Boy</option>
                          )}
                        </select>
                      </td>
                    )}
                    {/* <td className="p-4">{new Date(u.createdAt).toLocaleString()}</td> */}
                    <td className="p-4 space-x-2">
                      <button
                        onClick={() => setViewedUser(u)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                      >
                        View
                      </button>
                      {user?.role === "admin" && u.role === "customer" && (
                        <button
                          onClick={() => setWalletCreditModal({ userId: u._id, userName: u.name })}
                          className="bg-emerald-500 text-white px-3 py-1 rounded hover:bg-emerald-600 text-sm"
                        >
                          + Wallet
                        </button>
                      )}
                      {u._id !== user._id &&
                        (user?.role === "admin" ||
                          (user?.role === "merchantise" &&
                            u.role === "delivery_boy")) && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-md border ${page === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
                  } hover:bg-blue-800`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {confirmModal.visible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={closeConfirm}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center transition-all duration-300 scale-95 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Action</h3>
            <p className="text-sm text-gray-600 mb-6">{confirmModal.message}</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={async () => {
                  try {
                    const maybePromise = confirmModal.onConfirm?.();
                    // If onConfirm returned a promise (async), await it
                    if (maybePromise?.then) await maybePromise;
                  } finally {
                    closeConfirm(); // always closes, even if onConfirm throws
                  }
                }}

              >
                Confirm
              </button>
              <button
                className="px-5 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={closeConfirm}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center text-white">
              <div className="flex justify-center mb-4">
                {viewedUser.photo ? (
                  <img
                    src={viewedUser.photo}
                    alt={viewedUser.name || viewedUser.email}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">
                    {viewedUser.name
                      ? viewedUser.name.charAt(0).toUpperCase()
                      : viewedUser.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-semibold">{viewedUser.name}</h3>
              <p className="text-sm opacity-80 capitalize">
                {viewedUser.role.replace("_", " ")}
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-gray-700 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">Email:</span>
                <span>{viewedUser.email}</span>
              </div>

              {/* Address Section */}
              {viewedUser.addresses?.length > 0 && (
                <div>
                  <p className="font-semibold mt-2 mb-2">Saved Addresses:</p>
                  <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto pr-1">
                    {viewedUser.addresses.map((addr, idx) => (
                      <div
                        key={addr._id || idx}
                        className="w-full sm:w-[48%] border p-3 rounded-md shadow-sm bg-gray-50 relative"
                      >
                        {addr.isDefault && (
                          <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-blue-600 text-white font-semibold">
                            Default
                          </span>
                        )}
                        <p>
                          <strong>Address:</strong> {addr.address}
                        </p>
                        <p>
                          <strong>City:</strong> {addr.city}
                        </p>
                        <p>
                          <strong>Postal Code:</strong> {addr.postalCode}
                        </p>
                        <p>
                          <strong>Country:</strong> {addr.country}
                        </p>
                        {addr.phone && (
                          <p>
                            <strong>Phone:</strong> {addr.phone}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              )}

              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Joined:</span>
                <span>
                  {new Date(viewedUser.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 p-4 text-right">
              <button
                onClick={() => setViewedUser(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Admin Wallet Credit Modal ── */}
      {walletCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setWalletCreditModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-emerald-50">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Credit Wallet</h3>
                <p className="text-xs text-gray-500 mt-0.5">User: <span className="font-semibold">{walletCreditModal.userName}</span></p>
              </div>
              <button onClick={() => setWalletCreditModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 transition text-lg font-bold">
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Amount (₹)</label>
                <input
                  type="number" min="1" placeholder="e.g. 200"
                  value={walletCreditAmount}
                  onChange={(e) => setWalletCreditAmount(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Note (optional)</label>
                <input
                  type="text" placeholder="e.g. Birthday bonus, Refund adjustment…"
                  value={walletCreditNote}
                  onChange={(e) => setWalletCreditNote(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50 focus:bg-white transition"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleAdminCredit}
                  disabled={walletCreditLoading || !walletCreditAmount || Number(walletCreditAmount) <= 0}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                    walletCreditLoading || !walletCreditAmount
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {walletCreditLoading ? "Crediting…" : "Credit Wallet"}
                </button>
                <button
                  onClick={() => setWalletCreditModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
