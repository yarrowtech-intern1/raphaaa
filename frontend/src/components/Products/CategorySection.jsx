import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Tshirt  from "../../assets/t-shirt.webp";
import women   from "../../assets/women.webp";
import casual  from "../../assets/casual.webp";
import classic from "../../assets/classic.webp";
import axios from "axios";

const CATEGORIES = [
  {
    name:    "T-Shirts",
    tag:     "Men · Women",
    image:   Tshirt,
    slug:    "search=t-shirt",
    accent:  "from-sky-600 to-blue-700",
  },
  {
    name:    "Women",
    tag:     "Top Wear",
    image:   women,
    slug:    "category=Top+Wear&gender=Women",
    accent:  "from-pink-500 to-rose-600",
  },
  {
    name:    "Casual",
    tag:     "Everyday Fits",
    image:   casual,
    slug:    "search=casual",
    accent:  "from-amber-500 to-orange-600",
  },
  {
    name:    "Classic",
    tag:     "Timeless Style",
    image:   classic,
    slug:    "jackets",
    accent:  "from-slate-600 to-gray-800",
  },
];

/* ── Skeleton ── */
const Skeleton = () => (
  <div className="animate-pulse rounded-2xl overflow-hidden bg-gray-100 aspect-3/4" />
);

const CategorySection = () => {
  const [collabActive, setCollabActive] = useState(false);
  const [ready,        setReady]        = useState(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/collabs/active`)
      .then(r => setCollabActive(r.data.isActive))
      .catch(() => setCollabActive(false))
      .finally(() => setTimeout(() => setReady(true), 280));
  }, []);

  if (collabActive) return null;

  return (
    <section className="px-4 md:px-10 lg:px-16 py-14">

      {/* ── Section header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-sky-600 uppercase mb-2">
            Curated For You
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Shop by Category
          </h2>
        </div>
        <Link
          to="/collections/all"
          className="text-xs font-bold text-sky-600 hover:text-blue-700 flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition group"
        >
          View All
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* ── Category grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {!ready
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
          : CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/collections/all?${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-3/4 block"
              >
                {/* ── Product image ── */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                />

                {/* ── Permanent bottom gradient ── */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/65 via-black/25 to-transparent pointer-events-none" />

                {/* ── Category info (always visible at bottom) ── */}
                <div className="absolute inset-x-0 bottom-0 p-4 z-10">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-white/70 uppercase mb-0.5">
                    {cat.tag}
                  </p>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
                    {cat.name}
                  </h3>

                  {/* Shop Now — slides up on hover */}
                  <div className="overflow-hidden h-0 group-hover:h-8 transition-all duration-300 ease-out mt-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold text-white bg-linear-to-r ${cat.accent} px-3 py-1.5 rounded-full`}>
                      Shop Now
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </div>

                {/* ── Top label pill ── */}
                <div className="absolute top-3 left-3 z-10">
                  <span className={`text-[9px] font-bold tracking-widest uppercase text-white bg-linear-to-r ${cat.accent} px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    {cat.name}
                  </span>
                </div>

                {/* ── Hover border glow ── */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-white/30 transition-all duration-300 pointer-events-none" />
              </Link>
            ))
        }
      </div>

      {/* ── Bottom strip — gender quick links ── */}
      <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
        {[
          { label: "👔  Men's",    href: "/collections/all?gender=Men"   },
          { label: "👗  Women's",  href: "/collections/all?gender=Women" },
          { label: "🧒  Kids",     href: "/collections/all?gender=Kids"  },
          { label: "✨  New In",   href: "/collections/all"              },
        ].map(({ label, href }) => (
          <Link
            key={label}
            to={href}
            className="px-5 py-2 text-xs font-semibold border border-gray-200 rounded-full text-gray-600 hover:border-sky-500 hover:text-sky-700 hover:bg-sky-50 transition-all"
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
