import React from "react";
import { Link } from "react-router-dom";

const FlashSaleSection = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-r from-red-50 to-yellow-50">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-2">Flash Sale</h2>
        <p className="text-gray-700 mb-6">Hurry up! Limited time offers end soon.</p>
        <Link
          to="/collections/flash-sale"
          className="inline-block bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition"
        >
          Shop Flash Deals
        </Link>
      </div>
    </section>
  );
};

export default FlashSaleSection;