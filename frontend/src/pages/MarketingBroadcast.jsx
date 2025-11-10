// src/pages/MarketingBroadcast.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders, clearError } from "../redux/slices/adminOrderSlice";
import { toast } from "sonner";
import { FaUsers, FaShoppingBag, FaEnvelopeOpenText } from "react-icons/fa";
import { MdOutlineContentPaste } from "react-icons/md";

/* ✅ NEW: Jodit editor import */
import JoditEditor from "jodit-react";

const Chip = ({ children, className = "" }) => (
  <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full border ${className}`}>
    {children}
  </span>
);

const SectionCard = ({ title, children, subtitle }) => (
  <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-5 shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
    {subtitle ? <p className="text-xs text-gray-500 mb-3">{subtitle}</p> : null}
    {children}
  </div>
);

const MarketingBroadcast = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { orders, loading: ordersLoading, error: ordersError } = useSelector((s) => s.adminOrders);

  const [audience, setAudience] = useState("buyers"); // 'buyers' | 'subscribers' | 'custom'
  const [subscribers, setSubscribers] = useState([]);
  const [customList, setCustomList] = useState(""); // comma/line separated emails
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState(""); // will store HTML from Jodit
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  /* ✅ NEW: Jodit ref + config (safe defaults) */
  const editorRef = useRef(null);
  const joditConfig = useMemo(
    () => ({
      readonly: false,
      minHeight: 240,
      toolbarAdaptive: false,
      toolbarSticky: false,
      spellcheck: true,
      statusbar: false,
      // Keep HTML clean but allow links, bold, images, etc.
      removeButtons: ["file", "print"],
    }),
    []
  );

  // Load data depending on audience
  useEffect(() => {
    if (audience === "buyers") {
      dispatch(fetchAllOrders()); // keeps your existing flow (/api/admin/orders)
    } else if (audience === "subscribers") {
      const loadSubs = async () => {
        try {
          const token = localStorage.getItem("userToken");
          const { data } = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/subscribers`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setSubscribers(data || []);
        } catch {
          toast.error("Failed to fetch subscribers");
        }
      };
      loadSubs();
    }
  }, [audience, dispatch]);

  // Derived recipients
  const buyerEmails = useMemo(() => {
    if (!orders || !orders.length) return [];
    const set = new Set();
    for (const o of orders) {
      const email = o?.user?.email; // relies on populated orders
      if (email) set.add(email.toLowerCase());
    }
    return [...set];
  }, [orders]); // reads o.user.email as in your original file

  const subscriberEmails = useMemo(() => {
    if (!subscribers || !subscribers.length) return [];
    return subscribers
      .filter((s) => s.isSubscribed && s.email)
      .map((s) => s.email.toLowerCase());
  }, [subscribers]);

  const customEmails = useMemo(() => {
    if (!customList.trim()) return [];
    return customList
      .split(/[\s,;]+/g)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }, [customList]);

  const selectedEmails = useMemo(() => {
    if (audience === "buyers") return buyerEmails;
    if (audience === "subscribers") return subscriberEmails;
    return customEmails;
  }, [audience, buyerEmails, subscriberEmails, customEmails]);

  const handleCopy = async () => {
    if (!selectedEmails.length) return;
    try {
      await navigator.clipboard.writeText(selectedEmails.join(", "));
      toast.success("Recipient list copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    if (selectedEmails.length === 0) {
      toast.error("No recipients found for the selected audience");
      return;
    }

    try {
      setSending(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/contact/reply`,
        {
          to: selectedEmails.join(","), // nodemailer accepts comma-separated list
          subject,
          message, // HTML from Jodit
        }
      );
      toast.success(`Email sent to ${selectedEmails.length} recipient(s)`);
      // (optional) reset fields
      // setSubject(""); setMessage(""); setCustomList("");
    } catch (err) {
      toast.error("Failed to send emails");
    } finally {
      setSending(false);
    }
  };

  // Guard: only marketing/admin should see this (kept)
  const canAccess = user?.role === "marketing" || user?.role === "admin";
  if (!canAccess) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-xl font-semibold text-red-600">
          You do not have permission to access this page.
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-extrabold text-gray-800">Marketing Broadcast</h1>
        <Chip className="border-sky-300 text-sky-700 bg-sky-50">
          Role: {user?.role}
        </Chip>
      </div>
      <p className="text-sm text-gray-600 mb-5">
        Send a custom email to customers who ordered or to newsletter subscribers. You can also paste a custom list of recipients.
      </p>

      {/* Error banner */}
      {ordersError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start justify-between gap-3">
          <div>
            <strong className="mr-2">Couldn’t load orders.</strong>
            <span>{typeof ordersError === "string" ? ordersError : (ordersError?.message || "Forbidden or not authorized")}</span>
          </div>
          <button
            onClick={() => {
              dispatch(clearError());
              dispatch(fetchAllOrders());
            }}
            className="shrink-0 px-3 py-1 rounded-md border border-red-300 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-8">
        {/* Audience */}
        <SectionCard title="Target Audiences" subtitle="Choose who should receive this email.">
          <div className="grid sm:grid-cols-3 gap-4">
            <label className={`flex items-center justify-between p-3 rounded-xl border ${audience === "buyers" ? "border-indigo-500 bg-indigo-50" : "bg-white border-gray-200"}`}>
              <span className="flex items-center gap-2 font-medium">
                <FaShoppingBag /> Buyers
              </span>
              <input
                type="radio"
                name="audience"
                value="buyers"
                checked={audience === "buyers"}
                onChange={() => setAudience("buyers")}
              />
            </label>

            <label className={`flex items-center justify-between p-3 rounded-xl border ${audience === "subscribers" ? "border-emerald-500 bg-emerald-50" : "bg-white border-gray-200"}`}>
              <span className="flex items-center gap-2 font-medium">
                <FaUsers /> Subscribers
              </span>
              <input
                type="radio"
                name="audience"
                value="subscribers"
                checked={audience === "subscribers"}
                onChange={() => setAudience("subscribers")}
              />
            </label>

            <label className={`flex items-center justify-between p-3 rounded-xl border ${audience === "custom" ? "border-indigo-500 bg-indigo-50" : "bg-white border-gray-200"}`}>
              <span className="flex items-center gap-2 font-medium">
                <MdOutlineContentPaste /> Custom list
              </span>
              <input
                type="radio"
                name="audience"
                value="custom"
                checked={audience === "custom"}
                onChange={() => setAudience("custom")}
              />
            </label>
          </div>

          {/* Audience stats */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <Chip className="border-gray-300 text-gray-700 bg-white">
              {audience === "buyers" && (ordersLoading ? "Loading buyers…" : `${buyerEmails.length} unique buyer email(s)`)}
              {audience === "subscribers" && `${subscriberEmails.length} subscribed email(s)`}
              {audience === "custom" && `${customEmails.length} in custom list`}
            </Chip>

            <Chip className="border-gray-300 text-gray-700 bg-white">
              Selected: {selectedEmails.length}
            </Chip>

            <button
              type="button"
              onClick={() => setShowPreview((s) => !s)}
              className="text-xs px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
            >
              {showPreview ? "Hide" : "Show"} preview
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!selectedEmails.length}
              className="text-xs px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              Copy recipients
            </button>
          </div>

          {/* Custom list input */}
          {audience === "custom" && (
            <textarea
              value={customList}
              onChange={(e) => setCustomList(e.target.value)}
              placeholder="Paste emails separated by commas, spaces, or new lines"
              className="bg-white outline-none mt-4 w-full min-h-28 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
            />
          )}

          {/* Email preview (collapsible) */}
          {showPreview && (
            <div className="mt-3 max-h-40 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700">
              {selectedEmails.length ? selectedEmails.join(", ") : "No recipients to preview."}
            </div>
          )}
        </SectionCard>

        {/* Subject / Message */}
        <SectionCard
          title="Email Content"
          subtitle="Write the subject and the body. Basic HTML is supported on the server template."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Left: Inputs */}
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M4 8l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Exclusive offer just for you!"
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-3 focus:ring-2 focus:ring-sky-400 outline-none"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>Make it specific and benefits‑driven.</span>
                  <span>{subject?.length || 0} chars</span>
                </div>
              </div>

              {/* ✅ REPLACED: Textarea -> JoditEditor */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Message <span className="text-gray-400">(rich text / HTML)</span>
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-3 text-gray-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16M4 9h16M4 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>

                  {/* The editor itself (kept layout paddings by wrapping) */}
                  <div className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-3">
                    <JoditEditor
                      ref={editorRef}
                      value={message}
                      config={joditConfig}
                      // onBlur gives final HTML; onChange fires often — both are fine.
                      onBlur={(newContent) => setMessage(newContent)}
                      onChange={(newContent) => setMessage(newContent)}
                    />
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Tip: Your server already wraps messages in a styled email template.
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border px-2 py-1 text-gray-600">Supports formatting, links, images</span>
                  <span className="rounded-full border px-2 py-1 text-gray-600">Keep under ~500 words</span>
                </div>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-inner">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-800">Live Preview</p>
                <span className="text-xs text-gray-500">
                  {message?.trim() ? "Rendering HTML" : "Nothing to preview"}
                </span>
              </div>
              <div className="prose max-w-none px-4 py-4 text-sm text-gray-800 min-h-[220px] overflow-auto">
                {message?.trim() ? (
                  <div dangerouslySetInnerHTML={{ __html: message }} />
                ) : (
                  <div className="text-gray-400">
                    Start typing your message to see a live preview…
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Footer / Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <FaEnvelopeOpenText className="inline mr-1 mb-1" />
            Send to <strong>{selectedEmails.length}</strong> recipient(s)
          </div>
          <button
            type="submit"
            disabled={sending || !selectedEmails.length}
            className="bg-gradient-to-r from-sky-600 to-blue-600 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-lg shadow-md disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send Email"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarketingBroadcast;
