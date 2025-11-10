import { useEffect, useRef, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";
import axios from "axios";
import useSmartLoader from "../../hooks/useSmartLoader";

const NewArrivals = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);



  // ✅ Auto-scroll with infinite loop (left to right) + pause on hover
  useEffect(() => {
    let isHovered = false;
    const container = scrollRef.current;

    const handleMouseEnter = () => (isHovered = true);
    const handleMouseLeave = () => (isHovered = false);

    container?.addEventListener("mouseenter", handleMouseEnter);
    container?.addEventListener("mouseleave", handleMouseLeave);

    const scrollLoop = () => {
      if (!container) return;
      if (!isHovered) {
        container.scrollLeft += 1;
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      requestAnimationFrame(scrollLoop);
    };

    const animationId = requestAnimationFrame(scrollLoop);

    return () => {
      cancelAnimationFrame(animationId);
      container?.removeEventListener("mouseenter", handleMouseEnter);
      container?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const { loading, data: newArrivals = [] } = useSmartLoader(async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`);
    return res.data;
  });


  const scroll = (direction) => {
    const container = scrollRef.current;
    const scrollAmount = direction === "left" ? -300 : 300;
    if (container) {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const updateScrollButtons = () => {
    const container = scrollRef.current;
    if (container) {
      const leftScroll = container.scrollLeft;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      setCanScrollLeft(leftScroll > 0);
      setCanScrollRight(leftScroll < maxScrollLeft);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [newArrivals]);

  const [collabActive, setCollabActive] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/collabs/active`)
      .then((res) => setCollabActive(res.data.isActive))
      .catch(() => setCollabActive(false));
  }, []);

  if (collabActive) return null; // ⛔ hide section when active

  return (
    <section className="py-16 px-4 lg:px-0">
      <div className="container mx-auto text-center mb-10 relative">
        <h2 className="text-3xl font-bold mb-2 inline-block relative">
          Explore New Arrivals
          <span className="block w-32 h-1 bg-gradient-to-r from-sky-300 to-sky-500 mx-auto mt-2 rounded-full"></span>
        </h2>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Discover the latest styles straight off the runway, freshly added to
          keep your wardrobe on the cutting edge of fashion.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="container mx-auto overflow-x-auto flex space-x-6 scroll-smooth px-2 pb-6 new-arrivals-track"
      >
        {(loading
          ? Array.from({ length: 4 })
          : [...newArrivals, ...newArrivals]
        ).map((product, index) =>
          loading ? (
            <div
              key={index}
              className="min-w-[85%] sm:min-w-[50%] md:min-w-[40%] lg:min-w-[30%] bg-gray-100 shadow-md rounded-xl animate-pulse"
            >
              <div className="h-80 w-full bg-gray-300 rounded-t-xl" />
              <div className="p-4">
                <div className="h-4 w-3/4 bg-gray-300 rounded mb-2" />
                <div className="h-4 w-1/2 bg-gray-300 rounded" />
              </div>
            </div>
          ) : (
            <div
              key={`${product._id}_${index}`}
              className="min-w-[250px] bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl shadow-md border border-sky-200 hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className="w-full h-80 relative overflow-hidden rounded-t-xl">
                <img
                  src={product.images?.[0]?.url.replace(/\.(jpeg|jpg|png)$/i, ".webp")}
                  alt={product.images?.[0]?.altText || product.name}
                  loading="lazy"
                  width={300}
                  height={320}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {new Date() - new Date(product.createdAt) <
                  2 * 24 * 60 * 60 * 1000 && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-[10px] font-bold px-2 py-[2px] rounded-full shadow-md animate-bounce uppercase tracking-wider">
                      New
                    </div>
                  )}
              </div>
              <div className="p-4 text-left">
                <Link to={`/product/${product.name.toLowerCase().replace(/\s+/g, "-")}/p/${encodeURIComponent(
                  product.skuCode || product.sku || product._id
                )}`} className="block">
                  <h4 className="font-semibold text-blue-900 group-hover:text-sky-600 transition-colors truncate">
                    {product.name}
                  </h4>
                  {product.discountPrice && product.discountPrice > 0 ? (
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center gap-2">
                        <p className="text-blue-700 font-bold text-lg">
                          ₹{product.discountPrice}
                        </p>
                        <p className="line-through text-gray-500 text-sm">
                          ₹{product.price}
                        </p>
                      </div>
                      <p className="text-green-600 text-sm font-semibold">
                        {product.offerPercentage}% OFF
                      </p>
                    </div>
                  ) : (
                    <p className="text-blue-700 font-bold text-lg mt-2">
                      ₹{product.price}
                    </p>
                  )}
                </Link>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
