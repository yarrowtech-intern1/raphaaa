/** Modernized Profile.jsx — Updated UI for Wishlist, Address, and Profile tabs **/
import React, { useEffect, useState } from "react";
import MyOrders from "./MyOrdersPage";
import { FaUserCircle, FaTrash } from "react-icons/fa";
import { AiOutlineLogout } from "react-icons/ai";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import { clearCart } from "../redux/slices/cartSlice";
import axios from "axios";
import { FaHeart, FaMapMarkerAlt, FaBoxOpen } from "react-icons/fa";
import { FaLocationCrosshairs } from "react-icons/fa6";
import AddressForm from "../components/Cart/AddressForm";
import ViewAddress from "../components/Cart/ViewAddress";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("orders");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  // Complaint states
  const [orderId, setOrderId] = useState("");
  const [orderVerified, setOrderVerified] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // Verify order ID
  const verifyOrder = async () => {
    if (!orderId.trim()) return;
    setVerifying(true);
    try {
      const token = localStorage.getItem("userToken");
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/verify/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderVerified(data.exists);
    } catch {
      setOrderVerified(false);
    } finally {
      setVerifying(false);
    }
  };


  // Fetch user complaints
  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/complaints`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Failed to load complaints", err);
    }
  };

  // Auto fetch when complaint tab active
  useEffect(() => {
    if (activeTab === "complaint") fetchComplaints();
  }, [activeTab]);


  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Wishlist fetch
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistItems(data);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };
    if (activeTab === "wishlist") fetchWishlist();
  }, [activeTab]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("userToken");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      const token = localStorage.getItem("userToken");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/complaints/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Complaint deleted successfully!');
      fetchComplaints(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete complaint');
    }
  };


  // Logout
  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100 p-6 flex flex-col items-center text-center transition-all self-start">
          <div className="relative w-20 h-20 mb-4">
            {user?.photo ? (
              <img
                src={user.photo}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover shadow-md border-4 border-white"
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold text-2xl shadow">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-800">{user?.name}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>

          <div className="mt-6 w-full space-y-2">
            {[
              { key: "orders", label: "My Orders", icon: <FaBoxOpen /> },
              { key: "wishlist", label: "Wishlist", icon: <FaHeart /> },
              { key: "address", label: "Address", icon: <FaMapMarkerAlt /> },
              { key: "profile", label: "Profile", icon: <FaUserCircle /> },
              { key: "complaint", label: "Add Complaint", icon: <FaLocationCrosshairs /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center w-full px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === key
                  ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg"
                  : "bg-white hover:bg-sky-50 border border-gray-200 text-gray-700"
                  }`}
              >
                <span className="mr-2 text-lg">{icon}</span> {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <AiOutlineLogout className="inline mr-2" />
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4 bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-blue-100">
          {/* Orders */}
          {activeTab === "orders" && <MyOrders />}

          {/* Wishlist */}
          {activeTab === "wishlist" && (
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-500 bg-clip-text text-transparent">
                  My Wishlist
                </h2>
                {wishlistItems.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {wishlistItems.length} {wishlistItems.length > 1 ? "items" : "item"}
                  </p>
                )}
              </div>

              {wishlistItems.length === 0 ? (
                <div className="text-center mt-12">
                  <img
                    src="/empty-wishlist.svg"
                    alt="Empty Wishlist"
                    className="mx-auto w-48 h-full opacity-80 mb-4"
                  />
                  <p className="text-gray-500 text-lg font-medium">
                    Your wishlist is empty
                  </p>
                  <Link
                    to="/collections/all"
                    className="mt-6 inline-block bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-2 rounded-xl font-medium shadow hover:shadow-lg transition-all"
                  >
                    Explore Products
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => (
                    <div
                      key={item._id}
                      className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <Link to={`/product/${item._id}`} className="block">
                        <div className="relative">
                          <img
                            src={item.images?.[0]?.url || "/placeholder.png"}
                            alt={item.name}
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                        </div>

                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                          <p
                            className={`text-sm font-medium ${item.countInStock < 5
                              ? "text-red-500"
                              : "text-green-600"
                              }`}
                          >
                            {item.countInStock < 5
                              ? `Only ${item.countInStock} left!`
                              : "In Stock"}
                          </p>
                        </div>
                      </Link>

                      <div className="px-4 pb-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveFromWishlist(item._id);
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium py-2 rounded-xl shadow-md transition-all"
                        >
                          <FaTrash className="text-sm" /> Remove from Wishlist
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          )}

          {/* Address */}
          {activeTab === "address" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-4 text-sky-700">Manage Addresses</h2>
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl shadow-inner p-6">
                <AddressForm />
              </div>
              <div className="mt-8 bg-gradient-to-br from-white to-sky-50 rounded-2xl p-6 shadow-inner">
                <ViewAddress />
              </div>
            </div>
          )}

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-sky-700 mb-4">My Profile</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-800">{user?.name}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{user?.email}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium text-gray-800">
                    {user?.mobile || "Not Available"}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium text-gray-800 capitalize">
                    {user?.role?.replace("_", " ") || "Customer"}
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Complaint */}
          {activeTab === "complaint" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-4 text-sky-700">Add Complaint</h2>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  try {
                    // const formData = new FormData(e.target);
                    const formData = new FormData(e.target);
                    selectedImages.forEach((file) => {
                      formData.append("images", file);
                    });

                    const token = localStorage.getItem("userToken");

                    await axios.post(
                      `${import.meta.env.VITE_BACKEND_URL}/api/complaints/add`,
                      formData,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );

                    toast.success("Complaint submitted successfully!");
                    e.target.reset();
                    fetchComplaints(); // refresh list
                  } catch (err) {
                    toast.error(err.response?.data?.message || "Failed to submit complaint");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-2xl shadow-lg p-8 space-y-6 transition-all hover:shadow-xl"
              >
                <h2 className="text-2xl font-bold text-sky-700 mb-4 text-center">
                  Submit a Complaint
                </h2>
                <p className="text-gray-600 text-sm text-center mb-6">
                  Fill in the details below to raise a complaint regarding your order.
                </p>

                {/* Complaint Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Complaint Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="complaintType"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-400 outline-none transition-all bg-white"
                  >
                    <option value="">Select type</option>
                    <option value="Damaged Product">Damaged Product</option>
                    <option value="Missing Item">Missing Item</option>
                    <option value="Wrong Product Delivered">Wrong Product Delivered</option>
                    <option value="Late Delivery">Late Delivery</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Order ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="orderId"
                    required
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    onBlur={verifyOrder}
                    placeholder="Enter your order ID"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-400 outline-none transition-all bg-white"
                  />

                  {/* Status Messages */}
                  <div className="mt-1">
                    {verifying && (
                      <p className="text-blue-500 text-sm">Verifying your order, please wait...</p>
                    )}
                    {orderVerified === true && (
                      <p className="text-green-600 text-sm">Order verified successfully</p>
                    )}
                    {orderVerified === false && !verifying && (
                      <p className="text-red-500 text-sm">Invalid or unverified order</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    required
                    placeholder="Describe your issue in detail..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-400 outline-none min-h-[120px] resize-none bg-white"
                  />
                </div>

                {/* Upload Image */}
                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Image (optional)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-sky-50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-3 text-sky-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          ></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold text-sky-600">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG (max 2MB)</p>
                      </div>
                      <input type="file" name="image" accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div> */}

                {/* Upload Images */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Images (optional)
                  </label>
                  <div className="flex flex-col items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-sky-50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-3 text-sky-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          ></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold text-sky-600">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-xs text-gray-400">You can select multiple images</p>
                      </div>
                      <input
                        type="file"
                        name="images"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          setSelectedImages((prev) => [...prev, ...files]);
                        }}
                      />
                    </label>
                  </div>

                  {/* Image Preview Section */}
                  {selectedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`preview-${index}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedImages((prev) => prev.filter((_, i) => i !== index))
                            }
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={submitting || !orderVerified}
                    className={`w-full md:w-auto px-8 py-2.5 rounded-xl font-semibold transition-all shadow-md ${submitting || !orderVerified
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-lg hover:scale-[1.02]"
                      }`}
                  >
                    {submitting ? "Submitting..." : "Submit Complaint"}
                  </button>
                </div>
              </form>


              {/* Display Complaints */}
              <div className="mt-10">
                <h3 className="text-2xl font-bold mb-6 text-sky-700 border-b border-sky-100 pb-2">
                  My Complaints
                </h3>

                {complaints.length === 0 ? (
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-8 text-center shadow-inner">
                    <p className="text-gray-500 text-sm">No complaints submitted yet...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {complaints.map((c) => (
                      <div
                        key={c._id}
                        className="relative bg-white border border-sky-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-700">
                            {c.complaintType}
                          </span>

                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${c.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : c.status === "Resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                              }`}
                          >
                            {c.status}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-800">Order ID:</span> {c.orderId}
                          </p>

                          <p className="text-sm text-gray-700 leading-relaxed">
                            {c.description}
                          </p>

                          {c.images && c.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {c.images.map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={img}
                                    alt={`Complaint ${idx + 1}`}
                                    className="w-full h-36 object-cover rounded-xl border border-gray-100 shadow-sm hover:scale-[1.03] transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/10 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                                    Image {idx + 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}


                          <p className="text-xs text-gray-400 mt-2">
                            Submitted on {new Date(c.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleDeleteComplaint(c._id)}
                            className="flex items-center gap-1 text-sm font-medium px-4 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-sm transition-all"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
