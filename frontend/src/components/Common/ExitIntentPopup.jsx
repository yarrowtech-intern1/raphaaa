import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const STORAGE_KEY = "exitIntentFirstOrderCouponSeen";

const ExitIntentPopup = () => {
  const [visible, setVisible]     = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount,  setDiscount]   = useState("10%");

  // Fetch config from admin settings
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/settings/contact`)
      .then(({ data }) => {
        if (data?.exitIntentEnabled === false) return; // admin disabled it
        if (data?.exitIntentCoupon) setCouponCode(data.exitIntentCoupon);
        if (data?.exitIntentDiscount) setDiscount(data.exitIntentDiscount);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!couponCode) return; // don't attach until we have config
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen === "1") return;

    const onMouseLeave = (e) => {
      if (e.clientY <= 5) setVisible(true);
    };
    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, [couponCode]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const copied = () => {
    navigator.clipboard.writeText(couponCode);
    dismiss();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={dismiss}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg transition z-10"
        >
          ×
        </button>

        {/* Banner */}
        <div className="bg-linear-to-br from-rose-500 to-pink-600 p-8 text-white text-center">
          <p className="text-4xl mb-2">🛍️</p>
          <h2 className="text-2xl font-extrabold mb-1">Wait! Don't go yet</h2>
          <p className="text-rose-100 text-sm">We have a special offer just for you</p>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <div>
            <p className="text-gray-600 text-sm mb-3">
              Get <strong>{discount} OFF</strong> your first order with code:
            </p>
            <div className="inline-flex items-center gap-3 bg-gray-50 border-2 border-dashed border-rose-300 rounded-2xl px-6 py-3">
              <span className="text-2xl font-extrabold tracking-[0.2em] text-rose-600 font-mono">
                {couponCode}
              </span>
              <button
                onClick={copied}
                className="text-xs font-bold bg-rose-500 text-white px-3 py-1.5 rounded-xl hover:bg-rose-600 transition"
              >
                Copy
              </button>
            </div>
          </div>

          <Link
            to="/collections/all"
            onClick={dismiss}
            className="block w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition shadow-sm"
          >
            Shop Now & Save {discount}
          </Link>

          <button onClick={dismiss} className="text-xs text-gray-400 hover:text-gray-600 transition">
            No thanks, I'll pay full price
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
