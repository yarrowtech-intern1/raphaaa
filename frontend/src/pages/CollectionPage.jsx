import React, { useEffect, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";
import FilterSidebar from "../components/Products/FilterSidebar";
import SortOptions from "../components/Products/SortOptions";
import ProductGrid from "../components/Products/ProductGrid";
import { useParams, useSearchParams, useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../redux/slices/productsSlice";
import { ImCross } from "react-icons/im";
import axios from "axios";
import { Helmet } from "react-helmet";

const CollectionPage = () => {
  const { collection } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const queryParams = Object.fromEntries([...searchParams]);

  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsDidebarOpen] = useState(false);
  const [collabActive, setCollabActive] = useState(null);

  useEffect(() => {
    // Check if a collab is active
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/collabs/active`)
      .then((res) => setCollabActive(res.data.isActive))
      .catch(() => setCollabActive(false));
  }, []);

  useEffect(() => {
    dispatch(fetchProductsByFilters({ collection, ...queryParams }));
  }, [dispatch, collection, searchParams]);

  const toggleSidebar = () => {
    setIsDidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsDidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearFilters = () => {
    navigate(`/collections/${collection}`);
  };

  // 🚫 Block `/collections/all` when a collab is active
  if (collabActive && collection === "all") {
    return <Navigate to="/404" />;
  }

  // -----------------------
  // ⭐ SEO HELMET DATA
  // -----------------------
  const pageTitle = `${collection} Collection | Raphaaa`;
  const pageDesc = `Explore the premium ${collection} collection from Raphaaa — trendy, premium-quality, and crafted for comfort. Shop now!`;
  // const canonicalUrl = `https://raphaaa.com/collections/${collection}`;
  const canonicalUrl = `http://localhost:5173/collections/${collection}`;


  return (

    <>
      <Helmet>
        <title>{pageTitle}</title>

        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={`${collection}, raphaaa collections, fashion, clothing`} />

        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Raphaaa" />

        {/* Twitter */}
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="flex p-2 md:p-6 flex-col lg:flex-row gap-4">
        {/* Mobile bar */}
        <div className="lg:hidden flex items-center justify-between mb-2">
          <button
            onClick={toggleSidebar}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                     bg-white border border-gray-200 text-gray-800
                     shadow-sm hover:bg-gray-50"
          >
            <FaFilter className="text-sky-600" /> Filters
          </button>

          {searchParams.toString() && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm transition-all"
            >
              <ImCross className="inline mr-1" /> Clear
            </button>
          )}
        </div>

        {/* Backdrop for mobile drawer */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsDidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
                    w-72 md:w-[380px] overflow-y-auto
                    transition-transform duration-300
                    lg:translate-x-0 rounded-none lg:rounded-2xl`}
        >
          <FilterSidebar />
        </div>

        {/* Main */}
        <div className="flex-grow px-1 md:px-2 lg:pl-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide
                         bg-clip-text text-transparent bg-gradient-to-r from-sky-700 to-blue-700">
              {collection} Collection
            </h2>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Sort By:</span>
              <div className="rounded-full">
                <SortOptions />
              </div>
            </div>
          </div>

          {/* Sort for mobile inline */}
          <div className="sm:hidden mb-3">
            <div className="rounded-full inline-block">
              <SortOptions />
            </div>
          </div>

          {searchParams.toString() && (
            <button
              onClick={handleClearFilters}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2
                       bg-red-500 hover:bg-red-600 text-white rounded-full text-sm mb-3"
            >
              <ImCross className="inline" /> Clear All Filters
            </button>
          )}

          <ProductGrid products={products} loading={loading} error={error} />
        </div>
      </div>
    </>
  );
};

export default CollectionPage;
