import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const UserHierarchy = () => {
  const [hierarchy, setHierarchy] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/hierarchy`);
        setHierarchy(data);
      } catch (error) {
        console.error("Failed to load hierarchy", error);
      }
    };

    fetchHierarchy();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!hierarchy) return <p className="text-center mt-10">Loading hierarchy...</p>;

  return (
    <div className="relative">
      {/* Print Button */}
      <div className="flex justify-end max-w-5xl mx-auto mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-semibold px-5 py-2 rounded-full shadow hover:scale-105 transition"
        >
          Print Hierarchy Report
        </button>
      </div>

      {/* Printable Section */}
      <div ref={printRef} className="flex flex-col items-center mt-4 p-6 bg-white shadow-xl rounded-xl max-w-5xl mx-auto print:shadow-none print:p-0 print:mt-0">
        <h2 className="text-3xl font-bold text-indigo-700 mb-10">Team Raphaaa</h2>

        {/* Admin */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-indigo-600">Admin</h3>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {hierarchy.admin.map((u) => (
              <div key={u._id} className="px-4 py-2 bg-indigo-100 rounded shadow text-sm text-indigo-800 flex flex-col items-center w-[150px]">
                {u.photo ? (
                  <img src={u.photo} alt={u.name} className="w-12 h-12 rounded-full object-cover mb-2 border-2 border-indigo-300" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-300 flex items-center justify-center text-white font-bold mb-2">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {u.name}
                <br />
                <span className="text-xs text-gray-600 text-center break-words p-1">{u.email}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="my-6 text-3xl animate-bounce text-gray-400 print:hidden">↓</div>

        {/* Merchantisers */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-purple-600">Merchandise Team</h3>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {hierarchy.merchantise.map((u) => (
              <div key={u._id} className="px-4 py-2 bg-purple-100 rounded shadow text-sm text-purple-800 flex flex-col items-center w-[150px]">
                {u.photo ? (
                  <img src={u.photo} alt={u.name} className="w-12 h-12 rounded-full object-cover mb-2 border-2 border-purple-300" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-300 flex items-center justify-center text-white font-bold mb-2">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {u.name}
                <br />
                <span className="text-xs text-gray-600 text-center break-words p-1">{u.email}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="my-6 text-3xl animate-bounce text-gray-400 print:hidden">↓</div>

        {/* Marketing */}
        <div className="text-center">
          <h3 className="text-base font-bold text-pink-600">Marketing Team</h3>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {hierarchy.marketing.map((u) => (
              <div key={u._id} className="px-4 py-2 bg-pink-100 rounded shadow text-sm text-pink-800 flex flex-col items-center w-[150px]">
                {u.photo ? (
                  <img src={u.photo} alt={u.name} className="w-12 h-12 rounded-full object-cover mb-2 border-2 border-pink-300" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-pink-300 flex items-center justify-center text-white font-bold mb-2">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {u.name}
                <br />
                <span className="text-xs text-gray-600 text-center break-words p-1">{u.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHierarchy;
