import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FaPen } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";

const AddMetaOption = () => {
    const [type, setType] = useState("category");
    const [value, setValue] = useState("");
    const [options, setOptions] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editedValue, setEditedValue] = useState("");

    const fetchOptions = async () => {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options`);
        setOptions(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!value) return toast.error("Please enter a value");

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options`, { type, value });
            toast.success("Option added");
            setValue("");
            fetchOptions();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options/${id}`);
            toast.success("Deleted");
            fetchOptions();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleSave = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/meta-options/${id}`, {
                value: editedValue,
            });
            toast.success("Updated");
            setEditingId(null);
            setEditedValue("");
            fetchOptions();
        } catch {
            toast.error("Update failed");
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-100 p-6 rounded-2xl shadow-lg border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center tracking-wide">
                Manage Product Categories
            </h2>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl"
            >
                <select
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <option value="category">Category</option>
                    <option value="collection">Collection</option>
                    <option value="gender">Gender</option>
                    <option value="material">Fabric</option>
                </select>

                <input
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    placeholder={`Add new ${type}`}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />

                <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                >
                    Add
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                {["category", "collection", "gender", "material"].map((t) => (
                    <div
                        key={t}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition"
                    >
                        <h3 className="text-md font-semibold text-blue-700 mb-3 capitalize border-b pb-1">
                            {t}s
                        </h3>
                        <ul className="text-sm text-gray-700 space-y-1">
                            {options
                                .filter((o) => o.type === t)
                                .map((opt) => (
                                    <li key={opt._id} className="flex justify-between items-center group">
                                        {editingId === opt._id ? (
                                            <input
                                                type="text"
                                                value={editedValue}
                                                onChange={(e) => setEditedValue(e.target.value)}
                                                className="px-2 py-1 border rounded text-sm flex-1 mr-2 outline-0"
                                            />
                                        ) : (
                                            <span>{opt.value}</span>
                                        )}

                                        <div className="flex items-center gap-2 ml-3 opacity-80 group-hover:opacity-100 transition">
                                            {editingId === opt._id ? (
                                                <button
                                                    onClick={() => handleSave(opt._id)}
                                                    className="bg-green-600 hover:bg-green-800 text-white p-1 rounded"
                                                    title="Save"
                                                >
                                                    <FaCheck />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingId(opt._id);
                                                        setEditedValue(opt.value);
                                                    }}
                                                    className="bg-blue-600 hover:bg-blue-800 text-white p-1 rounded"
                                                    title="Edit"
                                                >
                                                    <FaPen />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(opt._id)}
                                                className="bg-red-600 hover:bg-red-800 text-white p-1 rounded"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                        </ul>

                    </div>
                ))}
            </div>
        </div>
    );

};

export default AddMetaOption;
