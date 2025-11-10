import React from "react";
import { Link } from "react-router-dom";

const ChatBot = ({ onClose }) => {
  return (
    <div className="fixed bottom-32 right-6 w-80 bg-white border border-gray-200 shadow-2xl rounded-xl z-50 overflow-hidden animate-fade-in-up">
      <div className="bg-pink-500 text-white px-4 py-3 font-semibold flex justify-between items-center">
        <span>Raphaaa Assistant</span>
        <button onClick={onClose} className="text-sm font-bold">✕</button>
      </div>
      <div className="p-4 text-sm space-y-3 max-h-[300px] overflow-y-auto text-gray-700">
        <p>👕 <strong>Welcome to Raphaaa!</strong> Your destination for bold fashion, football collabs, and exclusive drops.</p>
        
        <ul className="list-disc pl-5 space-y-1">
          <li>⚡ New Arrivals & Limited Editions</li>
          <li>🌍 Free Global Shipping</li>
          <li>🔐 Secure Checkout Experience</li>
          <li>↩️ 45-Day Hassle-Free Returns</li>
        </ul>

        <hr className="my-2" />

        <h4 className="font-semibold">🤔 Need Help?</h4>
        <ul className="space-y-1 pl-2">
          <li><Link to="/collections/all" className="text-blue-600 underline">Browse All Products</Link></li>
          <li><Link to="/exclusive-drop" className="text-blue-600 underline">Explore Our Collab Drop</Link></li>
          <li><Link to="/contact" className="text-blue-600 underline">Contact Support</Link></li>
        </ul>

        <hr className="my-2" />

        <p>🚀 More features coming soon: order status, smart search, and live chat!</p>
      </div>
    </div>
  );
};

export default ChatBot;
