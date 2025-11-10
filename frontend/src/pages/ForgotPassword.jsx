import React, { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/forgot-password`,
        { email }
      );
      toast.success(data.message || "Reset link sent to your email");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[75vh] flex justify-center items-center p-6">
      <form onSubmit={handleSubmit} className="p-8 rounded-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Forgot Password
        </h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your registered email"
          className="bg-white w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2.5 rounded-lg font-semibold transition ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
