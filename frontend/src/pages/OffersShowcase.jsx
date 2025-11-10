// src/pages/OffersShowcase.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const OffersShowcase = () => {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/offers/public`
        );
        setOffers(
          data.filter((offer) => new Date(offer.endDate) >= new Date())
        );
      } catch {
        toast.error("Failed to load offers");
      }
    };
    fetchOffers();
  }, []);

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 text-blue-700">
          Hot Deals & Limited Time Offers
        </h2>

        <div className="space-y-10">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              {offer.bannerImage && (
                <img
                  src={offer.bannerImage}
                  alt={offer.title}
                  className="w-full h-64 object-cover"
                />
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {offer.title}
                  </h3>
                  <span className="bg-red-500 text-white px-3 py-1 text-sm rounded-full">
                    {offer.offerPercentage}% OFF
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {offer.description}
                </p>

                <p className="text-sm text-gray-500 mb-4">
                  Valid from: <strong>{offer.startDate.slice(0, 10)}</strong> to{" "}
                  <strong>{offer.endDate.slice(0, 10)}</strong>
                </p>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                  {offer.productIds.map((product) => {
                    const hasImage =
                      Array.isArray(product.images) &&
                      product.images.length > 0;
                    const productImage = hasImage
                      ? product.images[0].url
                      : "/placeholder.jpg";

                    const discountPrice =
                      product.discountPrice || product.price;
                    const offerPercent = product.offerPercentage || 0;

                    return (
                      <Link
                        key={product._id}
                        to={`/product/${product._id}`}
                        className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        {/* Offer Badge */}
                        {offerPercent > 0 && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full z-10 shadow">
                            {offerPercent}% OFF
                          </span>
                        )}

                        {/* Product Image */}
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Details */}
                        <div className="p-4 space-y-1">
                          <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">
                            {product.name}
                          </h4>

                          {/* Prices */}
                          <div className="text-sm mt-1">
                            <span className="text-green-600 font-bold">
                              ₹{discountPrice}
                            </span>{" "}
                            {discountPrice < product.price && (
                              <span className="text-gray-500 line-through ml-2">
                                ₹{Math.round(product.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* CTA Button */}
                {/* <div className="mt-6 text-center">
                  <Link
                    to="/shop/offers"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium transition"
                  >
                    🛒 Shop These Deals
                  </Link>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersShowcase;
