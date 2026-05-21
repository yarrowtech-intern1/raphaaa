import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiCopy, FiShare2 } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function ReferAndEarn() {
  const { user } = useSelector((s) => s.auth);
  const navigate  = useNavigate();
  const [info, setInfo]     = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login?redirect=/refer"); return; }
    const token = localStorage.getItem("userToken");
    axios.get(`${BACKEND}/api/referral/my-code`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => setInfo(data))
      .catch(() => toast.error("Failed to load referral info"));
  }, [user]);

  const copyCode = () => {
    if (!info) return;
    navigator.clipboard.writeText(info.referralCode);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    if (!info) return;
    navigator.clipboard.writeText(info.referralLink);
    toast.success("Link copied!");
  };

  const shareWhatsApp = () => {
    if (!info) return;
    const msg = encodeURIComponent(
      `Hey! Shop on Raphaaa and use my referral code *${info.referralCode}* at signup to get ₹${info.refereeReward} off your first order! 🛍️\n${info.referralLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  if (!info) return (
    <div className="flex items-center justify-center min-h-screen gap-3 text-gray-400 text-sm">
      <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      Loading…
    </div>
  );

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Hero */}
        <div className="bg-linear-to-br from-sky-600 to-indigo-600 rounded-3xl p-8 text-white text-center">
          <p className="text-5xl mb-3">🎁</p>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Refer & Earn</h1>
          <p className="text-sky-100 text-sm">
            Invite friends to Raphaaa and both of you win!
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">How it works</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { step: "1", icon: "🔗", title: "Share your code", desc: "Send your unique code or link to friends" },
              { step: "2", icon: "🛒", title: "Friend signs up & shops", desc: `They get ₹${info.refereeReward} on their first order` },
              { step: "3", icon: "💰", title: "You earn", desc: `Get ₹${info.referrerReward} added to your wallet` },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-extrabold text-sm flex items-center justify-center">
                  {step}
                </div>
                <div className="text-2xl">{icon}</div>
                <p className="text-xs font-bold text-gray-800">{title}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center">
            <p className="text-3xl font-extrabold text-emerald-700">₹{info.referrerReward}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">You earn per referral</p>
            <p className="text-[11px] text-emerald-500 mt-0.5">Added to wallet after friend's first order</p>
          </div>
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 text-center">
            <p className="text-3xl font-extrabold text-sky-700">₹{info.refereeReward}</p>
            <p className="text-xs text-sky-600 font-semibold mt-1">Your friend gets</p>
            <p className="text-[11px] text-sky-500 mt-0.5">Credited instantly on signup</p>
          </div>
        </div>

        {/* Referral code + actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Your Referral Code</h2>

          {/* Code box */}
          <div className="flex items-center gap-3 bg-gray-50 border-2 border-dashed border-sky-300 rounded-2xl px-5 py-4">
            <span className="flex-1 text-2xl font-extrabold tracking-[0.3em] text-sky-700 font-mono">
              {info.referralCode}
            </span>
            <button
              onClick={copyCode}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${
                copied ? "bg-emerald-500 text-white" : "bg-sky-600 text-white hover:bg-sky-700"
              }`}
            >
              <FiCopy className="text-sm" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Link */}
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={info.referralLink}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 text-gray-600 truncate"
            />
            <button onClick={copyLink}
              className="shrink-0 px-3 py-2 text-xs font-bold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition">
              Copy Link
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition"
            >
              <FaWhatsapp className="text-lg" /> Share on WhatsApp
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "Raphaaa — Shop Fashion", text: `Use my code ${info.referralCode} for ₹${info.refereeReward} off!`, url: info.referralLink });
                } else {
                  copyLink();
                }
              }}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              <FiShare2 />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-gray-800">{info.referralCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Friends referred so far</p>
          </div>
          <div className="text-4xl">👥</div>
        </div>

        <p className="text-[11px] text-center text-gray-400 pb-4">
          Rewards are credited as wallet balance after your friend's first paid order. Not applicable on cancelled or returned orders.
        </p>
      </div>
    </div>
  );
}
