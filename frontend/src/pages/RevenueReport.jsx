import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRupeeSign, FaCalendarAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const RevenueReport = () => {
  const { userInfo: user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

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
  }, [period, user, navigate]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
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

          {/* Period segmented control */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {["daily", "weekly", "monthly", "yearly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
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

        {/* Date range chip (shows only if API provides meta.startDate/endDate) */}
        {!loading && revenueData?.meta && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
              <FaCalendarAlt className="text-gray-500" />
              {new Date(revenueData.meta.startDate).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              —{" "}
              {new Date(revenueData.meta.endDate).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="mt-4 space-y-6">
          {/* KPI skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
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
          {/* Table skeleton */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="h-10 bg-gray-100 rounded-t-2xl" />
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      ) : revenueData ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Total Revenue */}
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-blue-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md">
                  <FaRupeeSign className="text-xl" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-600">
                    Total Revenue
                  </h2>
                  <p className="text-3xl font-extrabold text-blue-700">
                    ₹{Number(revenueData.totalRevenue).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 rounded" />
            </div>

            {/* Total Orders */}
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-green-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md">
                  <FaCalendarAlt className="text-xl" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-600">
                    Total Orders
                  </h2>
                  <p className="text-3xl font-extrabold text-green-700">
                    {Number(revenueData.totalOrders).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 rounded" />
            </div>
          </div>

          {/* Products Sold — auto-fits to whatever fields backend returns */}
          {Array.isArray(revenueData?.productsSold) &&
            revenueData.productsSold.length > 0 && (() => {
              const rows = revenueData.productsSold;

              // Detect optional fields so we only render what exists
              const hasCategory    = rows.some(r => r.category);
              const hasSKU         = rows.some(r => r.sku);
              const hasSize        = rows.some(r => r.size);
              const hasColor       = rows.some(r => r.color);
              const hasUnitPrice   = rows.some(r => r.unitPrice != null || r.price != null);
              const hasGrossSales  = rows.some(r => r.grossSales != null);
              const hasOrdersCount = rows.some(r => r.ordersCount != null);
              const hasFirstSold   = rows.some(r => r.firstSoldAt);
              const hasLastSold    = rows.some(r => r.lastSoldAt);

              const getUnitPrice = (p) => Number(p.unitPrice ?? p.price ?? 0);
              const getGross     = (p) => Number(p.grossSales ?? ((Number(p.totalSold||0)) * getUnitPrice(p)));

              const totalQty    = rows.reduce((s, x) => s + Number(x.totalSold || 0), 0);
              const totalGross  = rows.reduce((s, x) => s + getGross(x), 0);
              const totalOrders = rows.reduce((s, x) => s + Number(x.ordersCount || 0), 0);

              return (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-2xl font-semibold text-gray-900">Products Sold</h2>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {rows.length} lines
                      </span>
                      <button
                        onClick={() => {
                          const headers = [
                            "Product",
                            ...(hasCategory    ? ["Category"] : []),
                            ...(hasSKU         ? ["SKU"] : []),
                            ...(hasSize        ? ["Size"] : []),
                            ...(hasColor       ? ["Color"] : []),
                            ...(hasUnitPrice   ? ["Unit Price"] : []),
                            "Qty Sold",
                            "Gross Sales",
                            ...(hasOrdersCount ? ["Orders"] : []),
                            ...(hasFirstSold   ? ["First Sold"] : []),
                            ...(hasLastSold    ? ["Last Sold"] : []),
                          ];

                          const body = rows.map(p => ([
                            p.name,
                            ...(hasCategory    ? [p.category || "N/A"] : []),
                            ...(hasSKU         ? [p.sku || "-"] : []),
                            ...(hasSize        ? [p.size || "-"] : []),
                            ...(hasColor       ? [p.color || "-"] : []),
                            ...(hasUnitPrice   ? [getUnitPrice(p)] : []),
                            Number(p.totalSold || 0),
                            getGross(p),
                            ...(hasOrdersCount ? [Number(p.ordersCount || 0)] : []),
                            ...(hasFirstSold   ? [p.firstSoldAt ? new Date(p.firstSoldAt).toISOString() : ""] : []),
                            ...(hasLastSold    ? [p.lastSoldAt  ? new Date(p.lastSoldAt ).toISOString() : ""] : []),
                          ]));

                          const rowsCSV = [headers, ...body];
                          const csv = rowsCSV.map(r => r.map(v => {
                            const s = String(v ?? "");
                            return /[",\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;
                          }).join(",")).join("\n");

                          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `revenue_${period}.csv`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition">
                    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-500" />
                    <div className="overflow-x-auto">
                      <table className="min-w-[960px] w-full text-left text-sm text-gray-700">
                        <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur text-xs uppercase text-gray-600 border-b">
                          <tr>
                            <th className="px-6 py-3.5 font-semibold tracking-wide">Product</th>
                            {hasCategory    && <th className="px-6 py-3.5 font-semibold tracking-wide">Category</th>}
                            {hasSKU         && <th className="px-6 py-3.5 font-semibold tracking-wide">SKU</th>}
                            {hasSize        && <th className="px-6 py-3.5 font-semibold tracking-wide">Size</th>}
                            {hasColor       && <th className="px-6 py-3.5 font-semibold tracking-wide">Color</th>}
                            {hasUnitPrice   && <th className="px-6 py-3.5 font-semibold tracking-wide text-right">Unit Price</th>}
                            <th className="px-6 py-3.5 font-semibold tracking-wide text-right">Qty</th>
                            <th className="px-6 py-3.5 font-semibold tracking-wide text-right">Gross Sales</th>
                            {hasOrdersCount && <th className="px-6 py-3.5 font-semibold tracking-wide text-right">Orders</th>}
                            {hasFirstSold   && <th className="px-6 py-3.5 font-semibold tracking-wide">First Sold</th>}
                            {hasLastSold    && <th className="px-6 py-3.5 font-semibold tracking-wide">Last Sold</th>}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                          {rows.map((p, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                              {hasCategory && (
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
                                    {p.category || "N/A"}
                                  </span>
                                </td>
                              )}
                              {hasSKU       && <td className="px-6 py-4">{p.sku || "-"}</td>}
                              {hasSize      && <td className="px-6 py-4">{p.size || "-"}</td>}
                              {hasColor     && <td className="px-6 py-4">{p.color || "-"}</td>}
                              {hasUnitPrice && (
                                <td className="px-6 py-4 text-right tabular-nums">
                                  ₹{getUnitPrice(p).toLocaleString("en-IN")}
                                </td>
                              )}
                              <td className="px-6 py-4 text-right tabular-nums">
                                {Number(p.totalSold || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="px-6 py-4 text-right tabular-nums">
                                ₹{getGross(p).toLocaleString("en-IN")}
                              </td>
                              {hasOrdersCount && (
                                <td className="px-6 py-4 text-right tabular-nums">
                                  {Number(p.ordersCount || 0).toLocaleString("en-IN")}
                                </td>
                              )}
                              {hasFirstSold && (
                                <td className="px-6 py-4">
                                  {p.firstSoldAt ? new Date(p.firstSoldAt).toLocaleString("en-IN") : "-"}
                                </td>
                              )}
                              {hasLastSold && (
                                <td className="px-6 py-4">
                                  {p.lastSoldAt ? new Date(p.lastSoldAt).toLocaleString("en-IN") : "-"}
                                </td>
                              )}
                            </tr>
                          ))}

                          {/* Totals row */}
                          <tr className="bg-gray-50 font-semibold text-gray-900">
                            <td
                              className="px-6 py-3.5"
                              colSpan={
                                1 +
                                (hasCategory ? 1 : 0) +
                                (hasSKU ? 1 : 0) +
                                (hasSize ? 1 : 0) +
                                (hasColor ? 1 : 0) +
                                (hasUnitPrice ? 1 : 0)
                              }
                            >
                              Total
                            </td>
                            <td className="px-6 py-3.5 text-right tabular-nums">
                              {totalQty.toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-3.5 text-right tabular-nums">
                              ₹{totalGross.toLocaleString("en-IN")}
                            </td>
                            {hasOrdersCount && (
                              <td className="px-6 py-3.5 text-right tabular-nums">
                                {totalOrders.toLocaleString("en-IN")}
                              </td>
                            )}
                            {(hasFirstSold || hasLastSold) && (
                              <td
                                className="px-6 py-3.5"
                                colSpan={(hasFirstSold ? 1 : 0) + (hasLastSold ? 1 : 0)}
                              />
                            )}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
        </>
      ) : (
        <p className="text-red-500">No data found for selected period.</p>
      )}
    </div>
  );
};

export default RevenueReport;
