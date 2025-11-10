import React, { useState, useEffect } from "react";
import contactImg from "../../assets/product4.jpg";
import axios from "axios";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/contact`,
        formData
      );
      toast.success("Message sent successfuly!!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
        "Failed to send message. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/settings/contact`
        );
        setContactInfo(res.data);
      } catch (err) {
        console.error("Failed to load contact settings", err);
      }
    };
    fetchContactInfo();
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden border border-gray-100 shadow-xl bg-white">
        {/* Top accent */}
        {/* <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500" /> */}

        <div className="grid md:grid-cols-2">
          {/* Left: Image with subtle overlay */}
          <div className="relative h-full w-full">
            <img
              src={contactImg}
              alt="Contact Us"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-black/0 to-black/0" />
          </div>

          {/* Right: Form & Info */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
                Get in Touch
              </h2>
              <p className="mt-2 text-gray-600 leading-relaxed text-base">
                We’d love to hear from you. Whether you have a question about our products,
                need support, or just want to connect—drop a message below.
              </p>
            </div>

            {/* Info chips */}
            <div className="flex flex-col gap-2 text-sm md:text-base mb-6">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 text-white rounded-full bg-indigo-600 text-xs">✉</span>
                <p className="text-gray-800 font-medium">
                  Email:&nbsp;
                  {contactInfo?.showGmail ? (
                    <span className="text-indigo-700 underline decoration-indigo-200 underline-offset-4">
                      {contactInfo.gmail}
                    </span>
                  ) : (
                    <span className="text-gray-500">Hidden</span>
                  )}
                </p>
              </div>

              <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 text-white rounded-full bg-emerald-600 text-xs">☎</span>
                <p className="text-gray-800 font-medium">
                  Phone:&nbsp;
                  {contactInfo?.showPhone ? (
                    <span className="text-emerald-700">{contactInfo.phone}</span>
                  ) : (
                    <span className="text-gray-500">Hidden</span>
                  )}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-2 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder=" "
                      className="peer w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      required
                    />
                    <label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 px-1 text-gray-500 bg-white transition-all duration-150
                                       peer-focus:text-xs peer-focus:-top-1 peer-focus:text-indigo-600
                                       peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:-top-1">
                      Your Name
                    </label>
                  </div>
                </div>

                <div className="w-full">
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=" "
                      className="peer w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      required
                    />
                    <label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 px-1 text-gray-500 bg-white transition-all duration-150
                                       peer-focus:text-xs peer-focus:-top-1 peer-focus:text-indigo-600
                                       peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:-top-1">
                      Your Email
                    </label>
                  </div>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
                <label className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 px-1 text-gray-500 bg-white transition-all duration-150
                                   peer-focus:text-xs peer-focus:-top-1 peer-focus:text-indigo-600
                                   peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:-top-1">
                  Subject
                </label>
              </div>

              <div className="relative">
                <textarea
                  placeholder=" "
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="peer w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-y"
                  required
                ></textarea>
                <label className="pointer-events-none absolute left-3 top-4 px-1 text-gray-500 bg-white transition-all duration-150
                                   peer-focus:text-xs peer-focus:-top-2 peer-focus:text-indigo-600
                                   peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:-top-2">
                  Your Message
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-3 rounded-xl text-white font-semibold shadow-sm transition duration-200
                  ${isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 hover:opacity-95"}`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {/* Subtle note */}
              <p className="text-xs text-gray-500 text-center">
                We typically respond within 24–48 hours
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
