// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";
// import Tshirt from "../../assets/t-shirt.webp";
// import women from "../../assets/women.webp";
// import casual from "../../assets/casual.webp";
// import classic from "../../assets/classic.webp";
// import useSmartLoader from "../../hooks/useSmartLoader";
// import axios from "axios";

// const categories = [
//   {
//     name: "T-Shirts",
//     image: Tshirt,
//     slug: "search=t-shirt",
//   },
//   {
//     name: "Women",
//     image: women,
//     slug: "category=Top+Wear&gender=Women",
//   },
//   {
//     name: "Casual",
//     image: casual,
//     slug: "search=casual",
//   },
//   {
//     name: "Classic",
//     image: classic,
//     slug: "jackets",
//   },
// ];

// const CategorySection = () => {
//   const [collabActive, setCollabActive] = useState(false);

//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_BACKEND_URL}/api/collabs/active`)
//       .then((res) => setCollabActive(res.data.isActive))
//       .catch(() => setCollabActive(false));
//   }, []);

//   const { loading } = useSmartLoader(async () => {
//     await new Promise((res) => setTimeout(res, 300));
//     return true;
//   });

//   // ⛔️ Hide if collab is active
//   if (collabActive) return null;

//   return (
//     <section className="px-4 md:px-16 py-12">
//       <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
//         Shop by Category
//       </h2>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
//         {loading
//           ? Array.from({ length: 4 }).map((_, idx) => (
//               <div
//                 key={idx}
//                 className="bg-white border border-gray-200 rounded-t-full rounded-b-xl flex flex-col items-center justify-center text-center animate-pulse"
//               >
//                 <div className="w-full h-full p-4">
//                   <div className="w-28 h-28 bg-gray-200 rounded-full mx-auto mb-4" />
//                   <div className="h-4 w-24 bg-gray-300 mx-auto rounded"></div>
//                 </div>
//               </div>
//             ))
//           : categories.map((category) => (
//               <Link
//                 to={`/collections/all?${category.slug}`}
//                 key={category.slug}
//                 className="bg-white/20 backdrop-blur-md border border-white/20 hover:shadow-xl rounded-t-full rounded-b-xl flex flex-col items-center justify-between text-center transition-all duration-300 group relative overflow-hidden hover:ring-2 hover:ring-sky-400 hover:ring-offset-2"
//               >
//                 <div className="flex items-center justify-center min-h-[130px] relative z-10">
//                   <div className="absolute w-40 h-40 rounded-full blur-lg bg-sky-800 opacity-30 z-0 group-hover:scale-125 transition-transform duration-500" />
//                   <img
//                     src={category.image}
//                     alt={category.name}
//                     width={200}
//                     height={200}
//                     className="w-44 h-44 sm:w-52 sm:h-52 object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
//                     loading="lazy"
//                   />
//                 </div>

//                 <p className="text-lg md:text-xl font-semibold w-full py-2 text-white bg-gradient-to-r from-pink-500 to-red-600 group-hover:opacity-95 z-10 shadow-inner">
//                   {category.name}
//                 </p>
//               </Link>
//             ))}
//       </div>
//     </section>
//   );
// };

// export default CategorySection;

import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Tshirt from "../../assets/t-shirt.webp";
import women from "../../assets/women.webp";
import casual from "../../assets/casual.webp";
import classic from "../../assets/classic.webp";
import useSmartLoader from "../../hooks/useSmartLoader";
import axios from "axios";

const categories = [
  { name: "T-Shirts", image: Tshirt, slug: "search=t-shirt" },
  { name: "Women", image: women, slug: "category=Top+Wear&gender=Women" },
  { name: "Casual", image: casual, slug: "search=casual" },
  { name: "Classic", image: classic, slug: "jackets" },
];

const CategorySection = () => {
  const [collabActive, setCollabActive] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/collabs/active`)
      .then((res) => setCollabActive(res.data.isActive))
      .catch(() => setCollabActive(false));
  }, []);

  const { loading } = useSmartLoader(async () => {
    await new Promise((res) => setTimeout(res, 300));
    return true;
  });

  // ⛔️ Hide if collab is active
  if (collabActive) return null;

  const skeletonCards = useMemo(() => Array.from({ length: 4 }), []);

  return (
    <section className="px-4 md:px-16 py-12">
      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          <span className="">
            Shop by Category
          </span>
        </h2>
        <div className="mt-3 h-1 w-28 mx-auto rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {loading
          ? skeletonCards.map((_, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-[2rem] bg-white/70 ring-1 ring-sky-100 shadow-sm"
            >
              <div className="flex flex-col items-center justify-center p-6">
                <div className="relative">
                  <div className="h-36 w-36 rounded-full bg-slate-200 animate-pulse" />
                  <div className="pointer-events-none absolute inset-0 rounded-full ring-8 ring-sky-100/50" />
                </div>
                <div className="h-4 w-24 bg-slate-200 rounded mt-6 animate-pulse" />
              </div>
            </div>
          ))
          : categories.map((category) => (
            <Link
              to={`/collections/all?${category.slug}`}
              key={category.slug}
              className="group relative overflow-hidden rounded-[2rem] bg-white/80 backdrop-blur ring-1 ring-sky-100 hover:ring-sky-300 shadow-sm hover:shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/60"
            >
              {/* soft top aura */}
              <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-36 w-72 rounded-full bg-sky-200/40 blur-3xl" />

              {/* image behind */}
              <div className="flex items-center justify-center min-h-[300px] px-4 relative">
                <div className="relative h-40 w-40 sm:h-44 sm:w-44 rounded-full grid place-items-center ring-8 ring-sky-200 group-hover:ring-sky-300 transition">
                  <img
                    src={category.image}
                    alt={category.name}
                    width={500}
                    height={500}
                    loading="lazy"
                    className="object-contain h-full w-full transition-transform duration-300 group-hover:scale-105 z-0"
                  />
                </div>
              </div>

              {/* label fixed to bottom, over the image */}
              <div className="absolute inset-x-0 bottom-0 z-10">
                <p className="text-center text-base md:text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-500 py-2 rounded-t-xl shadow-inner">
                  {category.name}
                </p>
              </div>

              {/* subtle bottom fade */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-sky-100/60 to-transparent" />
            </Link>

          ))}
      </div>
    </section>
  );
};

export default CategorySection;
