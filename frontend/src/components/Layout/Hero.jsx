// // import React, { useEffect, useState } from "react";
// // import { Link } from "react-router-dom";
// // import heroImg from "../../assets/heroimg.webp";
// // import heroImg2 from "../../assets/hero_img.webp";
// // import heroImg3 from "../../assets/hero3.webp";
// // import { Swiper, SwiperSlide } from "swiper/react";
// // import { Autoplay } from "swiper/modules";
// // import "swiper/css";
// // import useSmartLoader from "../../hooks/useSmartLoader";
// // import axios from "axios";
// // import { FaLock, FaShippingFast } from "react-icons/fa";
// // import { FaRepeat } from "react-icons/fa6";


// // const Hero = () => {
// //   const heroImages = [heroImg, heroImg2, heroImg3];
// //   const [timeLeft, setTimeLeft] = useState({
// //     hours: 0,
// //     minutes: 0,
// //     seconds: 0,
// //   });

// //   const { loading } = useSmartLoader(async () => {
// //     // Simulate remote resource fetch
// //     await new Promise((res) => setTimeout(res, 300));
// //     return true;
// //   });

// //   // Countdown to 11:59 PM today
// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       const now = new Date();
// //       const endOfDay = new Date();
// //       endOfDay.setHours(23, 59, 59, 999);

// //       const diff = endOfDay - now;
// //       const hours = Math.floor(diff / 1000 / 60 / 60);
// //       const minutes = Math.floor((diff / 1000 / 60) % 60);
// //       const seconds = Math.floor((diff / 1000) % 60);
// //       setTimeLeft({ hours, minutes, seconds });
// //     }, 1000);

// //     return () => clearInterval(interval);
// //   }, []);

// //   const [collabActive, setCollabActive] = useState(false);

// //   useEffect(() => {
// //     axios
// //       .get(`${import.meta.env.VITE_BACKEND_URL}/api/collabs/active`)
// //       .then((res) => setCollabActive(res.data.isActive))
// //       .catch(() => setCollabActive(false));
// //   }, []);

// //   if (collabActive) return null; // ⛔ hide section when active

// //   if (loading) {
// //     return (
// //       <div className="md:h-[80vh] flex flex-col sm:flex-row justify-between gap-2 px-6 md:px-28 py-8">
// //         <div className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0">
// //           <div className="w-full h-60 bg-gray-200 rounded-2xl animate-pulse"></div>
// //         </div>
// //         <div className="w-full sm:w-1/2 aspect-square overflow-hidden">
// //           <div className="w-full h-full bg-gray-200 rounded-full md:rounded-l-none md:rounded-r-full animate-pulse"></div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <>
// //     {/* Raphaaa Marquee Banner */}
// // {/* <div className="relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 py-3 shadow-lg rounded-lg">
// //   <div className="whitespace-nowrap animate-marquee text-white font-semibold text-sm sm:text-base tracking-wide flex items-center gap-6">
// //     <span className="px-4">🔥 Limited Time Offer! 🔥</span>
// //     <span className="px-4">💬 If you face any issue, reach us at Contact Support</span>
// //     <span className="px-4">✍️ Enter Title & Subject — we’ll reply soon</span>
// //   </div>

// //   <div className="pointer-events-none absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-purple-900 to-transparent"></div>
// //   <div className="pointer-events-none absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-indigo-900 to-transparent"></div>
// // </div> */}
// //       <div className="md:h-[80vh] flex flex-col sm:flex-row justify-between gap-2 px-6 md:px-28 py-8 md:py-2 relative transition-all duration-700">
// //         {/* 🔥 Floating Offer Badge */}
// //         <div className="absolute top-4 md:top-12 right-4 sm:right-10 md:right-[500px] z-10">
// //           <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">
// //             🔥 Limited Time Offer!
// //           </div>
// //         </div>

// //         {/* Left Side */}
// //         <div
// //           className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0 
// //         bg-white/80 backdrop-blur-xl border border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.1)] rounded-2xl hover:shadow-2xl transition-shadow duration-500"
// //         >
// //           <div className="text-[#202020] px-4 space-y-4">
// //             <div className="flex items-center gap-2">
// //               <span className="w-8 h-[2px] bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"></span>
// //               <p className="text-xs md:text-sm font-semibold tracking-wider text-sky-700 uppercase">
// //                 Trending Now
// //               </p>
// //             </div>

// //             <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-black to-blue-600">
// //               <span className="text-black">Refresh your </span>wardrobe with Raphaaa
// //             </h1>

// //             <p className="text-gray-600 text-sm md:text-base font-medium tracking-wide">
// //               Discover styles loved by thousands. Limited stocks available!
// //             </p>

// //             {/* ⏰ Countdown Timer */}
// //             {/* <div className="text-red-600 font-semibold text-sm md:text-base">
// //             Ends in:{" "}
// //             <span className="tabular-nums">
// //               {timeLeft.hours.toString().padStart(2, "0")}:
// //               {timeLeft.minutes.toString().padStart(2, "0")}:
// //               {timeLeft.seconds.toString().padStart(2, "0")}
// //             </span>{" "}
// //             hrs
// //           </div> */}

// //             <div className="flex items-center gap-3 mt-4">
// //               <Link
// //                 to="/collections/all"
// //                 className="px-5 py-2.5 text-white bg-gradient-to-r from-sky-600 to-blue-700 font-semibold rounded-md shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
// //               >
// //                 Shop Now
// //               </Link>
// //               <span className="text-xs text-gray-500">
// //                 Free delivery on first order
// //               </span>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Right Side */}
// //         <div className="w-full sm:w-1/2 aspect-square overflow-hidden rounded-full md:rounded-l-none md:rounded-r-full shadow-lg border-4 border-white">
// //           <Swiper
// //             loop
// //             autoplay={{ delay: 3000, disableOnInteraction: false }}
// //             modules={[Autoplay]}
// //             className="w-full h-full"
// //           >
// //             {heroImages.map((img, idx) => (
// //               <SwiperSlide key={idx}>
// //                 <img
// //                   src={img}
// //                   alt={`Hero ${idx}`}
// //                   width={1000}
// //                   height={1000}
// //                   className="w-full h-full object-cover transition-transform duration-1000 scale-100 hover:scale-105"
// //                   loading="lazy"
// //                 />
// //               </SwiperSlide>
// //             ))}
// //           </Swiper>
// //         </div>
// //       </div>
// //       {/* <marquee behavior="scroll" direction="left">🔥 Limited Time Offer!</marquee> */}
// //       {/* USP strip */}
// //       <div className="px-6 md:px-28 mt-20 mb-8">
// //         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
// //           <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
// //             <span className="text-xl text-sky-600"><FaShippingFast /></span>
// //             <div className="text-sm">
// //               <p className="font-semibold text-slate-800">Free Shipping</p>
// //               <p className="text-slate-500">On first order</p>
// //             </div>
// //           </div>
// //           <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
// //             <span className="text-xl text-sky-600"> <FaRepeat /> </span>
// //             <div className="text-sm">
// //               <p className="font-semibold text-slate-800">Easy Returns</p>
// //               <p className="text-slate-500">7-day hassle free</p>
// //             </div>
// //           </div>
// //           <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
// //             <span className="text-xl text-sky-600"><FaLock /></span>
// //             <div className="text-sm">
// //               <p className="font-semibold text-slate-800">Secure Payments</p>
// //               <p className="text-slate-500">UPI / Cards / Wallets</p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //     </>
// //   );
// // };

// // export default Hero;

// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import heroImg from "../../assets/heroimg.webp";
// import heroImg2 from "../../assets/hero_img.webp";
// import heroImg3 from "../../assets/hero3.webp";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay } from "swiper/modules";
// import "swiper/css";
// import useSmartLoader from "../../hooks/useSmartLoader";
// import axios from "axios";
// import { FaLock, FaShippingFast } from "react-icons/fa";
// import { FaRepeat } from "react-icons/fa6";
// import { motion } from "framer-motion";

// const Hero = () => {
//   const heroImages = [heroImg, heroImg2, heroImg3];
//   const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
//   const { loading } = useSmartLoader(async () => {
//     await new Promise((res) => setTimeout(res, 300));
//     return true;
//   });
//   const [collabActive, setCollabActive] = useState(false);

//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_BACKEND_URL}/api/collabs/active`)
//       .then((res) => setCollabActive(res.data.isActive))
//       .catch(() => setCollabActive(false));
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const now = new Date();
//       const end = new Date();
//       end.setHours(23, 59, 59, 999);
//       const diff = end - now;
//       setTimeLeft({
//         hours: Math.floor(diff / 1000 / 60 / 60),
//         minutes: Math.floor((diff / 1000 / 60) % 60),
//         seconds: Math.floor((diff / 1000) % 60),
//       });
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   if (collabActive) return null;
//   if (loading)
//     return (
//       <div className="md:h-[80vh] flex flex-col sm:flex-row justify-between gap-2 px-6 md:px-28 py-8">
//         <div className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0">
//           <div className="w-full h-60 bg-gray-200 rounded-2xl animate-pulse"></div>
//         </div>
//         <div className="w-full sm:w-1/2 aspect-square overflow-hidden">
//           <div className="w-full h-full bg-gray-200 rounded-full md:rounded-l-none md:rounded-r-full animate-pulse"></div>
//         </div>
//       </div>
//     );

//   return (
//     <div className="relative overflow-hidden">
//       {/* 🌈 Background Glow */}
//       <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-sky-50 to-white"></div>
//       <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-sky-300/30 blur-[120px] rounded-full animate-pulse"></div>
//       <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-300/30 blur-[120px] rounded-full animate-pulse"></div>

//       {/* Floating Offer Badge */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1 }}
//         className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
//       >
//         <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-5 py-2 rounded-full text-xs font-bold shadow-md animate-bounce">
//           🔥 Limited Time Offer!
//         </div>
//       </motion.div>

//       {/* Main Section */}
//       <div className="md:h-[80vh] flex flex-col sm:flex-row justify-between gap-2 px-6 md:px-28 py-8 md:py-4 relative z-10">
//         {/* Left Side */}
//         <motion.div
//           initial={{ opacity: 0, x: -50 }}
//           whileInView={{ opacity: 1, x: 0 }}
//           transition={{ duration: 1 }}
//           viewport={{ once: true }}
//           className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0 
//             bg-white/70 backdrop-blur-xl border border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.1)] rounded-2xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-1"
//         >
//           <div className="text-[#202020] px-4 space-y-4 text-center sm:text-left">
//             <div className="flex items-center gap-2 justify-center sm:justify-start">
//               <span className="w-8 h-[2px] bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"></span>
//               <p className="text-xs md:text-sm font-semibold tracking-wider text-sky-700 uppercase">
//                 Trending Now
//               </p>
//             </div>

//             <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-700 via-blue-600 to-indigo-700">
//               Refresh your wardrobe with Raphaaa
//             </h1>

//             <p className="text-gray-600 text-sm md:text-base font-medium tracking-wide">
//               Discover styles loved by thousands. Limited stocks available!
//             </p>

//             <div className="flex flex-col sm:flex-row items-center gap-3 mt-5">
//               <Link
//                 to="/collections/all"
//                 className="px-6 py-3 text-white bg-gradient-to-r from-sky-600 to-blue-700 font-semibold rounded-md shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
//               >
//                 Shop Now
//               </Link>
//               <span className="text-xs text-gray-500">Free delivery on first order</span>
//             </div>
//           </div>
//         </motion.div>

//         {/* Right Side */}
//         <motion.div
//           initial={{ opacity: 0, x: 50 }}
//           whileInView={{ opacity: 1, x: 0 }}
//           transition={{ duration: 1 }}
//           viewport={{ once: true }}
//           className="w-full sm:w-1/2 aspect-square overflow-hidden rounded-full md:rounded-l-none md:rounded-r-full shadow-xl border-4 border-white relative group"
//         >
//           <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"></div>
//           <Swiper
//             loop
//             autoplay={{ delay: 3000, disableOnInteraction: false }}
//             modules={[Autoplay]}
//             className="w-full h-full"
//           >
//             {heroImages.map((img, idx) => (
//               <SwiperSlide key={idx}>
//                 <motion.img
//                   src={img}
//                   alt={`Hero ${idx}`}
//                   width={1000}
//                   height={1000}
//                   className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
//                   loading="lazy"
//                 />
//               </SwiperSlide>
//             ))}
//           </Swiper>
//         </motion.div>
//       </div>

//       {/* USP Strip */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1 }}
//         viewport={{ once: true }}
//         className="px-6 md:px-28 mt-16 mb-8 z-10 relative"
//       >
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           {[
//             { icon: <FaShippingFast />, title: "Free Shipping", desc: "On first order" },
//             { icon: <FaRepeat />, title: "Easy Returns", desc: "7-day hassle free" },
//             { icon: <FaLock />, title: "Secure Payments", desc: "UPI / Cards / Wallets" },
//           ].map((item, i) => (
//             <motion.div
//               key={i}
//               whileHover={{ scale: 1.05 }}
//               className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white/80 backdrop-blur px-5 py-4 shadow-md hover:shadow-xl transition-all"
//             >
//               <span className="text-2xl text-sky-600">{item.icon}</span>
//               <div className="text-sm">
//                 <p className="font-semibold text-slate-800">{item.title}</p>
//                 <p className="text-slate-500">{item.desc}</p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Hero;

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
import { motion } from "framer-motion";

const Hero = () => {
  const heroImages = [heroImg, heroImg2, heroImg3];
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
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

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end - now;
      setTimeLeft({
        hours: Math.floor(diff / 1000 / 60 / 60),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (collabActive) return null;
  if (loading)
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

  return (
    <div className="relative overflow-hidden">
      {/* Gradient background with diagonal shape */}
      <div className="absolute inset-0"></div>

      {/* angled overlay */}
      <div className="absolute right-0 top-0 w-[60%] h-full bg-gradient-to-l from-blue-500 via-sky-300 to-transparent clip-path-diagonal"></div>

      {/* Floating glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-sky-400/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-400/20 blur-[120px] rounded-full"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-20 md:py-28">
        {/* LEFT SECTION */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 text-center md:text-left space-y-6"
        >
          <p className="text-sm uppercase font-semibold text-sky-600 tracking-widest">
            Trending Now
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700">
            Refresh your wardrobe <br /> with <span className="text-black">Raphaaa</span>
          </h1>

          <p className="text-gray-600 text-base md:text-lg font-medium max-w-md">
            Discover styles loved by thousands. Limited stocks available!
          </p>

          <div className="flex flex-col sm:flex-row items-center md:items-start gap-4">
            <Link
              to="/collections/all"
              className="px-6 py-3 text-white bg-gradient-to-r from-sky-600 to-blue-700 font-semibold rounded-md shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
            >
              Shop Now
            </Link>
            <span className="text-xs text-gray-500">Free delivery on first order</span>
          </div>
        </motion.div>

        {/* RIGHT SECTION */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 mt-10 md:mt-0 relative"
        >
          <div className=" overflow-hidden">
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
                    className="w-full h-[350px] md:h-[500px] object-cover hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* angled bottom wave divider */}
          <svg
            className="absolute bottom-[-0.5px] left-0 w-full"
            viewBox="0 0 1440 320"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,96L80,85.3C160,75,320,53,480,69.3C640,85,800,139,960,160C1120,181,1280,171,1360,165.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
        </motion.div>
      </div>

      {/* USP STRIP */}
      <div className="relative z-20 px-6 md:px-28 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: <FaShippingFast />, title: "Free Shipping", desc: "On first order" },
            { icon: <FaRepeat />, title: "Easy Returns", desc: "7-day hassle free" },
            { icon: <FaLock />, title: "Secure Payments", desc: "UPI / Cards / Wallets" },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white/80 backdrop-blur px-5 py-4 shadow-md hover:shadow-xl transition-all"
            >
              <span className="text-2xl text-sky-600">{item.icon}</span>
              <div className="text-sm">
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="text-slate-500">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* custom clip-path style */}
      <style jsx>{`
        .clip-path-diagonal {
          clip-path: polygon(20% 0, 100% 0, 100% 100%, 0 80%);
        }
      `}</style>
    </div>
  );
};

export default Hero;
