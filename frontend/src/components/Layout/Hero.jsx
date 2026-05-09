import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "../../assets/heroimg.webp";
import heroImg2 from "../../assets/hero_img.webp";
import heroImg3 from "../../assets/hero3.webp";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import useSmartLoader from "../../hooks/useSmartLoader";
import axios from "axios";
import { FaLock, FaShippingFast } from "react-icons/fa";
import { FaRepeat } from "react-icons/fa6";


const Hero = () => {
  const heroImages = [heroImg, heroImg2, heroImg3];
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const { loading } = useSmartLoader(async () => {
    // Simulate remote resource fetch
    await new Promise((res) => setTimeout(res, 300));
    return true;
  });

  // Countdown to 11:59 PM today
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const diff = endOfDay - now;
      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [collabActive, setCollabActive] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/collabs/active`)
      .then((res) => setCollabActive(res.data.isActive))
      .catch(() => setCollabActive(false));
  }, []);

  if (collabActive) return null; // ⛔ hide section when active

  if (loading) {
    return (
      <div className="md:h-[80vh] flex flex-col sm:flex-row justify-between gap-2 px-6 md:px-28 py-8">
        <div className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0">
          <div className="w-full h-60 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
        <div className="w-full sm:w-1/2 aspect-square overflow-hidden">
          <div className="w-full h-full bg-gray-200 rounded-full md:rounded-l-none md:rounded-r-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <>
    {/* Raphaaa Marquee Banner */}
{/* <div className="relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 py-3 shadow-lg rounded-lg">
  <div className="whitespace-nowrap animate-marquee text-white font-semibold text-sm sm:text-base tracking-wide flex items-center gap-6">
    <span className="px-4">🔥 Limited Time Offer! 🔥</span>
    <span className="px-4">💬 If you face any issue, reach us at Contact Support</span>
    <span className="px-4">✍️ Enter Title & Subject — we’ll reply soon</span>
  </div>

  <div className="pointer-events-none absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-purple-900 to-transparent"></div>
  <div className="pointer-events-none absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-indigo-900 to-transparent"></div>
</div> */}
      <div className="md:h-[80vh] flex flex-col sm:flex-row justify-between gap-2 px-6 md:px-28 py-8 md:py-2 relative transition-all duration-700">
        {/* 🔥 Floating Offer Badge */}
        <div className="absolute top-4 md:top-12 right-4 sm:right-10 md:right-[500px] z-10">
          <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">
            🔥 Limited Time Offer!
          </div>
        </div>

        {/* Left Side */}
        <div
          className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0 
        bg-white/80 backdrop-blur-xl border border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.1)] rounded-2xl hover:shadow-2xl transition-shadow duration-500"
        >
          <div className="text-[#202020] px-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"></span>
              <p className="text-xs md:text-sm font-semibold tracking-wider text-sky-700 uppercase">
                Trending Now
              </p>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-black to-blue-600">
              <span className="text-black">Refresh your </span>wardrobe with Raphaaa
            </h1>

            <p className="text-gray-600 text-sm md:text-base font-medium tracking-wide">
              Discover styles loved by thousands. Limited stocks available!
            </p>

            {/* ⏰ Countdown Timer */}
            {/* <div className="text-red-600 font-semibold text-sm md:text-base">
            Ends in:{" "}
            <span className="tabular-nums">
              {timeLeft.hours.toString().padStart(2, "0")}:
              {timeLeft.minutes.toString().padStart(2, "0")}:
              {timeLeft.seconds.toString().padStart(2, "0")}
            </span>{" "}
            hrs
          </div> */}

            <div className="flex items-center gap-3 mt-4">
              <Link
                to="/collections/all"
                className="px-5 py-2.5 text-white bg-gradient-to-r from-sky-600 to-blue-700 font-semibold rounded-md shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                Shop Now
              </Link>
              <span className="text-xs text-gray-500">
                Free delivery on first order
              </span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full sm:w-1/2 aspect-square overflow-hidden rounded-full md:rounded-l-none md:rounded-r-full shadow-lg border-4 border-white">
          <Swiper
            loop
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            modules={[Autoplay]}
            className="w-full h-full"
          >
            {heroImages.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={img}
                  alt={`Hero ${idx}`}
                  width={1000}
                  height={1000}
                  className="w-full h-full object-cover transition-transform duration-1000 scale-100 hover:scale-105"
                  loading="lazy"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      {/* <marquee behavior="scroll" direction="left">🔥 Limited Time Offer!</marquee> */}
      {/* USP strip */}
      <div className="px-6 md:px-28 mt-20 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
            <span className="text-xl text-sky-600"><FaShippingFast /></span>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">Free Shipping</p>
              <p className="text-slate-500">On first order</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
            <span className="text-xl text-sky-600"> <FaRepeat /> </span>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">Easy Returns</p>
              <p className="text-slate-500">7-day hassle free</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
            <span className="text-xl text-sky-600"><FaLock /></span>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">Secure Payments</p>
              <p className="text-slate-500">UPI / Cards / Wallets</p>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default Hero;