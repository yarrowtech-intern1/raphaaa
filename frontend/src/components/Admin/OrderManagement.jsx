// // import React, { useEffect } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { useNavigate } from "react-router-dom";
// // import { fetchAllOrders, updateOrderStatus } from "../../redux/slices/adminOrderSlice";

// // const OrderManagement = () => {
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();

// //   const { user } = useSelector((state) => state.auth);
// //   const { orders, loading, error } = useSelector((state) => state.adminOrders);

// //   useEffect(() => {
// //     if(!user || user.role !== "admin") {
// //       navigate("/");
// //     } else {
// //       dispatch(fetchAllOrders());
// //     }
// //   }, [dispatch, user, navigate]);
// //   // const orders = [
// //   //   {
// //   //     _id: 221131,
// //   //     user: {
// //   //       name: "john Doe",
// //   //     },
// //   //     totalPrice: 110,
// //   //     status: "Processing",
// //   //   },
// //   // ];

// //   const handleStatusChange = (orderId, status) => {
// //     // console.log({ id: orderId, status });
// //     dispatch(updateOrderStatus({ id: orderId, status }));
// //   };

// //   if(loading) return <p>Loading...</p>
// //   if(error) return <p> Error: {error} </p>

// //   return (
// //     <div className="max-w-7xl mx-auto p-6">
// //       <h2 className="text-2xl font-bold mb-6">Order Management</h2>
// //       <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
// //         <table className="min-w-full text-sm text-left text-gray-700">
// //           <thead className="bg-gray-100 text-xs uppercase text-gray-600">
// //             <tr>
// //               <th className="py-4 px-6">Order ID</th>
// //               <th className="py-4 px-6">Order Customer</th>
// //               <th className="py-4 px-6">Total Price</th>
// //               <th className="py-4 px-6">Status</th>
// //               <th className="py-4 px-6">Actions</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {orders.length > 0 ? (
// //               orders.map((order) => (
// //                 <tr
// //                   key={order._id}
// //                   className="hover:bg-gray-50 transition-all duration-200"
// //                 >
// //                   <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
// //                     #{order._id}
// //                   </td>
// //                   <td className="py-4 px-6">{order.user.name}</td>
// //                   <td className="py-4 px-6">₹{order.totalPrice.toFixed(2)}</td>
// //                   <td className="py-4 px-6">
// //                     <select
// //                       value={order.status}
// //                       onChange={(e) =>
// //                         handleStatusChange(order._id, e.target.value)
// //                       }
// //                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 w-full"
// //                     >
// //                       <option value="Processing">Processing</option>
// //                       <option value="Shipped">Shipped</option>
// //                       <option value="Delivered">Delivered</option>
// //                       <option value="Cancelled">Cancelled</option>
// //                     </select>
// //                   </td>
// //                   <td className="py-4 px-6">
// //                     <button
// //                       onClick={() => handleStatusChange(order._id, "Delivered")}
// //                       className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
// //                     >
// //                       Mark as Delivered
// //                     </button>
// //                   </td>
// //                 </tr>
// //               ))
// //             ) : (
// //               <tr>
// //                 <td
// //                   colSpan={5}
// //                   className="p-6 text-center text-gray-500 italic"
// //                 >
// //                   No orders found
// //                 </td>
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // };

// // export default OrderManagement;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   fetchAllOrders,
//   updateOrderStatus,
//   deleteOrder,
//   clearError,
// } from "../../redux/slices/adminOrderSlice";
// import { FaRegTrashCan } from "react-icons/fa6";
// import { FaBoxOpen } from "react-icons/fa";
// import { FaEye } from "react-icons/fa";

// const OrderManagement = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { user } = useSelector((state) => state.auth);
//   const { orders, loading, error } = useSelector((state) => state.adminOrders);

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const ordersPerPage = 10;

//   useEffect(() => {
//     if (!user) {
//       navigate("/login");
//       return;
//     }

//     if (user.role !== "admin") {
//       navigate("/");
//       return;
//     }

//     dispatch(fetchAllOrders());
//   }, [dispatch, user, navigate]);

//   const handleStatusChange = (orderId, status) => {
//     dispatch(updateOrderStatus({ id: orderId, status }));
//   };

//   const handleDeleteOrder = (orderId) => {
//     if (window.confirm("Are you sure you want to delete this order?")) {
//       dispatch(deleteOrder(orderId));
//     }
//   };

//   const clearErrorHandler = () => {
//     dispatch(clearError());
//   };

//   const filteredOrders = orders
//     .filter(
//       (order) =>
//         order._id.toLowerCase().includes(search.toLowerCase()) ||
//         order.user?.name?.toLowerCase().includes(search.toLowerCase())
//     )
//     .filter((order) => (statusFilter ? order.status === statusFilter : true));

//   const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
//   const paginatedOrders = filteredOrders.slice(
//     (currentPage - 1) * ordersPerPage,
//     currentPage * ordersPerPage
//   );

//   if (loading)
//     return (
//       <div className="max-w-7xl mx-auto p-6">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//           <p className="mt-2">Loading orders...</p>
//         </div>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="max-w-7xl mx-auto p-6">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           <div className="flex justify-between items-center">
//             <span>
//               Error:{" "}
//               {typeof error === "string"
//                 ? error
//                 : error.message || "Something went wrong"}
//             </span>
//             <button
//               onClick={clearErrorHandler}
//               className="text-red-700 hover:text-red-900"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//         <button
//           onClick={() => dispatch(fetchAllOrders())}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         >
//           Retry
//         </button>
//       </div>
//     );

//   return (
//     <div className="max-w-7xl mx-auto p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold">Order Management</h2>
//         <div className="text-sm text-gray-600">
//           Total Orders: <span className="bg-blue-600 text-white p-1 rounded-full"> {filteredOrders.length} </span>
//         </div>
//       </div>

//       {/* Search and Filter */}
//       <div className="flex flex-col md:flex-row gap-4 mb-4">
//         <input
//           type="text"
//           placeholder="Search by ID or customer"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md bg-white outline-0"
//         />
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-md bg-white outline-0"
//         >
//           <option value="">All Statuses</option>
//           <option value="Processing">Processing</option>
//           <option value="Shipped">Shipped</option>
//           <option value="Delivered">Delivered</option>
//           <option value="Cancelled">Cancelled</option>
//         </select>
//       </div>

//       <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
//         <table className="min-w-full text-sm text-left text-gray-700">
//           <thead className="bg-gray-100 text-xs uppercase text-gray-600">
//             <tr>
//               <th className="py-4 px-6">Order ID</th>
//               <th className="py-4 px-6">Customer</th>
//               <th className="py-4 px-6">Total Price</th>
//               <th className="py-4 px-6">Status</th>
//               {/* <th className="py-4 px-6">Payment Method</th> */}
//               <th className="py-4 px-6">Created At</th>
//               <th className="py-4 px-6">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {paginatedOrders.length > 0 ? (
//               paginatedOrders.map((order) => (
//                 <tr
//                   key={order._id}
//                   className="hover:bg-gray-50 transition-all duration-200 border-b"
//                 >
//                   <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
//                     #{order._id.slice(-8)}
//                   </td>
//                   <td className="py-4 px-6">
//                     {order.user?.name || "Unknown User"}
//                   </td>
//                   <td className="py-4 px-6">
//                     ₹{order.totalPrice?.toFixed(2) || "0.00"}
//                   </td>
//                   <td className="py-4 px-6">
//                     <select
//                       value={order.status}
//                       onChange={(e) =>
//                         handleStatusChange(order._id, e.target.value)
//                       }
//                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 w-full"
//                     >
//                       <option value="Processing">Processing</option>
//                       <option value="Shipped">Shipped</option>
//                       <option value="Delivered">Delivered</option>
//                       <option value="Cancelled">Cancelled</option>
//                     </select>
//                   </td>
//                   {/* <td className="py-4 px-6 capitalize">
//                     {order.paymentMethod?.replace("_", " ") || "N/A"}
//                   </td> */}
//                   <td className="py-4 px-6">
//                     {new Date(order.createdAt).toLocaleDateString()}
//                   </td>
//                   <td className="py-4 px-6">
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => {
//                           setSelectedOrder(order);
//                           setIsModalOpen(true);
//                         }}
//                         className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-xs"
//                       >
//                         View Details
//                       </button>
//                       <button
//                         onClick={() =>
//                           handleStatusChange(order._id, "Delivered")
//                         }
//                         className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-xs"
//                       >
//                        <FaBoxOpen className="inline"/> Mark Delivered
//                       </button>
//                       <button
//                         onClick={() => handleDeleteOrder(order._id)}
//                         className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-xs"
//                       >
//                       <FaRegTrashCan className="inline"/>  Delete
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td
//                   colSpan={7}
//                   className="p-6 text-center text-gray-500 italic"
//                 >
//                   No orders found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-center mt-6 gap-2">
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//             <button
//               key={page}
//               onClick={() => setCurrentPage(page)}
//               className={`px-4 py-2 rounded-md border ${
//                 page === currentPage
//                   ? "bg-blue-500 text-white"
//                   : "bg-white text-gray-700"
//               } hover:bg-blue-100`}
//             >
//               {page}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Modal */}
//       {isModalOpen && selectedOrder && (
//         <div
//           className="fixed inset-0 bg-black/40 bg-opacity-40 flex items-center justify-center z-50"
//           onClick={() => setIsModalOpen(false)} // closes when clicked outside
//         >
//           <div
//             className="bg-white p-6 rounded-lg max-w-md w-full relative shadow-lg"
//             onClick={(e) => e.stopPropagation()} // prevents inner clicks from closing modal
//           >
//             <button
//               onClick={() => setIsModalOpen(false)}
//               className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl"
//             >
//               &times;
//             </button>
//             <h3 className="text-lg font-bold mb-4">Order Details</h3>
//             <div className="grid gap-2 text-sm text-gray-800">
//               <p>
//                 <strong>Order ID:</strong> {selectedOrder._id}
//               </p>
//               <p>
//                 <strong>Customer:</strong>{" "}
//                 {selectedOrder.user?.name || "Unknown"}
//               </p>
//               <p>
//                 <strong>Email:</strong> {selectedOrder.user?.email || "N/A"}
//               </p>
//               <p>
//                 <strong>Status:</strong> {selectedOrder.status}
//               </p>
//               <p>
//                 <strong>Total Price:</strong> ₹
//                 {selectedOrder.totalPrice?.toFixed(2)}
//               </p>
//               <p>
//                 <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
//               </p>
//               <p>
//                 <strong>Ordered On:</strong>{" "}
//                 {new Date(selectedOrder.createdAt).toLocaleString()}
//               </p>
//               <p>
//                 <strong>Shipping Address:</strong>{" "}
//                 {selectedOrder.shippingAddress
//                   ? `${selectedOrder.shippingAddress.address}, ${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.postalCode}, ${selectedOrder.shippingAddress.country}`
//                   : "N/A"}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderManagement;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
  clearError,
} from "../../redux/slices/adminOrderSlice";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { toast } from "sonner";
import { FaCheckCircle } from "react-icons/fa";

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { orders, loading, error } = useSelector((state) => state.adminOrders);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ordersPerPage = 10;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Check if user has permission to access this page
  const hasPermission =
    user &&
    (user.role === "admin" ||
      user.role === "merchantise" ||
      user.role === "delivery_boy");
  const isAdmin = user && user.role === "admin";
  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      dispatch(deleteOrder(orderToDelete));
      toast.success("Order deleted successfully!");
      setShowConfirmModal(false);
      setOrderToDelete(null);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!hasPermission) {
      navigate("/");
      return;
    }

    dispatch(fetchAllOrders());
  }, [dispatch, user, navigate, hasPermission]);

  const handleStatusChange = (orderId, status) => {
    dispatch(updateOrderStatus({ id: orderId, status }));
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      dispatch(deleteOrder(orderId));
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowConfirmModal(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const clearErrorHandler = () => {
    dispatch(clearError());
  };

  const filteredOrders = orders
    .filter(
      (order) =>
        order._id?.toLowerCase().includes(search.toLowerCase()) ||
        order.orderId?.toLowerCase().includes(search.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((order) => (statusFilter ? order.status === statusFilter : true));

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  if (loading)
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading orders...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span>
              Error:{" "}
              {typeof error === "string"
                ? error
                : error.message || "Something went wrong"}
            </span>
            <button
              onClick={clearErrorHandler}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
        <button
          onClick={() => dispatch(fetchAllOrders())}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Order Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {isAdmin ? "Admin Dashboard" : "Merchantise Dashboard"}
          </p>
        </div>
        <div className="text-sm text-gray-600">
          Total Orders:{" "}
          <span className="bg-blue-600 text-white p-1 rounded-full">
            {" "}
            {filteredOrders.length}{" "}
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by ID or customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md bg-white outline-0"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-md bg-white outline-0"
        >
          <option value="">All Statuses</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              {/* <th className="py-4 px-6">Order ID</th> */}
              <th className="py-4 px-6">ID</th>
              <th className="py-4 px-6">Customer</th>
              <th className="py-4 px-6">Total Price</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Created At</th>
              <th className="py-4 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 transition-all duration-200 border-b"
                >
                  {/* <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                    #{order._id.slice(-8)}
                  </td> */}
                  <td className="py-4 px-6">
                    {order?.orderId || "Invalid ID"}
                  </td>
                  <td className="py-4 px-6">
                    {order.user?.name || "Unknown User"}
                  </td>
                  <td className="py-4 px-6">
                    ₹{order.totalPrice?.toFixed(2) || "0.00"}
                  </td>
                  <td className="py-4 px-6">
                    {user.role === "delivery_boy" ? (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Shipped"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    ) : (
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 w-full"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-xs"
                      >
                        <FaEye className="inline mr-1" /> View
                      </button>
                      {user.role === "delivery_boy" ? (
                        order.status === "Shipped" && (
                          <button
                            onClick={() =>
                              handleStatusChange(order._id, "Delivered")
                            }
                            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-xs"
                          >
                            <FaBoxOpen className="inline mr-1" /> Delivered
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() =>
                            handleStatusChange(order._id, "Delivered")
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-xs"
                        >
                          <FaBoxOpen className="inline mr-1" /> Delivered
                        </button>
                      )}

                      {/* Only show delete button for admin */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setOrderToDelete(order._id);
                            setShowConfirmModal(true);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-xs"
                        >
                          <FaRegTrashCan className="inline mr-1" /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500 italic"
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {showConfirmModal && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={() => setShowConfirmModal(false)}
          >
            <div
              className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full animate-fade-in-slow"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this order? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteOrder}
                  className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-md border ${
                page === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              } hover:bg-blue-100`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl"
            >
              &times;
            </button>

            <h3 className="text-2xl font-bold text-blue-700 mb-6 border-b pb-2">
              🧾 Order Summary
            </h3>

            <div className="flex flex-col md:flex-row gap-6 text-sm text-gray-700">
              {/* Left Section: Order Summary */}
              <div className="w-full md:w-1/2 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span className="text-gray-900">{selectedOrder.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <span>{selectedOrder.user?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{selectedOrder.user?.email || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className="font-semibold text-blue-600">
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="text-green-600 font-bold">
                    ₹{selectedOrder.totalPrice?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payment:</span>
                  <span>{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Ordered On:</span>
                  <span>
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Shipping Address:</span>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedOrder.shippingAddress
                      ? `${selectedOrder.shippingAddress.address}, ${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.postalCode}, ${selectedOrder.shippingAddress.country}`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Right Section: Order Items */}
              <div className="w-full md:w-1/2 flex flex-col md:flex-row gap-6">
                {/* Order Items List */}
                <div className="w-full md:w-2/3">
                  <span className="font-medium block mb-2">Items Ordered:</span>
                  <div className="space-y-3">
                    {selectedOrder.orderItems &&
                    selectedOrder.orderItems.length > 0 ? (
                      selectedOrder.orderItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded object-cover border"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Color: {item.color} | Size: {item.size}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-800 font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic text-sm">
                        No items found
                      </p>
                    )}
                  </div>
                </div>

                {/* Vertical Status Tracker */}
                <div className="w-full md:w-1/3 mt-6 md:mt-0">
                  <span className="font-medium block mb-2">Order Status:</span>
                  <div className="relative pl-6">
                    {/* Vertical progress line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-300 z-0">
                      <div
                        className="absolute top-0 w-full bg-blue-500 transition-all duration-700 ease-in-out"
                        style={{
                          height: `${
                            [
                              "Ordered",
                              "Processing",
                              "Shipped",
                              selectedOrder.status === "Cancelled"
                                ? "Cancelled"
                                : "Delivered",
                            ].indexOf(selectedOrder.status) * 33.3
                          }%`,
                        }}
                      />
                    </div>

                    {/* Status Timeline */}
                    <div className="space-y-8 relative z-10">
                      {[
                        { label: "Ordered", time: selectedOrder.createdAt },
                        { label: "Processing", time: selectedOrder.updatedAt },
                        {
                          label: "Shipped",
                          time:
                            selectedOrder.shippedAt || selectedOrder.updatedAt,
                        },
                        {
                          label:
                            selectedOrder.status === "Cancelled"
                              ? "Cancelled"
                              : "Delivered",
                          time:
                            selectedOrder.status === "Cancelled"
                              ? selectedOrder.cancelledAt ||
                                selectedOrder.updatedAt
                              : selectedOrder.deliveredAt ||
                                selectedOrder.updatedAt,
                        },
                      ].map((step, index, steps) => {
                        const currentIndex = steps.findIndex(
                          (s) =>
                            s.label ===
                            (selectedOrder.status === "Cancelled"
                              ? "Cancelled"
                              : selectedOrder.status)
                        );

                        const isCompleted = index < currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                          <div
                            key={step.label}
                            className="relative flex items-start gap-3"
                          >
                            {/* Dot / Checkmark */}
                            <div className="relative z-20 w-5 h-5 flex items-center justify-center">
                              {isCompleted ? (
                                <FaCheckCircle className="text-green-600 text-lg" />
                              ) : isCurrent ? (
                                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                              ) : (
                                <div className="w-3 h-3 bg-gray-300 rounded-full" />
                              )}
                            </div>

                            {/* Label & Time */}
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  isCompleted || isCurrent
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-xs text-gray-500">
                                {step.time
                                  ? new Date(step.time).toLocaleString()
                                  : "Pending"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
