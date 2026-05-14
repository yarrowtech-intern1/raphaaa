import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaBoxOpen, FaUsers, FaRupeeSign } from "react-icons/fa";
import { fetchAllOrders } from "../redux/slices/adminOrderSlice";
import { fetchUsers } from "../redux/slices/adminSlice";
import { fetchAdminProducts } from "../redux/slices/adminProductSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import axios from "axios";
import { GiLetterBomb } from "react-icons/gi";
import { LuMessageSquareText } from "react-icons/lu";

const AdminHomePage = () => {
  const dispatch = useDispatch();

  const { orders } = useSelector((state) => state.adminOrders);
  const { users } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.adminProducts);

  const [revenue, setRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [latestMessages, setLatestMessages] = useState([]); // NEW

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = localStorage.getItem("userToken"); // Get token from localStorage
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/orders/revenue/total`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTotalRevenue(data.totalRevenue);
      } catch (err) {
        console.error("Error fetching revenue", err);
      }
    };

    if (user?.role === "merchantise" || user?.role === "admin") {
      fetchRevenue();
    }
  }, [user]);

  // 🚀 Fetch subscribers and messages
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem("userToken");

        const [subsRes, msgsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subscribers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/contact`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSubscribersCount(subsRes.data.length);
        setMessagesCount(msgsRes.data.length);
        setLatestMessages(msgsRes.data.slice(0, 5)); // NEW: store latest 5
      } catch (err) {
        console.error("Error fetching counts", err);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    dispatch(fetchAllOrders());
    dispatch(fetchUsers());
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  useEffect(() => {
    const totalRevenue = orders.reduce(
      (acc, order) => acc + order.totalPrice,
      0
    );
    setRevenue(totalRevenue);
    setOrderCount(orders.length);

    const trendMap = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      trendMap[date] = (trendMap[date] || 0) + 1;
    });
    const trendArray = Object.keys(trendMap).map((date) => ({
      date,
      orders: trendMap[date],
    }));
    setChartData(trendArray);
  }, [orders]);

  useEffect(() => {
    setUserCount(users.length);
  }, [users]);

  useEffect(() => {
    setProductCount(products.length);
  }, [products]);

  const useCountUp = (end, duration = 5) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const increment = end / (duration / 16);
      const animate = () => {
        start += increment;
        if (start < end) {
          setCount(Math.floor(start));
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };
      animate();
    }, [end, duration]);
    return count;
  };

  const countOrders = useCountUp(orderCount);
  const countProducts = useCountUp(productCount);
  const countUsers = useCountUp(userCount);
  const countSubscribers = useCountUp(subscribersCount);
  const countMessages = useCountUp(messagesCount);

  const pieData = [
    {
      name: "Processing",
      value: orders.filter((order) => order.status === "Processing").length,
    },
    {
      name: "Shipped",
      value: orders.filter((order) =>
        ["Shipped", "Pickup Scheduled", "Picked Up", "In Transit", "Out For Delivery"].includes(order.status)
      ).length,
    },
    {
      name: "Delivered",
      value: orders.filter((order) => order.status === "Delivered").length,
    },
    {
      name: "Cancelled",
      value: orders.filter((order) => order.status === "Cancelled").length,
    },
  ];

  const COLORS = ["#facc15", "#38bdf8", "#22c55e", "#ef4444"];

  const percentChange = useMemo(() => {
    if (!chartData || chartData.length < 2) return 0;

    // Get last two weeks data
    const lastWeek = chartData[chartData.length - 2]?.orders || 0;
    const thisWeek = chartData[chartData.length - 1]?.orders || 0;

    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;

    return (((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1);
  }, [chartData]);

  const deliveredPercent = useMemo(() => {
    if (!pieData || pieData.length === 0) return 0;

    const total = pieData.reduce((acc, item) => acc + item.value, 0);
    const delivered = pieData.find((p) => p.name === "Delivered")?.value || 0;

    if (total === 0) return 0;

    return ((delivered / total) * 100).toFixed(0);
  }, [pieData]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {user.role === "admin"
          ? "Admin"
          : user.role === "merchantise"
            ? "Merchandise"
            : user.role === "marketing"
              ? "Marketing"
              : "Customer"}{" "}
        Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Orders */}
        {(user?.role === "admin" || user?.role === "merchantise") && (
          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all border border-green-200 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-200 rounded-full opacity-30 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-4 w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg">
                <FaShoppingCart className="text-2xl" />
              </div>
              <div>
                <h2 className="text-md font-semibold text-gray-700">Total Orders</h2>
                <p className="text-3xl font-bold text-green-700">{countOrders}</p>
              </div>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm text-green-700 hover:underline font-medium relative z-10"
            >
              {user?.role === "merchantise" ? "View Sales →" : "Manage Orders →"}
            </Link>
          </div>
        )}

        {/* Products */}
        {(user?.role === "admin" || user?.role === "merchantise") && (
          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all border border-purple-200 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-200 rounded-full opacity-30 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-4 w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg">
                <FaBoxOpen className="text-2xl" />
              </div>
              <div>
                <h2 className="text-md font-semibold text-gray-700">Total Products</h2>
                <p className="text-3xl font-bold text-purple-700">{countProducts}</p>
              </div>
            </div>
            <Link
              to="/admin/products"
              className="text-sm text-purple-700 hover:underline font-medium relative z-10"
            >
              Manage Products →
            </Link>
          </div>
        )}

        {/* Users (admin only) */}
        {user?.role === "admin" && (
          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all border border-yellow-200 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-200 rounded-full opacity-30 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-4 w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg">
                <FaUsers className="text-2xl" />
              </div>
              <div>
                <h2 className="text-md font-semibold text-gray-700">Total Users</h2>
                <p className="text-3xl font-bold text-yellow-700">{countUsers}</p>
              </div>
            </div>
            <Link
              to="/admin/users"
              className="text-sm text-yellow-700 hover:underline font-medium relative z-10"
            >
              Manage Users →
            </Link>
          </div>
        )}

        {/* Revenue */}
        {(user?.role === "admin" || user?.role === "merchantise") && (
          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all border border-blue-200 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-200 rounded-full opacity-30 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-4 w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg">
                <FaRupeeSign className="text-2xl" />
              </div>
              <div>
                <h2 className="text-md font-semibold text-gray-700">Total Revenue</h2>
                <p className="text-3xl font-bold text-blue-700">₹{totalRevenue}</p>
              </div>
            </div>
            <Link
              to="/admin/revenue"
              className="text-sm text-blue-700 hover:underline font-medium relative z-10"
            >
              {user?.role === "merchantise" ? "View Sales →" : "Revenue Report →"}
            </Link>
          </div>
        )}

        {/* Subscribers (Dynamic) */}
        {(user?.role === "admin" || user?.role === "marketing") && (
          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all border border-pink-200 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-pink-200 rounded-full opacity-30 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-4 w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-lg">
                <GiLetterBomb className="text-2xl" />
              </div>
              <div>
                <h2 className="text-md font-semibold text-gray-700">Total Subscribers</h2>
                <p className="text-3xl font-bold text-pink-700">{countSubscribers}</p>
              </div>
            </div>
            <Link to="/admin/subscribed-users" className="text-sm text-pink-700 hover:underline font-medium relative z-10">
              View Subscribers →
            </Link>
          </div>
        )}

        {/* Messages (Dynamic) */}
        {(user?.role === "admin" || user?.role === "marketing") && (
          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all border border-indigo-200 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-200 rounded-full opacity-30 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-4 w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg">
                <LuMessageSquareText className="text-2xl" />
              </div>
              <div>
                <h2 className="text-md font-semibold text-gray-700">Total Messages</h2>
                <p className="text-3xl font-bold text-indigo-700">{countMessages}</p>
              </div>
            </div>
            <Link to="/admin/contact-messages" className="text-sm text-indigo-700 hover:underline font-medium relative z-10">
              View Messages →
            </Link>
          </div>
        )}
      </div>

      {/* Order Trend and Status Charts */}
      {(user?.role === "admin" || user?.role === "merchantise") && (
        <div className="mt-12">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight">
            Order Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Line Chart */}
            <div className="group relative bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-2xl"></div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Order Trends
                </h3>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full shadow-sm ${percentChange >= 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                    }`}
                >
                  {percentChange >= 0 ? "📈" : "📉"} {percentChange}% this week
                </span>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
                    }}
                    itemStyle={{ color: "#111827", fontWeight: 500 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6, fill: "#2563eb" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="group relative bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl"></div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Order Status Distribution
                </h3>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-700 shadow-sm">
                  {deliveredPercent}% Delivered
                </span>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
                    }}
                    itemStyle={{ color: "#111827", fontWeight: 500 }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "13px", marginTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {(user?.role === "admin" || user?.role === "merchantise") && (
        <div className="mt-12">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 tracking-tight">
            Recent Orders
          </h2>

          <div className="relative bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100/80 text-xs uppercase tracking-wide text-gray-600">
                  <tr>
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Total Price</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order, idx) => (
                    <tr
                      key={order._id}
                      className={`transition-all duration-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-green-50`}
                    >
                      <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                        #{order._id}
                      </td>
                      <td className="py-4 px-6">{order.user?.name || "Unknown"}</td>
                      <td className="py-4 px-6 font-semibold text-blue-600">
                        ₹{order.totalPrice?.toFixed(2) || 0}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Processing"
                              ? "bg-yellow-100 text-yellow-700"
                              : ["Shipped", "Pickup Scheduled", "Picked Up", "In Transit", "Out For Delivery"].includes(order.status)
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                          {order.status === "Delivered"}
                          {order.status === "Processing"}
                          {order.status === "Shipped"}
                          {order.status === "Cancelled"}
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 px-6 text-center text-gray-500 italic"
                      >
                        No recent orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recent User Signups */}
      {(user?.role === "admin" || user?.role === "merchantise") && (
        <div className="mt-12">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 tracking-tight">
            Recent User Signups
          </h2>

          <div className="relative bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-pink-500"></div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100/80 text-xs uppercase tracking-wide text-gray-600">
                  <tr>
                    <th className="py-4 px-6">User Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .slice(-5)
                    .reverse()
                    .map((user, idx) => (
                      <tr
                        key={user._id}
                        className={`transition-all duration-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-yellow-50`}
                      >
                        <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                          {user.name}
                        </td>
                        <td className="py-4 px-6 text-gray-700">{user.email}</td>
                        <td className="py-4 px-6 text-gray-500">
                          {new Date(user.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-6 px-6 text-center text-gray-500 italic"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Latest 5 Messages */}
      {(user?.role === "admin" || user?.role === "merchantise" || user?.role === "marketing") && (
        <div className="mt-12">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 tracking-tight">
            Latest Contact Messages
          </h2>

          <div className="relative bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-sky-500"></div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100/80 text-xs uppercase tracking-wide text-gray-600">
                  <tr>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Subject</th>
                    <th className="py-4 px-6">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {latestMessages.map((msg, idx) => (
                    <tr
                      key={msg._id}
                      className={`transition-all duration-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-indigo-50`}
                    >
                      <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                        {msg.name}
                      </td>
                      <td className="py-4 px-6 text-gray-700">{msg.subject}</td>
                      <td className="py-4 px-6 text-gray-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {latestMessages.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-6 px-6 text-center text-gray-500 italic"
                      >
                        No messages found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end p-4">
              <Link
                to="/admin/contact-messages"
                className="text-sm font-medium text-indigo-700 hover:underline"
              >
                View all messages →
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminHomePage;
