import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/Products/ProductCard";

const PreviouslyViewed = () => {
  const [viewedProducts, setViewedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("userToken");
        if (token) {
          const { data } = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/recommendations/recently-viewed?limit=12`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setViewedProducts(Array.isArray(data) ? data : []);
          return;
        }

        const key = "recentlyViewedProductIds";
        const raw = localStorage.getItem(key);
        const ids = raw ? JSON.parse(raw) : [];
        const list = Array.isArray(ids) ? ids : [];
        if (list.length === 0) {
          setViewedProducts([]);
          return;
        }

        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/by-ids?ids=${encodeURIComponent(
            list.slice(0, 12).join(",")
          )}`
        );
        setViewedProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load recently viewed:", err);
        setViewedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center mb-6 text-sky-700">
        Previously Viewed
      </h2>
      {loading && (
        <p className="text-center text-sm text-gray-500">Loading…</p>
      )}
      {!loading && viewedProducts.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          No recently viewed products yet.
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {viewedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default PreviouslyViewed;
