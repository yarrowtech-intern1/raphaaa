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

  const getReviewButtonText = (order) => {
    const unreviewed = order.orderItems.filter((item) => {
      const productId = item.productId || item.product;
      return productId && !reviewedProducts.has(productId);
    });

    if (unreviewed.length === 0) return "Reviewed";
    if (unreviewed.length === 1) return "Write Review";
    return `Review (${unreviewed.length})`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {showGuide && (
        <div className="p-4 mb-6 bg-yellow-400 text-white rounded-lg flex justify-between items-center">
          <span>Click on any product to view more details!</span>
          <button
            onClick={() => setShowGuide(false)}
            className="text-blue-800 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">My Orders</h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm">
          <input
            type="text"
            placeholder="Search orders..."
            className="border px-3 py-2 rounded text-sm outline-0 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="border px-3 py-2 rounded text-sm outline-0 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="relative shadow-md sm:rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700 bg-white">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Order Name</th>
              <th
                className="py-3 px-4 cursor-pointer hover:underline"
                onClick={() => handleSort("createdAt")}
              >
                Ordered At
                {sortConfig.key === "createdAt" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Delivery Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-6 px-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading orders...
                    </span>
                  </div>
                </td>
              </tr>
            ) : currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => handleRowClick(order._id)}
                  className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <img
                      src={order.orderItems[0]?.image || "/placeholder-image.jpg"}
                      alt={order.orderItems[0]?.name || "Product"}
                      className="w-12 h-12 object-cover rounded-md border"
                    />
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                    {order.orderItems[0]?.name}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(order.createdAt).toLocaleDateString()} <br />
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">
                      {order.orderItems.length}
                    </span>
                    {order.orderItems.length > 1 && (
                      <span className="text-xs text-gray-500 block">items</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    ₹{order.totalPrice}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`${
                        order.isPaid
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      } px-3 py-1 rounded-full text-xs font-semibold`}
                    >
                      {order.isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-2">
                      <span
                        className={`text-xs w-fit font-medium px-2 py-1 rounded border ${
                          order.status === "Delivered"
                            ? "text-green-600 bg-green-50 border-green-200"
                            : "text-orange-600 bg-orange-50 border-orange-200"
                        }`}
                      >
                        {order.status}
                      </span>

                      {order.status === "Delivered" &&
                        order.orderItems.map((item) => {
                          const rawProductId =
                            item.productId?._id ||
                            item.productId ||
                            item.product?._id ||
                            item.product;

                          const productId = rawProductId?.toString();
                          const isReviewed = reviewedProducts.has(productId);

                          return isReviewed ? (
                            <span
                              key={productId}
                              className="text-xs w-fit font-medium px-2 py-1 rounded border text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
                            >
                              You already gave a review for {item.name}
                            </span>
                          ) : (
                            <button
                              key={productId}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/review/${productId}`);
                              }}
                              className="text-xs w-fit font-medium px-2 py-1 rounded border text-sky-600 hover:text-sky-800 hover:underline bg-sky-50 border-sky-200 transition-colors"
                            >
                              Write Review ({item.name})
                            </button>
                          );
                        })}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-6 px-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end mt-6 gap-2 text-sm">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
