import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const CreateTask = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    const userInfo =
      JSON.parse(localStorage.getItem("userInfo")) || {
        name: "Unknown",
        email: "unknown@example.com",
      };

    setFormData((prev) => ({
      ...prev,
      name: userInfo.name,
      email: userInfo.email,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const { name, email, title, description } = formData;

  if (!title || !description) {
    toast.error("Both title and description are required.");
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, title, description }),
    });

    if (!res.ok) throw new Error("Failed to create task");

    toast.success("Task created successfully!");
    setFormData((prev) => ({ ...prev, title: "", description: "" }));
  } catch (err) {
    toast.error("Failed to create task");
    console.error(err);
  }
};



  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Create New Task</h2>

      {/* Task Form */}
      <div className="p-6 bg-white shadow-md rounded-lg">
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-medium">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              readOnly
              className="w-full px-4 py-2 border border-gray-200 bg-gray-100 text-gray-600 rounded-md focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full px-4 py-2 border border-gray-200 bg-gray-100 text-gray-600 rounded-md focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* Title */}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 mb-1 font-medium"
            >
              Task Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-gray-700 mb-1 font-medium"
            >
              Task Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded shadow"
          >
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
