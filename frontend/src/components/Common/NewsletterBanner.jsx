import React from "react";

const NewsletterBanner = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-r from-sky-100 to-sky-200">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">
          Stay in the Loop
        </h2>
        <p className="text-gray-600 mb-6">
          Subscribe to get updates on new arrivals, discounts, and more.
        </p>
        <form className="flex flex-col sm:flex-row justify-center gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 rounded w-full sm:w-auto flex-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterBanner;