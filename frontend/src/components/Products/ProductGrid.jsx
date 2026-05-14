import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import demoImg from "../../assets/login.jpg";
import { IoFlash } from "react-icons/io5";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import axios from "axios";
import { toast } from "sonner"; // since you're already using toast

const ProductGrid = ({ products = [], loading, error }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(
    window.innerWidth < 640 ? 10 : 9
  );
  const navigate = useNavigate();
  const { search } = useLocation();
  const sortBy = useMemo(() => new URLSearchParams(search).get("sortBy"), [search]);

  // Fisher–Yates shuffle (non-mutating)
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };


  // Dynamic resizing
  useEffect(() => {
    const handleResize = () => {
      setProductsPerPage(window.innerWidth < 640 ? 10 : 9);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Guard in case products is not a valid array
  const safeProducts = Array.isArray(products) ? products : [];
  const shouldShuffle = !sortBy || sortBy === "default" || sortBy === "none";

  // const shuffledProducts = useMemo(() => shuffleArray(safeProducts), [safeProducts]);

  const sourceProducts = useMemo(
    () => (shouldShuffle ? shuffleArray(safeProducts) : safeProducts),
    [safeProducts, shouldShuffle]
  );

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = sourceProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sourceProducts.length / productsPerPage);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, productsPerPage, safeProducts.length]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWishlistItems(data);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };

    fetchWishlist();
  }, []);

  // 👇 Add this
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId); // ✅ Correct
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.warning("Please login to add items to wishlist");
        navigate("/login");
        return;
      }
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Removed from wishlist");
      setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      toast.error("Failed to remove from wishlist");
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.warning("Please login to add items to wishlist");
        navigate("/login");
        return;
      }
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/add/${product._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`${product.name} added to wishlist`);
      setWishlistItems((prev) => [...prev, product]);
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      toast.error("Failed to add to wishlist");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg
          className="animate-spin h-10 w-10 text-sky-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      </div>
    );
  }

  // Error
  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  // No products
  if (!loading && safeProducts.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-center">
        <img
          src="https://i.gifer.com/7VE.gif"
          alt="No products found"
          className="w-64 h-64 object-contain mb-4"
        />
        <p className="text-2xl font-semibold text-gray-700">
          🤧 Oops! No products found
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Try adjusting your filters and search again.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4">
        {currentProducts.map((product, index) => (
          // <Link
          //   key={index}
          //   to={`/product/${product.name.toLowerCase().replace(/\s+/g, "-")}`}
          //   className="block group will-change-transform"
          // >
          <Link
            key={product._id || index}
            to={`/product/${product.name.toLowerCase().replace(/\s+/g, "-")}/p/${encodeURIComponent(
              product.skuCode || product.sku ||
              product.colorVariants?.[0]?.sizes?.[0]?.sku ||
              product.variants?.[0]?.sku ||
              product._id
            )}`}
            className="block group will-change-transform"
          >
            <div
              className="bg-white/80 backdrop-blur rounded-xl md:rounded-2xl
                         shadow-[0_8px_24px_rgba(14,165,233,0.12)]
                         hover:shadow-[0_14px_32px_rgba(14,165,233,0.18)]
                         transition-all duration-300 border border-sky-100"
            >
              <div className="w-full h-[220px] md:h-[300px] relative overflow-hidden rounded-t-xl md:rounded-t-2xl">
                <img
                  src={
                    product.colorVariants?.[0]?.images?.[0]?.url ||
                    product.images?.[0]?.url ||
                    demoImg
                  }
                  alt={
                    product.colorVariants?.[0]?.images?.[0]?.altText ||
                    product.images?.[0]?.altText ||
                    product.name
                  }
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* NEW Badge */}
                {new Date() - new Date(product.createdAt) <
                  2 * 24 * 60 * 60 * 1000 && (
                    <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-[10px] font-bold px-2 py-[2px] rounded-full shadow-md tracking-wide uppercase animate-[pulse_1.8s_ease-in-out_infinite]">
                      New
                    </div>
                  )}

                {/* Raphaaa Assured */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-sky-700 text-[10px] font-bold px-2 py-[2px] rounded-full shadow-sm tracking-wide flex items-center gap-1 border border-sky-100">
                  <img src="/favicon-16x16.png" alt="raphaaa-assured" />
                  Assured
                </div>

                {/* Stock */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded shadow-sm border border-gray-100">
                  {product.countInStock === 0 ? (
                    <span className="text-red-600">Out of Stock</span>
                  ) : product.countInStock < 10 ? (
                    <span className="text-red-600">
                      Hurry! {product.countInStock} left
                    </span>
                  ) : (
                    <span className="text-green-600">In Stock</span>
                  )}
                </div>

                {/* Wishlist (corner) */}
                {/* (logic kept commented as in your file) */}
              </div>

              <div className="p-3 md:p-4">
                <h3 className="text-[15px] md:text-base font-semibold text-gray-900 mb-1 truncate">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 flex-wrap">
                  {product.discountPrice && product.discountPrice < product.price ? (
                    <>
                      <p className="text-sky-700 font-extrabold text-2xl md:text-3xl tracking-wide">
                        ₹ {Math.floor(product.discountPrice)}
                      </p>
                      <p className="text-sm text-gray-500 line-through">
                        ₹ {Math.floor(product.price)}
                      </p>
                      <p className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                        {product.offerPercentage}% OFF
                      </p>
                    </>
                  ) : (
                    <p className="text-sky-700 font-extrabold text-2xl tracking-wide">
                      ₹ {product.price}
                    </p>
                  )}

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      isInWishlist(product._id)
                        ? handleRemoveFromWishlist(product._id)
                        : handleAddToWishlist(product);
                    }}
                    title={
                      isInWishlist(product._id)
                        ? "Remove from Wishlist"
                        : "Add to Wishlist"
                    }
                    className={`ml-auto w-10 h-10 flex items-center justify-center rounded-full shadow-md transition
                      ${isInWishlist(product._id)
                        ? "bg-red-50 text-red-600 hover:scale-110"
                        : "bg-white text-gray-800 hover:bg-pink-50 hover:scale-110"}
                    `}
                  >
                    <span className="relative inline-block">
                      {isInWishlist(product._id) ? (
                        <AiFillHeart className="text-2xl animate-pulse" />
                      ) : (
                        <AiOutlineHeart className="text-2xl" />
                      )}
                    </span>
                  </button>
                </div>

                {product.rating > 0 && product.numReviews > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-green-600 text-white px-2 py-[2px] rounded-full">
                      {product.rating.toFixed(1)} ★
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.numReviews} Reviews
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                ${currentPage === i + 1
                  ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-200"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}
              `}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default ProductGrid;
