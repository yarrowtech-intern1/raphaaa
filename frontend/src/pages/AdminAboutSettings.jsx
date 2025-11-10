import React, { useRef, useState, useEffect } from "react";
import JoditEditor from "jodit-react";
import axios from "axios";
import { toast } from "sonner";

const AdminAboutSettings = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");

  // ✅ Fetch existing About Us content
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/settings/about`);
        setContent(data.content || "");
      } catch (error) {
        console.error("Failed to fetch About Us content");
        toast.error("Failed to load About Us content");
      }
    };
    fetchAbout();
  }, []);

  // ✅ Submit updated content
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/settings/about`, { content });
      toast.success("About Us updated successfully!");
    } catch (error) {
      console.error("Failed to update About Us content");
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

export default AdminAboutSettings;
