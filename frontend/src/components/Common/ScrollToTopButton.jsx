import React, { useEffect, useState } from "react";
import { FaChevronUp, FaRobot } from "react-icons/fa";
import ChatBot from "./ChatBot"; // ✅ Import the new chatbot component

const ScrollToTopButton = () => {
  const [showButton, setShowButton] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {showButton && (
        <>
          {/* Scroll to Top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
            title="Back to Top"
          >
            <FaChevronUp className="h-4 w-4" />
          </button>

          {/* Chatbot Toggle */}
          {/* <button
            onClick={() => setChatOpen(!chatOpen)}
            className="fixed bottom-20 right-6 bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 transition-all z-50"
            title="Raphaaa Assistant"
          >
            <FaRobot className="h-4 w-4" />
          </button> */}
        </>
      )}

      {chatOpen && <ChatBot onClose={() => setChatOpen(false)} />}
    </>
  );
};

export default ScrollToTopButton;
