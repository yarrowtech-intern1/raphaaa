import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import sampleImg from "../../assets/heroimg.jpeg"; // Replace with actual product images

const topDeals = [
  {
    id: 1,
    title: "Streetwear Hoodie",
    price: "₹999",
    image: sampleImg,
    link: "/product/streetwear-hoodie",
  },
  {
    id: 2,
    title: "Oversized T-shirt",
    price: "₹599",
    image: sampleImg,
    link: "/product/oversized-tee",
  },
  {
    id: 3,
    title: "Denim Jacket",
    price: "₹1499",
    image: sampleImg,
    link: "/product/denim-jacket",
  },
  {
    id: 4,
    title: "Cargo Pants",
    price: "₹899",
    image: sampleImg,
    link: "/product/cargo-pants",
  },
];

const TopDealsScroller = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          left: 220,
          behavior: "smooth",
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-10 px-6 md:px-28">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Top Deals Today
      </h2>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {topDeals.map((item) => (
          <Link
            to={item.link}
            key={item.id}
            className="min-w-[180px] bg-white rounded-xl shadow-md hover:shadow-xl transition p-3"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-36 object-cover rounded-lg mb-2"
            />
            <h3 className="font-semibold text-sm truncate">{item.title}</h3>
            <p className="text-blue-600 font-bold text-sm">{item.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopDealsScroller;
