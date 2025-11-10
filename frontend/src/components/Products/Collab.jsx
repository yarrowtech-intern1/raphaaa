import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import axios from "axios";

const Collab = () => {
  const [featuredCollab, setFeaturedCollab] = useState(null);

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
    <section className="relative w-full">
      {/* Background Image */}
      <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        <img
          src={featuredCollab.image}
          alt="Featured Collab"
          className="w-full h-full object-cover object-center"
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center px-6 md:px-16 lg:px-24 text-white">
          <span className="bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full w-fit mb-4 uppercase">
            Limited Edition
          </span>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Raphaaa X {featuredCollab.title}
          </h1>

          <p className="text-sm md:text-lg lg:text-xl max-w-xl mb-6">
            Step into the spotlight with our electrifying collab featuring world
            football stars. A powerful blend of street fashion and sports
            heritage — bold, iconic, and limited.
          </p>

          <Link
            to="/exclusive-drop"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full text-white text-lg font-semibold transition-transform hover:scale-105 self-start"
          >
            Explore Drop <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Collab;
