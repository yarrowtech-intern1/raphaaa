import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slices/authSlice";
import { toast } from "sonner";

const RegisterDeliveryBoy = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState("Weak");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate("/delivery-login"); // Redirect after successful registration
    }
  }, [user, navigate]);

  useEffect(() => {
    let strength = 0;
    if (password.length >= 6) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[@$!%*?&]/.test(password)) strength += 20;

    setPasswordStrength(strength);
    setStrengthLabel(
      strength < 40 ? "Weak" : strength < 80 ? "Medium" : "Strong"
    );
  }, [password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    if (!email.trim()) return toast.error("Email is required");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return toast.error("Enter a valid email");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    dispatch(registerUser({ name, email, password, role: "delivery_boy" }));
  };

  return (
    <div className="flex h-[80vh]">
      <div className="w-full flex flex-col justify-center items-center p-6 sm:p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center w-fit">
              <h2 className="text-3xl font-bold text-gray-800">
                Delivery Boy Register
              </h2>
              <span className="h-1 w-16 ml-3 bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"></span>
            </div>
          </div>

          <div className="mb-5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Enter your email address"
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Enter your password"
            />
          </div>

          {password && (
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Strength: {strengthLabel}
              </span>
              <div className="w-2/3 h-2 rounded-full bg-gray-200 overflow-hidden ml-3">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${passwordStrength}%`,
                    background:
                      passwordStrength < 40
                        ? "linear-gradient(to right, #f87171, #ef4444)"
                        : passwordStrength < 80
                        ? "linear-gradient(to right, #facc15, #fbbf24)"
                        : "linear-gradient(to right, #4ade80, #22c55e)",
                  }}
                ></div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white p-2.5 rounded-lg font-semibold hover:opacity-90 transition duration-300"
          >
            {loading ? "Registering..." : "Register as Delivery Boy"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already a delivery boy?{" "}
            <Link
              to="/login"
              className="text-sky-600 font-medium hover:underline"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterDeliveryBoy;
