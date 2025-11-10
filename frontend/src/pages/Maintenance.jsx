import React from "react";
import logo from "../assets/logo1.png"

const Maintenance = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-sky-200 to-blue-300 text-gray-800 px-4">
      <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl p-8 text-center max-w-lg w-full border border-white/40">
        <img
          src={logo}
          alt="Raphaaa Logo"
          className="mx-auto mb-6 w-28 drop-shadow-md"
        />
        <h1 className="text-4xl font-bold text-sky-700 mb-3">
          We’ll Be Back Soon 🚧
        </h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Our site is currently undergoing scheduled maintenance to improve
          your shopping experience.  
          Please check back in a little while — we’ll be live again shortly!
        </p>
        <div className="flex items-center justify-center space-x-2 text-sky-700 font-medium">
          <span className="animate-pulse">•</span>
          <span>Thank you for your patience!</span>
        </div>
      </div>

      <footer className="mt-10 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Raphaaa — All Rights Reserved
      </footer>
    </div>
  );
};

export default Maintenance;
