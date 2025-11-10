import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const HeroSettings = () => {
  const [title, setTitle] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [existingHero, setExistingHero] = useState(null);

  // Fetch existing hero data
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/website/hero`
        );
        setExistingHero(res.data);
        setTitle(res.data.title || "");
        setParagraph(res.data.paragraph || "");
        setPreview(res.data.image || "");
      } catch (error) {
        console.error("Failed to fetch hero data", error);
      }
    };
    fetchHero();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const updatedTitle = title || existingHero?.title;
  const updatedParagraph = paragraph || existingHero?.paragraph;

  if (!updatedTitle || !updatedParagraph) {
    toast.error("Please fill at least one field.");
    return;
  }

  const formData = new FormData();
  formData.append("title", updatedTitle);
  formData.append("paragraph", updatedParagraph);
  if (image) formData.append("image", image); // only send if image changed

  try {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/website/hero`,
      formData
    );
    toast.success("Hero section updated!");
    setImage(null);
  } catch (error) {
    console.error("Upload failed:", error);
    toast.error("Failed to update hero section.");
  }
};


  return (
    <div className="px-4 py-10 max-w-6xl mx-auto">
        {/* Preview Section Below Form */}
      {existingHero && (
        <div className="md:h-[80vh] flex flex-col sm:flex-row justify-between gap-2 px-6 md:px-10 py-8 mt-10">
          {/* Hero Left Side */}
          <div
            className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0 
            bg-white/70 backdrop-blur-lg border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl"
          >
            <div className="text-[#414141]">
              <div className="flex items-center gap-2">
                <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
                <p className="font-medium text-sm md:text-base">OUR BESTSELLERS</p>
              </div>
              <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed">
                {existingHero?.title || "Latest Arrivals"}
              </h1>
              <p className="text-sm text-gray-600 py-2">{existingHero?.paragraph}</p>
              <div className="flex items-center gap-2">
                <Link
                  to="/collections/all"
                  className="font-semibold text-sm md:text-base bg-[#414141] text-white p-2"
                >
                  SHOP NOW
                </Link>
                <p className="w-8 md:w-11 h-[1px] bg-[#414141]"></p>
              </div>
            </div>
          </div>

          {/* Hero Right Side */}
          <div className="w-full sm:w-1/2 aspect-square overflow-hidden">
            <img
              src={existingHero.image}
              alt="Hero Preview"
              className="w-full h-full object-cover transition-all duration-1000 ease-in-out 
                rounded-full md:rounded-l-none md:rounded-r-full"
            />
          </div>
        </div>
      )}
      {/* Form Section */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">
          Update Hero Section
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Hero Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter hero title"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Hero Paragraph</label>
            <textarea
              rows="4"
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
              placeholder="Enter hero description"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Hero Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-sky-600 file:text-white file:font-semibold"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-full mt-4 rounded-lg shadow object-cover h-52"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-semibold transition duration-200"
          >
            Save Settings
          </button>
        </form>
      </div>

      
    </div>
  );
};

export default HeroSettings;
