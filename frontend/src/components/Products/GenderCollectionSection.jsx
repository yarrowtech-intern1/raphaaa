import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import menImg from "../../assets/mens-collection.jpg";
import womenImg from "../../assets/womens-collection.jpg";
import product1 from "../../assets/product1.webp";
import product2 from "../../assets/product2.webp";
import useSmartLoader from "../../hooks/useSmartLoader";
import axios from "axios";

const GenderCollectionSection = () => {
  // Smart skeleton (kept)
  const { loading } = useSmartLoader(async () => {
    await new Promise((res) => setTimeout(res, 300));
    return true;
  });

  const [collabActive, setCollabActive] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/collabs/active`)
      .then((res) => setCollabActive(res.data.isActive))
      .catch(() => setCollabActive(false));
  }, []);

  // ⛔ hide section when active
  if (collabActive) return null;

  // --- animation helpers ---
  const cardVariants = useMemo(
    () => ({
      initial: { opacity: 0, y: 28, scale: 0.98 },
      in: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: "easeOut" } },
      hover: { y: -6, transition: { duration: 0.25 } },
    }),
    []
  );

  const ctaVariants = useMemo(
    () => ({
      hover: { scale: 1.02 },
      tap: { scale: 0.98 },
    }),
    []
  );

  if (loading) {
    return (
      <section className="py-16 px-4 lg:px-0 bg-gradient-to-b from-white to-sky-50">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="relative h-[480px] md:h-[560px] lg:h-[640px] overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 rounded-2xl border border-sky-100/80 bg-white/60" />
              <div className="h-full w-full animate-pulse rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 [background-size:200%_100%]" />
              <div className="absolute inset-x-6 bottom-6 h-8 w-40 rounded-full bg-slate-200/80 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 lg:px-0 bg-gradient-to-b from-white to-sky-50">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            <span className="">
              Shop by Gender
            </span>
          </h2>
          <div className="mt-3 h-1 w-28 mx-auto rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Women's Collection */}
          <motion.article
            variants={cardVariants}
            initial="initial"
            whileInView="in"
            whileHover="hover"
            viewport={{ once: true, amount: 0.3 }}
            className="relative overflow-hidden rounded-2xl shadow-lg group ring-1 ring-sky-100/80 bg-white"
          >
            {/* Image */}
            <img
              src={product1 || womenImg}
              alt="Women collection"
              width={1200}
              height={800}
              loading="lazy"
              className="w-full h-[480px] md:h-[560px] lg:h-[640px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />

            {/* Overlays */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-[radial-gradient(1200px_300px_at_50%_120%,rgba(14,165,233,0.18),transparent)]" />
            </div>

            {/* Badge */}
            <div className="absolute top-5 left-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-sky-200 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                New Arrivals
              </span>
            </div>

            {/* Content */}
            <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between gap-4">
              <div className="text-white drop-shadow">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Women&apos;s Collection</h3>
                <p className="hidden md:block text-slate-100/90">
                  Curated fits in fresh palettes and premium fabrics.
                </p>
              </div>

              <motion.div variants={ctaVariants} whileHover="hover" whileTap="tap">
                <Link
                  to="/collections/all?gender=Women"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-white
                  bg-gradient-to-r from-blue-600 to-sky-500 shadow-sm hover:shadow-md focus:outline-none
                  focus-visible:ring-4 focus-visible:ring-sky-300/60 transition"
                >
                  Shop Now
                </Link>
              </motion.div>
            </div>
          </motion.article>

          {/* Men's Collection */}
          <motion.article
            variants={cardVariants}
            initial="initial"
            whileInView="in"
            whileHover="hover"
            viewport={{ once: true, amount: 0.3 }}
            className="relative overflow-hidden rounded-2xl shadow-lg group ring-1 ring-sky-100/80 bg-white"
          >
            {/* Image */}
            <img
              src={product2 || menImg}
              alt="Men collection"
              width={1200}
              height={800}
              loading="lazy"
              className="w-full h-[520px] md:h-[560px] lg:h-[640px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />

            {/* Overlays */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-[radial-gradient(1200px_300px_at_50%_120%,rgba(59,130,246,0.18),transparent)]" />
            </div>

            {/* Badge */}
            <div className="absolute top-5 left-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-sky-200 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Trending Now
              </span>
            </div>

            {/* Content */}
            <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between gap-4">
              <div className="text-white drop-shadow">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Men&apos;s Collection</h3>
                <p className="hidden md:block text-slate-100/90">
                  Elevated essentials built for everyday performance.
                </p>
              </div>

              <motion.div variants={ctaVariants} whileHover="hover" whileTap="tap">
                <Link
                  to="/collections/all?gender=Men"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-white
                  bg-gradient-to-r from-blue-600 to-sky-500 shadow-sm hover:shadow-md focus:outline-none
                  focus-visible:ring-4 focus-visible:ring-sky-300/60 transition"
                >
                  Shop Now
                </Link>
              </motion.div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
};

export default GenderCollectionSection;
