import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaArrowRight, FaShoppingBag } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";
import { TbShoppingBag } from "react-icons/tb";
import { MdVerifiedUser, MdWorkspacePremium } from "react-icons/md";
import { FaFire } from "react-icons/fa";
import { RiVipCrown2Fill } from "react-icons/ri";

const FeaturedCollection = () => {
  const [featuredCollab, setFeaturedCollab] = useState(null);
  const { scrollY } = useScroll();

  // Image parallax zoom
  const scale = useTransform(scrollY, [0, 300], [1, 1.15]);
  const y = useTransform(scrollY, [0, 300], [0, 50]);

  // Glow background parallax
  const glowX = useTransform(scrollY, [0, 300], [0, -40]);
  const glowY = useTransform(scrollY, [0, 300], [0, 40]);

  useEffect(() => {
    const fetchCollab = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/collabs`
        );
        if (data && data.length > 0) {
          setFeaturedCollab(data[0]);
        }
      } catch (err) {
        console.error("Failed to load featured collab", err);
      }
    };

    fetchCollab();
  }, []);

  if (!featuredCollab || !featuredCollab.isPublished) return null;

  return (
    <section className="relative px-6 md:px-20 py-20 md:h-[90vh] overflow-hidden bg-gradient-to-br from-[#fdfbfb] via-[#f6f7f8] to-[#ebedee] flex flex-col-reverse sm:flex-row items-center justify-between gap-12">
      {/* Glow Background Effects */}
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-sky-400 opacity-25 rounded-full blur-[140px] z-0"
      />
      <motion.div
        style={{ x: glowY, y: glowX }}
        className="absolute bottom-0 -right-32 w-[550px] h-[550px] bg-pink-400 opacity-25 rounded-full blur-[160px] z-0"
      />

      {/* Floating Badge */}
      <div className="absolute top-8 left-6 md:top-8 md:left-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400 backdrop-blur-md border border-white/20 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg tracking-wide animate-bounce"
        >
          <RiVipCrown2Fill className='inline mb-1' size={14} /> Exclusive Collab
        </motion.div>
      </div>

      {/* Left Side Text */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full sm:w-1/2 text-center sm:text-left space-y-1"
      >
        <p className="text-xs uppercase font-semibold tracking-wider text-blue-600">
          Limited Edition Drop
        </p>

        {/* Heading + hover chips */}
        {/* Heading + ALWAYS-VISIBLE chips (responsive) */}
        <div className="relative inline-block">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-transparent bg-clip-text drop-shadow-xl animate-gradient">
            Raphaaa X {featuredCollab.title}
          </h1>

          {/* Chips are visible by default and sized/positioned responsively */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {/* Left stack */}
            {/* <div className="absolute -left-10 -top-8 sm:-left-20 sm:-top-6 md:-left-28 md:-top-4 -rotate-6">
      <span className="inline-flex items-center px-3 sm:px-4 py-1.5 rounded-xl text-white text-[10px] sm:text-xs font-semibold shadow-md bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 bg-[length:200%_200%]">
        🔥 Limited Drop
      </span>
    </div> */}
            {/* <div className="absolute -left-14 top-6 sm:-left-24 sm:top-8 md:-left-36 md:top-10 -rotate-3">
      <span className="inline-flex items-center px-3 sm:px-4 py-1.5 rounded-xl text-white text-[10px] sm:text-xs font-semibold shadow-md bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-[length:200%_200%]">
        ⭐ Premium Quality
      </span>
    </div>
    <div className="absolute -left-8 bottom-0 sm:-left-16 sm:bottom-0 md:-left-24 md:bottom-0 -rotate-1">
      <span className="inline-flex items-center px-3 sm:px-4 py-1.5 rounded-xl text-white text-[10px] sm:text-xs font-semibold shadow-md bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 bg-[length:200%_200%]">
        ⚡ Fast Selling
      </span>
    </div> */}

            {/* Right stack */}
            <div className="hidden md:block absolute -right-10 -top-7 sm:-right-20 sm:-top-6 md:right-30 md:-top-3 rotate-6">
              <span className="inline-flex items-center px-3 sm:px-4 py-1.5 text-white text-[10px] sm:text-xs font-semibold shadow-md bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-[length:200%_200%]">
                <FaShoppingBag className="mr-2" size={13} /> New Arrival
              </span>
            </div>

            <div className="hidden md:block absolute -right-14 top-8 sm:-right-24 sm:top-10 md:-right-1 md:top-12 -rotate-3">
              <span className="inline-flex items-center px-3 sm:px-4 py-1.5 text-white text-[10px] sm:text-xs font-semibold shadow-md bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-[length:200%_200%]">
                <MdVerifiedUser className="mr-2" size={14} /> Verified Collab
              </span>
            </div>

            <div className="hidden md:block absolute -right-14 top-8 sm:-right-24 sm:top-10 md:-right-1 md:top-42 -rotate-6">
              <span className="inline-flex items-center px-3 sm:px-4 py-1.5 text-white text-[10px] sm:text-xs font-semibold shadow-md bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 bg-[length:200%_200%]">
                <FaFire className="mr-2" size={14} /> Limited Drop
              </span>
            </div>

            <div className="hidden md:block absolute -right-8 bottom-0 sm:-right-16 sm:bottom-0 md:right-24 md:-bottom-36 rotate-12">
              <span className="inline-flex items-center px-3 sm:px-4 py-1.5 text-white text-[10px] sm:text-xs font-semibold shadow-md bg-gradient-to-r from-violet-500 via-purple-600 to-fuchsia-600 bg-[length:200%_200%]">
                <MdWorkspacePremium className="mr-2" size={15} /> Premium Quality
              </span>
            </div>

          </div>
        </div>




        <p className="text-gray-600 text-sm md:text-lg leading-relaxed max-w-md mx-auto sm:mx-0">
          {featuredCollab.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4 mt-6 justify-center sm:justify-start">
          <Link
            to="/exclusive-drop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm md:text-base font-semibold bg-gradient-to-r from-blue-600 to-sky-500 shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            Explore Drop <FaArrowRight className="ml-1" />
          </Link>

          {/* <Link
            to="/collections/all"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm md:text-base font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 shadow-sm transition-all duration-300"
          >
            View Collection
          </Link> */}
        </div>

        <span className="text-xs text-gray-500 hidden md:inline">
          Hurry, before it’s gone!
        </span>
      </motion.div>

      {/* Right Side Image */}
      {/* Right Side Image */}
      <motion.div
        style={{ scale, y }}
        className="relative z-10 w-full sm:w-1/2 flex justify-center"
      >
        {/* NEW: drop-in wrapper */}
        <motion.div
          initial={{ y: -220, opacity: 0, rotate: -4, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, bounce: 0.28 }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="relative group w-[90%] sm:w-[90%] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-white to-gray-50 transform hover:rotate-1 hover:-translate-y-2 transition-all duration-500">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-pink-400 via-sky-400 to-yellow-300 opacity-30 blur-2xl -z-10" />
            <img
              src={featuredCollab.image.replace(/\.(jpeg|jpg|png)$/i, ".webp")}
              alt={featuredCollab.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        </motion.div>
      </motion.div>

    </section>
  );

};

export default FeaturedCollection;
