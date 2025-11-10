import React, { useEffect, useState } from "react";
import aboutImg from "../../assets/product3.jpg";
import axios from "axios";

const About = () => {
  const [aboutContent, setAboutContent] = useState("");

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/settings/about`);
        setAboutContent(data.content);
      } catch (error) {
        console.error("Failed to fetch About Us content");
      }
    };
    fetchAbout();
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left: Image */}
          <div className="h-full w-full">
            <img
              src={aboutImg}
              alt="About Raphaa"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Right: Dynamic Content */}
          <div className="p-8 md:p-12 flex flex-col justify-center space-y-5 text-gray-800">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
              About <span className="text-blue-600">RAPHAAA</span>
            </h1>

            {aboutContent ? (
              <div
                className="text-lg leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: aboutContent }}
              />
            ) : (
              <p className="text-gray-500">Loading content...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
