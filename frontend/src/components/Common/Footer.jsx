import React, { useState, useEffect } from "react";
import { IoCall, IoLogoInstagram } from "react-icons/io5";
import { RiTwitterXLine } from "react-icons/ri";
import { TbBrandMeta, TbFilePhone } from "react-icons/tb";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner"; // or use "sonner"
import Logo from "../../assets/logo1.png";
import visa from "../../assets/visa.png";
import mastercard from "../../assets/mastercard.png";
import upi from "../../assets/upi.png";
import cod from "../../assets/cod.png";
import free_shipping from "../../assets/free_shipping.png";
import easy_return from "../../assets/easy return.png";
import { FaChevronUp } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";

const Footer = () => {
  const [subscribe, setSubscribe] = useState("");
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const startYear = 2025;
  const year = new Date().getFullYear();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscribe.trim()) {
      return toast.error("Please enter a valid email address");
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscribe`,
        { email: subscribe },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message || "Subscribed successfully!");
      await subscribeToPush(subscribe); // 🔔 call push registration
      setSubscribe("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Subscription failed. Try again later"
      );
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPush = async (email) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push messaging is not supported");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: BIfPA4HUUcJVRPAqn4NEAcE8Bzg9cYmLTVNqGYCY5SqJvPKjp6JPva2C2aTyXKcKoUrwbwjrj7puKNPHWIgdvls
      });

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/subscribe/push`, {
        email,
        subscription,
      });

      console.log("Push subscription saved!");
    } catch (error) {
      console.error("Push subscription failed:", error);
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
    <div className="relative">
      {/* SVG WAVE TOP */}
      <div className="absolute top-[-1px] left-0 w-full overflow-hidden leading-[0] rotate-180 z-[-1]">
        <svg
          className="relative block w-full h-[60px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#ffffff" // same as your page background
            d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,154.7C672,160,768,192,864,186.7C960,181,1056,139,1152,117.3C1248,96,1344,96,1392,96L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>
      <footer className="bg-white border-t border-gray-200 pt-12">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & Newsletter */}
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img src={Logo} alt="Raphaaa Logo" className="w-28 md:w-40 mb-4" />
            </Link>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Subscribe</h3>
            <p className="text-sm text-gray-600 mb-1">
              Get 10% off your first order
            </p>
            <form className="flex mt-3" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email"
                value={subscribe}
                onChange={(e) => setSubscribe(e.target.value)}
                disabled={loading}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-r-md hover:bg-blue-700 transition"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Shop</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li><Link to="/collections/all?category=Top+Wear&gender=Men" className="hover:text-blue-600">Men's Top Wear</Link></li>
              <li><Link to="/collections/all?category=Top+Wear&gender=Women" className="hover:text-blue-600">Women's Top Wear</Link></li>
              <li><Link to="/collections/all?category=Bottom+Wear&gender=Men" className="hover:text-blue-600">Men's Bottom Wear</Link></li>
              <li><Link to="/collections/all?category=Bottom+Wear&gender=Women" className="hover:text-blue-600">Women's Bottom Wear</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Support</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li><Link to="/collections/all"      className="hover:text-blue-600">All Collections</Link></li>
              <li><Link to="/about"                 className="hover:text-blue-600">About Us</Link></li>
              <li><Link to="/contact-us"            className="hover:text-blue-600">Contact Us</Link></li>
              <li><Link to="/privacy-policy"        className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link to="/terms"                 className="hover:text-blue-600">Terms &amp; Conditions</Link></li>
              <li><Link to="/shipping-policy"       className="hover:text-blue-600">Shipping Policy</Link></li>
              <li><Link to="/return-policy"         className="hover:text-blue-600">Return &amp; Refund Policy</Link></li>
              <li><Link to="/cancellation-policy"   className="hover:text-blue-600">Cancellation Policy</Link></li>
              <li><Link to="/refer"                 className="hover:text-blue-600 font-semibold text-emerald-700">🎁 Refer &amp; Earn</Link></li>
            </ul>
          </div>

          {/* Follow & Contact */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Follow Us</h3>
            <div className="flex items-center space-x-4 mb-4 text-gray-600">
              {contactInfo?.showFacebook && (
                <a href={contactInfo.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-blue-700"><FaFacebook size={20} /></a>
              )}
              {contactInfo?.showInstagram && (
                <a href={contactInfo.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-pink-500"><IoLogoInstagram size={20} /></a>
              )}
            </div>
            <p className="text-sm text-gray-700 mb-1 font-medium">Call Us</p>
            {contactInfo?.showPhone && (
              <p className="text-sm text-gray-800 flex items-center gap-2">
                <IoCall /> {contactInfo.phone}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-6">
          {/* Payments & Trust */}
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <span className="uppercase tracking-wide">We Accept</span>
              <img src={visa} alt="Visa" className="h-5" />
              <img src={mastercard} alt="MasterCard" className="h-5" />
              <img src={upi} alt="UPI" className="h-5" />
            </div>
            <p className="text-gray-400 text-sm text-center md:text-left">Trusted & Secure Payment | 100% Original Products</p>
          </div>

          {/* Perks Section */}
          <div className="container mx-auto mt-6 px-4 flex flex-wrap justify-center md:justify-between gap-6 text-gray-700 text-sm">
            <span className="flex items-center gap-2">
              <img src={cod} alt="COD" className="h-8" /> COD Available
            </span>
            <span className="flex items-center gap-2">
              <img src={free_shipping} alt="Free Shipping" className="h-8" /> Free Shipping
            </span>
            <span className="flex items-center gap-2">
              <img src={easy_return} alt="Easy Returns" className="h-8" /> Easy 15-Day Returns
            </span>
          </div>
        </div>

        {/* Legal entity info — Consumer Protection (E-Commerce) Rules 2020 */}
        <div className="container mx-auto mt-6 px-4 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500 mb-4">
            <div>
              <p className="font-semibold text-gray-700 mb-1">Legal Entity</p>
              <p>{contactInfo?.businessName || "Raphaaa by Citimart"}</p>
              {contactInfo?.registeredAddress && (
                <p>Registered Address: {contactInfo.registeredAddress}</p>
              )}
              {contactInfo?.gstin && (
                <p>GSTIN: <span className="font-mono">{contactInfo.gstin}</span></p>
              )}
              {contactInfo?.cin && (
                <p>CIN: <span className="font-mono">{contactInfo.cin}</span></p>
              )}
            </div>
            {(contactInfo?.grievanceOfficerName || contactInfo?.grievanceOfficerEmail) && (
              <div>
                <p className="font-semibold text-gray-700 mb-1">Consumer Grievance Officer</p>
                {contactInfo.grievanceOfficerName && <p>{contactInfo.grievanceOfficerName}</p>}
                {contactInfo.grievanceOfficerEmail && (
                  <p>
                    Email:{" "}
                    <a href={`mailto:${contactInfo.grievanceOfficerEmail}`} className="hover:text-blue-600">
                      {contactInfo.grievanceOfficerEmail}
                    </a>
                  </p>
                )}
                <p>Response time: Within {contactInfo.grievanceResponseTime || "48 hours"}</p>
                <p className="mt-1 text-[11px] text-gray-400">
                  As required under Consumer Protection (E-Commerce) Rules, 2020
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto text-center text-gray-500 text-sm mt-4 pb-6 px-4">
          &copy; {startYear === year ? startYear : `${startYear}–${year}`} <span className="font-semibold text-gray-800">Raphaaa</span>. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Footer;
