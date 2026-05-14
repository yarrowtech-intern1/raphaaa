import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRupeeSign, FaCalendarAlt } from "react-icons/fa";
import { useSelector } from "react-redux";

const RevenueReport = () => {
  const { userInfo: user } = useSelector((state) => state.auth);
  const [period, setPeriod] = useState("monthly");
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("userToken");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/api/orders/revenue/${period}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRevenueData(data);
      } catch (error) {
        console.error("Fetch error:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [period, user, token, backendUrl]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 bg-clip-text text-transparent">
              Revenue Report
            </span>{" "}
            <span className="text-gray-500 text-xl font-semibold">
              ({period.charAt(0).toUpperCase() + period.slice(1)})
            </span>
          </h1>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {["daily", "weekly", "monthly", "yearly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? "bg-indigo-600 text-white shadow"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {!loading && revenueData?.meta && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
              <FaCalendarAlt className="text-gray-500" />
              {new Date(revenueData.meta.startDate).toLocaleString("en-IN")} -{" "}
              {new Date(revenueData.meta.endDate).toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/70 shadow-xl backdrop-blur border border-gray-100 animate-pulse"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="space-y-2 w-40">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-5 bg-gray-200 rounded w-32" />
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      ) : revenueData ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-blue-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md">
                  <FaRupeeSign className="text-xl" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-600">
                    Total Revenue
                  </h2>
                  <p className="text-3xl font-extrabold text-blue-700">
                    ₹{Number(revenueData.totalRevenue || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 rounded" />
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-sm border border-green-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md">
                  <FaCalendarAlt className="text-xl" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-600">
                    Total Orders
                  </h2>
                  <p className="text-3xl font-extrabold text-green-700">
                    {Number(revenueData.totalOrders || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 rounded" />
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-sm border border-violet-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-600 text-white shadow-md">
                  <FaCalendarAlt className="text-xl" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-600">
                    Products Sold
                  </h2>
                  <p className="text-3xl font-extrabold text-violet-700">
                    {Number(revenueData.totalProductsSold || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500 rounded" />
            </div>
          </div>

          {Array.isArray(revenueData?.periodBreakdown) &&
            revenueData.periodBreakdown.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  {period.charAt(0).toUpperCase() + period.slice(1)} Breakdown
                </h2>
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="min-w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-600 border-b">
                      <tr>
                        <th className="px-6 py-3.5 font-semibold tracking-wide">
                          {period === "daily"
                            ? "Hour"
                            : period === "yearly"
                            ? "Month"
                            : "Date"}
                        </th>
                        <th className="px-6 py-3.5 font-semibold tracking-wide text-right">
                          Orders
                        </th>
                        <th className="px-6 py-3.5 font-semibold tracking-wide text-right">
                          Products Sold
                        </th>
                        <th className="px-6 py-3.5 font-semibold tracking-wide text-right">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {revenueData.periodBreakdown.map((row) => (
                        <tr key={row.label}>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {row.label}
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums">
                            {Number(row.totalOrders || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums">
                            {Number(row.totalProductsSold || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums">
                            ₹{Number(row.totalRevenue || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {Array.isArray(revenueData?.transactions) &&
            revenueData.transactions.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Detailed Transactions
                </h2>
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="min-w-[1200px] w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-600 border-b">
                      <tr>
                        <th className="px-6 py-3.5 font-semibold tracking-wide">
                          Paid At
                        </th>
                        <th className="px-6 py-3.5 font-semibold tracking-wide">
                          Username
                        </th>
                        <th className="px-6 py-3.5 font-semibold tracking-wide">
                          Email
                        </th>
                        <th className="px-6 py-3.5 font-semibold tracking-wide">
                          Order ID
                        </th>
                        <th className="px-6 py-3.5 font-semibold tracking-wide">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3.5 font-semibold tracking-wide">
                          Payment
                        </th>
                        <th className="px-6 py-3.5 font-semibold tracking-wide text-right">
                          Items Qty
                        </th>
                        <th className="px-6 py-3.5 font-semibold tracking-wide text-right">
                          Amount
                        </th>
                        <th className="px-6 py-3.5 font-semibold tracking-wide">
                          Product Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {revenueData.transactions.map((tx) => (
                        <tr key={tx.orderDbId} className="align-top">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tx.paidAt
                              ? new Date(tx.paidAt).toLocaleString("en-IN")
                              : "-"}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {tx.username || "-"}
                          </td>
                          <td className="px-6 py-4">{tx.userEmail || "-"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tx.orderId || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tx.transactionId || "-"}
                          </td>
                          <td className="px-6 py-4 capitalize">
                            {(tx.paymentMethod || "-").replaceAll("_", " ")}
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums">
                            {Number(tx.itemQuantity || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums font-semibold text-gray-900">
                            ₹{Number(tx.totalPrice || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 min-w-[280px]">
                            <div className="space-y-2">
                              {(tx.items || []).map((item, idx) => (
                                <div
                                  key={`${tx.orderDbId}-${idx}`}
                                  className="text-xs text-gray-700 border border-gray-200 rounded-md px-2.5 py-1.5 bg-gray-50"
                                >
                                  <div className="font-medium text-gray-900">
                                    {item.name}
                                  </div>
                                  <div>
                                    SKU: {item.sku || "-"} | Size: {item.size || "-"} |
                                    Color: {item.color || "-"}
                                  </div>
                                  <div>
                                    Qty: {Number(item.quantity || 0)} | Unit: ₹
                                    {Number(item.unitPrice || 0).toLocaleString("en-IN")}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </>
      ) : (
        <p className="text-red-500">No data found for selected period.</p>
      )}
    </div>
  );
};

export default RevenueReport;
