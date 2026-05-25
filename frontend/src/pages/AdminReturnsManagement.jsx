import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminReturnRequests, updateReturnRequestStatus } from "../redux/slices/orderSlice";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  "all",
  "requested",
  "approved",
  "rejected",
  "pickup_scheduled",
  "picked_up",
  "in_transit_to_warehouse",
  "received_at_warehouse",
  "replacement_dispatched",
  "replacement_delivered",
  "refund_completed",
];

const AdminReturnsManagement = () => {
  const dispatch = useDispatch();
  const { adminReturnRequests, loading, error } = useSelector((state) => state.orders);
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => {
    dispatch(fetchAdminReturnRequests());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const list = Array.isArray(adminReturnRequests) ? adminReturnRequests : [];
    if (statusFilter === "all") return list;
    return list.filter((r) => r.status === statusFilter);
  }, [adminReturnRequests, statusFilter]);

  const runAction = async (id, action, note = "") => {
    const key = `${id}:${action}`;
    setBusyAction(key);
    const res = await dispatch(updateReturnRequestStatus({ returnRequestId: id, action, payload: note ? { note } : {} }));
    setBusyAction("");
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Return request updated");
    } else {
      toast.error(res.payload?.message || "Failed to update return request");
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Returns Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage return window requests, pickup, and refund/replacement statuses.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All statuses" : s.replaceAll("_", " ")}</option>
            ))}
          </select>
          <button
            onClick={() => dispatch(fetchAdminReturnRequests())}
            className="px-3 py-2 rounded-lg text-sm font-semibold border border-sky-200 bg-sky-50 text-sky-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading return requests...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {!filtered.length && !loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500">
            No return requests found.
          </div>
        )}

        {filtered.map((r) => {
          const ship = r?.shiprocketReverse || {};
          const orderId = r?.order?.orderId || String(r?.order || "").slice(-8).toUpperCase();
          return (
            <div key={r._id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-gray-800">#{orderId} · {r.requestType}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.user?.name} · {r.user?.email}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 capitalize">
                  {String(r.status || "").replaceAll("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="font-semibold text-gray-700">Reason</p>
                  <p className="text-gray-600 mt-1">{r.reason || "-"}</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="font-semibold text-gray-700">Damage</p>
                  <p className="text-gray-600 mt-1">{r.damageType || "-"}</p>
                  {r.damageDescription ? <p className="text-gray-500 mt-1">{r.damageDescription}</p> : null}
                </div>
                <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="font-semibold text-gray-700">Shiprocket Reverse</p>
                  <p className="text-gray-600 mt-1">AWB: {ship.awbCode || "-"}</p>
                  <p className="text-gray-500">Tracking: {ship.trackingStatus || "-"}</p>
                </div>
              </div>

              {!!r.evidenceImages?.length && (
                <div className="flex flex-wrap gap-2">
                  {r.evidenceImages.slice(0, 5).map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="block w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} alt="evidence" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {[
                  { action: "approve", label: "Approve" },
                  { action: "reject", label: "Reject" },
                  { action: "sync-shiprocket", label: "Sync Shiprocket" },
                  { action: "picked-up", label: "Mark Picked Up" },
                  { action: "received", label: "Mark Received" },
                  { action: "replacement-dispatched", label: "Replacement Dispatched" },
                  { action: "replacement-delivered", label: "Replacement Delivered" },
                  { action: "refund-complete", label: "Refund Complete" },
                ].map((btn) => {
                  const key = `${r._id}:${btn.action}`;
                  return (
                    <button
                      key={btn.action}
                      onClick={() => runAction(r._id, btn.action)}
                      disabled={busyAction === key}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                    >
                      {busyAction === key ? "Working..." : btn.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminReturnsManagement;
