import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserOrders } from "../redux/slices/orderSlice";
import axios from "axios";
import { toast } from "sonner";

const MyOrders = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [reviewedProducts, setReviewedProducts] = useState(new Set());
  const [showGuide, setShowGuide] = useState(true); // Guide alert state

  const itemsPerPage = 3;
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  // Fetch user's reviewed products
  useEffect(() => {
    const fetchReviewedProducts = async () => {
      if (!user?.token) return;

      try {
        const response = await axios.get("/api/reviews/my-reviews", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const reviewedProductIds = new Set(
          response.data.map((review) => review.product._id)
        );
        setReviewedProducts(reviewedProductIds);
      } catch (error) {
        console.error("Error fetching reviewed products:", error);
      }
    };

    fetchReviewedProducts();
  }, [user]);

  if (error) return <p>Error: {error}</p>;

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredOrders = orders
    .filter((order) => {
      if (statusFilter === "all") return true;
      return statusFilter === "paid" ? order.isPaid : !order.isPaid;
    })
    .filter((order) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        order._id.toLowerCase().includes(searchLower) ||
        order.orderItems[0]?.name?.toLowerCase().includes(searchLower) ||
        order.shippingAddress.city.toLowerCase().includes(searchLower) ||
        order.shippingAddress.country.toLowerCase().includes(searchLower)
      );
    });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    return sortConfig.direction === "asc"
      ? new Date(aVal) > new Date(bVal)
        ? 1
        : -1
      : new Date(aVal) < new Date(bVal)
      ? 1
      : -1;
  });

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const handleWriteReview = (e, order) => {
    e.stopPropagation();

    const product = order.orderItems[0];

    // Try all possible sources for product ID
    const productId =
      product.productId?._id?.toString() || // populated ref
      product.productId?.toString() || // ObjectId
      product.product?._id?.toString() || // fallback
      product.product?.toString(); // last fallback

    if (!productId) {
      toast.error("Product ID not available");
      return;
    }

    navigate(`/review/${productId}`);
  };

  const canWriteReview = (order) => {
    if (order.status !== "Delivered") return false;

    // Check if any product in the order hasn't been reviewed
    return order.orderItems.some((item) => {
      const productId = item.productId || item.product;
      return productId && !reviewedProducts.has(productId);
    });
  };

  const getDeliveryStatusClass = (status) => {
    if (status === "Delivered") return "text-green-600 bg-green-50 border-green-200";
    if (["Cancelled", "RTO Initiated", "RTO Delivered"].includes(status)) {
      return "text-red-600 bg-red-50 border-red-200";
    }
    if (["Shipped", "Pickup Scheduled", "Picked Up", "In Transit", "Out For Delivery"].includes(status)) {
      return "text-amber-700 bg-amber-50 border-amber-200";
    }
    return "text-gray-700 bg-gray-50 border-gray-200";
  };

  const getReviewButtonText = (order) => {
    const unreviewed = order.orderItems.filter((item) => {
      const productId = item.productId || item.product;
      return productId && !reviewedProducts.has(productId);
    });

    if (unreviewed.length === 0) return "Reviewed";
    if (unreviewed.length === 1) return "Write Review";
    return `Review (${unreviewed.length})`;
  };

  /* ── status badge config ── */
  const statusBadge = (status, isPaid) => {
    if (status === "Delivered")
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (["Shipped","In Transit","Out For Delivery","Picked Up","Pickup Scheduled"].includes(status))
      return "bg-sky-100 text-sky-700 border-sky-200";
    if (["Cancelled","RTO Initiated","RTO Delivered"].includes(status))
      return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-3 text-gray-500 text-sm">
      <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      Loading your orders…
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-800">My Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">{sortedOrders.length} order{sortedOrders.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition w-44"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition appearance-none cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <button
            onClick={() => handleSort("createdAt")}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition flex items-center gap-1"
          >
            Date {sortConfig.key === "createdAt" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}
          </button>
        </div>
      </div>

      {/* ── Orders list ── */}
      {currentOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-sm font-semibold text-gray-600 mb-1">No orders found</p>
          <p className="text-xs text-gray-400">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentOrders.map((order) => {
            const firstItem  = order.orderItems[0];
            const extraItems = order.orderItems.length - 1;
            return (
              <div
                key={order._id}
                onClick={() => handleRowClick(order._id)}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-200 transition-all cursor-pointer group overflow-hidden"
              >
                {/* Top accent bar based on status */}
                <div className={`h-0.5 ${
                  order.status === "Delivered" ? "bg-emerald-400"
                  : ["Cancelled","RTO Initiated","RTO Delivered"].includes(order.status) ? "bg-red-400"
                  : ["Shipped","In Transit","Out For Delivery","Picked Up"].includes(order.status) ? "bg-sky-400"
                  : "bg-amber-400"
                }`} />

                <div className="flex items-center gap-4 p-4">
                  {/* Product image(s) */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-sky-200 transition">
                      <img
                        src={firstItem?.image || "/placeholder-image.jpg"}
                        alt={firstItem?.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {extraItems > 0 && (
                      <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-gray-800 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                        +{extraItems}
                      </span>
                    )}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {firstItem?.name}
                          {extraItems > 0 && <span className="text-gray-400 font-normal"> +{extraItems} more</span>}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">
                          {order.orderId || `#${order._id.slice(-8).toUpperCase()}`}
                        </p>
                      </div>
                      <p className="text-base font-extrabold text-gray-900 shrink-0">
                        ₹{(order.totalPrice || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Date */}
                      <span className="text-[11px] text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-gray-200">·</span>
                      {/* Payment badge */}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        order.isPaid
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-rose-100 text-rose-700 border-rose-200"
                      }`}>
                        {order.isPaid ? "Paid" : "Unpaid"}
                      </span>
                      {/* Delivery badge */}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(order.status)}`}>
                        {order.status || "Processing"}
                      </span>
                    </div>

                    {/* Review buttons — shown only for delivered orders */}
                    {order.status === "Delivered" && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {order.orderItems.map((item) => {
                          const rawId = item.productId?._id || item.productId || item.product?._id || item.product;
                          const productId = rawId?.toString();
                          const isReviewed = reviewedProducts.has(productId);
                          return isReviewed ? (
                            <span key={productId}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-200 text-gray-400 bg-gray-50">
                              ✓ Reviewed
                            </span>
                          ) : (
                            <button key={productId}
                              onClick={(e) => { e.stopPropagation(); navigate(`/review/${productId}`); }}
                              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-sky-200 text-sky-600 bg-sky-50 hover:bg-sky-100 transition">
                              ✍ Write Review
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-sky-400 transition shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
