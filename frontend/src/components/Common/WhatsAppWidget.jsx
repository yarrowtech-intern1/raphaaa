import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaWhatsapp } from "react-icons/fa";
import { HiX } from "react-icons/hi";

const DEFAULT_MESSAGE = "Hi! I need help with my order on Raphaaa.";

const WhatsAppWidget = () => {
  const [open,   setOpen]   = useState(false);
  const [number, setNumber] = useState("");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/settings/contact`)
      .then(({ data }) => {
        if (data?.whatsappNumber) setNumber(String(data.whatsappNumber).replace(/\D/g, ""));
      })
      .catch(() => {});
  }, []);

  const startChat = () => {
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`, "_blank");
    setOpen(false);
  };

  if (!number) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 mb-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <FaWhatsapp className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Raphaaa Support</p>
                <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Typically replies in minutes
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm transition"
            >
              <HiX />
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            Hi there! 👋 Have questions about your order, sizes, or products? We're here to help!
          </p>
          <button
            onClick={startChat}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition flex items-center justify-center gap-2"
          >
            <FaWhatsapp className="text-lg" /> Start Chat
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open ? "bg-gray-700 hover:bg-gray-800" : "bg-emerald-500 hover:bg-emerald-600"
        }`}
        aria-label="Chat on WhatsApp"
      >
        {open
          ? <HiX className="text-white text-xl" />
          : <FaWhatsapp className="text-white text-2xl" />}
      </button>
    </div>
  );
};

export default WhatsAppWidget;
