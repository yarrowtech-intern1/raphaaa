import React, { useRef, useState, useEffect } from "react";
import JoditEditor from "jodit-react";
import axios from "axios";
import { toast } from "sonner";

const AboutUsEditor = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");

  // Fetch existing content
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const { data } = await axios.get("/api/about");
        setContent(data.description);
      } catch (error) {
        console.error("Failed to fetch About Us content");
      }
    };
    fetchAbout();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/api/about", { description: content });
      toast.success("About Us updated successfully!");
    } catch (error) {
      toast.error("Failed to update About Us.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md mt-10 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">Edit About Us Page</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <JoditEditor
          ref={editor}
          value={content}
          tabIndex={1}
          onChange={(newContent) => setContent(newContent)}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default AboutUsEditor;
