// src/components/Products/PreviouslyViewed.jsx
import React from "react";
import ProductCard from "../components/Products/ProductCard";

const PreviouslyViewed = () => {
  // static data
  const viewedProducts = [
    {
      _id: "1",
      name: "Raphaaa Street Hoodie",
      price: 1999,
      discountPrice: 1499,
      offerPercentage: 25,
      countInStock: 8,
      rating: 4.5,
      numReviews: 42,
      image: "https://via.placeholder.com/300x300.png?text=Hoodie",
      createdAt: new Date(),
    },
    {
      _id: "2",
      name: "Urban Fit Joggers",
      price: 1799,
      discountPrice: 1299,
      offerPercentage: 28,
      countInStock: 12,
      rating: 4.3,
      numReviews: 36,
      image: "https://via.placeholder.com/300x300.png?text=Joggers",
      createdAt: new Date(),
    },
    {
      _id: "3",
      name: "Classic Oversized Tee",
      price: 999,
      discountPrice: 799,
      offerPercentage: 20,
      countInStock: 15,
      rating: 4.8,
      numReviews: 55,
      image: "https://via.placeholder.com/300x300.png?text=T-Shirt",
      createdAt: new Date(),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center mb-6 text-sky-700">
        Previously Viewed
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {viewedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default PreviouslyViewed;
