import React, { useEffect, useState } from "react";
import { HiOutlineCreditCard, HiShoppingBag } from "react-icons/hi";
import { HiArrowPathRoundedSquare } from "react-icons/hi2";
import axios from "axios";

const FeaturesSection = () => {
  const [collabActive, setCollabActive] = useState(false);
  
    useEffect(() => {
      axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/api/collabs/active`)
        .then((res) => setCollabActive(res.data.isActive))
        .catch(() => setCollabActive(false));
    }, []);
  
    if (collabActive) return null; // ⛔ hide section when active
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-sky-50 to-blue-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {/* Feature Box */}
        {[
          {
            icon: <HiShoppingBag className="text-4xl text-white" />,
            title: "Free International Shipping",
            desc: "On all orders over ₹100.00",
            color: "from-purple-400 to-pink-500",
          },
          {
            icon: <HiArrowPathRoundedSquare className="text-4xl text-white" />,
            title: "45 Days Return",
            desc: "Money back guarantee",
            color: "from-blue-400 to-cyan-500",
          },
          {
            icon: <HiOutlineCreditCard className="text-4xl text-white" />,
            title: "Secure Checkout",
            desc: "100% secured checkout process",
            color: "from-green-400 to-emerald-500",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="relative group p-8 rounded-xl bg-white/40 backdrop-blur-md shadow-xl border border-white/30 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            {/* Glowing circle behind icon */}
            <div
              className={`absolute top-4 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full blur-3xl opacity-30 z-0 bg-gradient-to-r ${item.color}`}
            />

            <div className="relative z-10">
              {/* Icon */}
              <div
                className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r ${item.color} shadow-lg`}
              >
                {item.icon}
              </div>

              {/* Title */}
              <h4 className="font-semibold text-gray-800 text-xl mb-2 tracking-tight">
                {item.title}
              </h4>

              {/* Description */}
              <p className="text-gray-600 text-sm tracking-tight">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
