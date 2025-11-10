import React from "react";

const TrendingProducts = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Trending Now</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Replace with real trending products */}
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center"
            >
              <div className="h-40 bg-gray-100 rounded mb-2"></div>
              <h3 className="font-semibold text-gray-700">Product {item}</h3>
              <p className="text-blue-600 font-bold">₹999</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;