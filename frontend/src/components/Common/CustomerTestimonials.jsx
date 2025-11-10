import React from "react";

const CustomerTestimonials = () => {
  const testimonials = [
    { name: "Ria S.", message: "Absolutely love the quality and fit!", location: "Mumbai" },
    { name: "Ankit T.", message: "Fast delivery and great service.", location: "Delhi" },
    { name: "Sneha P.", message: "Stylish and affordable – perfect combo!", location: "Kolkata" },
  ];

  return (
    <section className="py-12 px-4 bg-blue-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-xl shadow p-6 text-center hover:shadow-lg transition"
            >
              <p className="text-gray-600 italic">“{t.message}”</p>
              <h4 className="mt-4 font-semibold text-blue-600">- {t.name}</h4>
              <p className="text-sm text-gray-500">{t.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonials;