import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import menImg   from "../../assets/mens-collection.jpg";
import womenImg from "../../assets/womens-collection.jpg";
import product1 from "../../assets/product1.webp";
import product2 from "../../assets/product2.webp";
import useSmartLoader from "../../hooks/useSmartLoader";
import axios from "axios";

/* ── individual card ─────────────────────────────────────────────── */
const GenderCard = ({ image, alt, badge, badgeDot, title, sub, href, size = "large" }) => (
  <Link
    to={href}
    className={`group relative overflow-hidden block w-full h-full ${
      size === "large" ? "aspect-3/4 md:aspect-auto" : "aspect-4/3 md:aspect-auto"
    }`}
  >
    {/* image */}
    <img
      src={image}
      alt={alt}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />

    {/* dark gradient */}
    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />

    {/* hover: subtle blue glow from bottom */}
    <div className="absolute inset-0 bg-linear-to-t from-sky-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    {/* top badge */}
    <div className="absolute top-4 left-4 z-10">
      <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-[11px] font-bold text-sky-700 px-2.5 py-1 rounded-full border border-sky-100 shadow-sm">
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${badgeDot}`} />
        {badge}
      </span>
    </div>

    {/* bottom content */}
    <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-7">
      {/* title — always visible */}
      <p className="text-[11px] font-bold tracking-[0.18em] text-white/60 uppercase mb-1">
        {sub}
      </p>
      <h3 className={`font-extrabold text-white leading-tight ${
        size === "large" ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"
      }`}>
        {title}
      </h3>

      {/* CTA — slides up on hover */}
      <div className="mt-4 overflow-hidden h-0 group-hover:h-10 transition-all duration-300 ease-out">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-white bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full hover:bg-white/30 transition">
          Explore Collection
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </span>
      </div>
    </div>
  </Link>
);

/* ── skeleton ─────────────────────────────────────────────────────── */
const Skeleton = () => (
  <section className="px-4 sm:px-6 lg:px-16 py-10 md:py-12 lg:py-14">
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-52 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      <div className="lg:col-span-2 h-120 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="grid grid-rows-2 gap-3 md:gap-4 h-120">
        <div className="bg-gray-100 rounded-2xl animate-pulse" />
        <div className="bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  </section>
);

/* ── main component ───────────────────────────────────────────────── */
const GenderCollectionSection = () => {
  const { loading } = useSmartLoader(async () => {
    await new Promise(r => setTimeout(r, 280));
    return true;
  });

  const [collabActive, setCollabActive] = useState(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/collabs/active`)
      .then(r => setCollabActive(r.data.isActive))
      .catch(() => setCollabActive(false));
  }, []);

  if (collabActive) return null;
  if (loading) return <Skeleton />;

  return (
    <section className="px-4 sm:px-6 lg:px-16 py-10 md:py-12 lg:py-14">

      {/* ── Section header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-sky-600 uppercase mb-2">
            Collections
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Shop by Gender
          </h2>
        </div>
        <Link
          to="/collections/all"
          className="text-xs font-bold text-sky-600 hover:text-blue-700 flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition group"
        >
          View All Collections
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* ── Asymmetric grid ── */}
      {/*
        Desktop: [Women — 2 cols] [Men + Kids — 1 col, stacked]
        Mobile:  all three stack vertically
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">

        {/* Women — takes 2/3 width on desktop */}
        <div className="md:col-span-2 rounded-2xl overflow-hidden h-[420px] sm:h-[520px] md:h-140 relative">
          <GenderCard
            image={product1 || womenImg}
            alt="Women's Collection"
            badge="New Season"
            badgeDot="bg-sky-400"
            title="Women's Collection"
            sub="For Her"
            href="/collections/all?gender=Women"
            size="large"
          />
        </div>

        {/* Men + Kids — stacked in right 1/3 */}
        <div className="grid grid-rows-2 gap-2.5 sm:gap-3 md:gap-4 h-auto md:h-140">
          <div className="rounded-2xl overflow-hidden h-[210px] sm:h-[250px] md:h-full">
            <GenderCard
              image={product2 || menImg}
              alt="Men's Collection"
              badge="Trending"
              badgeDot="bg-blue-400"
              title="Men's Collection"
              sub="For Him"
              href="/collections/all?gender=Men"
              size="small"
            />
          </div>
          <div className="rounded-2xl overflow-hidden h-[210px] sm:h-[250px] md:h-full">
            <GenderCard
              image={menImg}
              alt="Kids Collection"
              badge="Just In"
              badgeDot="bg-emerald-400"
              title="Kids' Collection"
              sub="For Them"
              href="/collections/all?gender=Kids"
              size="small"
            />
          </div>
        </div>
      </div>

      {/* ── Bottom strip — quick gender links ── */}
      <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
        {[
          { label: "Shop Women →", href: "/collections/all?gender=Women", cls: "text-sky-700 border-sky-200 hover:bg-sky-50 hover:border-sky-400" },
          { label: "Shop Men →",   href: "/collections/all?gender=Men",   cls: "text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-400" },
          { label: "Shop Kids →",  href: "/collections/all?gender=Kids",  cls: "text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400" },
        ].map(({ label, href, cls }) => (
          <Link
            key={label}
            to={href}
            className={`px-5 py-2 text-xs font-bold border rounded-full transition-all ${cls}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default GenderCollectionSection;
