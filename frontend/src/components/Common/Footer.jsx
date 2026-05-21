import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Logo from "../../assets/logo1.png";
import visa from "../../assets/visa.png";
import mastercard from "../../assets/mastercard.png";
import upi from "../../assets/upi.png";
import {
  FaFacebook, FaInstagram, FaTwitter,
  FaTruck, FaUndo, FaLock, FaHeadset,
  FaWhatsapp, FaPhone, FaEnvelope,
} from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";

const Footer = () => {
  const [subscribe,   setSubscribe]   = useState("");
  const [loading,     setLoading]     = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const startYear = 2025;
  const year = new Date().getFullYear();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/settings/contact`)
      .then(({ data }) => setContactInfo(data))
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscribe.trim()) return toast.error("Please enter a valid email");
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscribe`,
        { email: subscribe },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success(data.message || "Subscribed successfully!");
      setSubscribe("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-950 text-gray-300">

      {/* ── Trust Strip ── */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <FaTruck className="text-sky-400 text-xl" />,     title: "Free Shipping",      sub: "On orders above ₹999" },
              { icon: <FaUndo className="text-emerald-400 text-xl" />,  title: "Easy 15-Day Returns",sub: "Hassle-free returns" },
              { icon: <FaLock className="text-violet-400 text-xl" />,   title: "Secure Payments",    sub: "100% safe & encrypted" },
              { icon: <FaHeadset className="text-amber-400 text-xl" />, title: "24/7 Support",       sub: "We're always here" },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 — Brand + Newsletter */}
          <div className="lg:col-span-1">
            <Link to="/">
              <img src={Logo} alt="Raphaaa" className="h-10 w-auto mb-4 brightness-0 invert" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Discover premium fashion crafted for every occasion. Style that speaks for itself.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mb-6">
              {contactInfo?.showFacebook && contactInfo.facebookUrl && (
                <a href={contactInfo.facebookUrl} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <FaFacebook className="text-sm" />
                </a>
              )}
              {contactInfo?.showInstagram && contactInfo.instagramUrl && (
                <a href={contactInfo.instagramUrl} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-linear-to-br hover:from-purple-500 hover:to-pink-500 flex items-center justify-center transition-colors">
                  <FaInstagram className="text-sm" />
                </a>
              )}
              {contactInfo?.showTwitter && contactInfo.twitterUrl && (
                <a href={contactInfo.twitterUrl} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-sky-500 flex items-center justify-center transition-colors">
                  <FaTwitter className="text-sm" />
                </a>
              )}
              {contactInfo?.whatsappNumber && (
                <a href={`https://wa.me/${contactInfo.whatsappNumber}`} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-emerald-500 flex items-center justify-center transition-colors">
                  <FaWhatsapp className="text-sm" />
                </a>
              )}
            </div>

            {/* Newsletter */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Newsletter</p>
            <p className="text-xs text-gray-500 mb-3">Get 10% off your first order</p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                value={subscribe}
                onChange={(e) => setSubscribe(e.target.value)}
                disabled={loading}
                className="flex-1 px-3 py-2.5 text-sm bg-gray-800 border border-gray-700 rounded-l-xl focus:outline-none focus:border-sky-500 text-white placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-r-xl transition-colors"
              >
                {loading ? "…" : <HiArrowRight />}
              </button>
            </form>
          </div>

          {/* Col 2 — Shop */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Shop</h4>
            <ul className="space-y-3">
              {[
                { to: "/collections/all?category=Top+Wear&gender=Men",    label: "Men's Top Wear" },
                { to: "/collections/all?category=Bottom+Wear&gender=Men", label: "Men's Bottom Wear" },
                { to: "/collections/all?category=Top+Wear&gender=Women",  label: "Women's Top Wear" },
                { to: "/collections/all?category=Bottom+Wear&gender=Women",label:"Women's Bottom Wear" },
                { to: "/collections/all",                                  label: "All Collections" },
                { to: "/collections/all?sort=newest",                      label: "New Arrivals" },
                { to: "/collections/all?sort=bestseller",                  label: "Best Sellers" },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200">
                      <HiArrowRight className="text-sky-400 text-xs shrink-0" />
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Help */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Help & Policies</h4>
            <ul className="space-y-3">
              {[
                { to: "/about",               label: "About Us" },
                { to: "/contact-us",          label: "Contact Us" },
                { to: "/privacy-policy",      label: "Privacy Policy" },
                { to: "/terms",               label: "Terms & Conditions" },
                { to: "/shipping-policy",     label: "Shipping Policy" },
                { to: "/return-policy",       label: "Return & Refund Policy" },
                { to: "/cancellation-policy", label: "Cancellation Policy" },
                // { to: "/refer",               label: "🎁 Refer & Earn" },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200">
                      <HiArrowRight className="text-sky-400 text-xs shrink-0" />
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Contact Us</h4>
            <ul className="space-y-4">
              {contactInfo?.showPhone && contactInfo.phone && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                    <FaPhone className="text-sky-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">Phone</p>
                    <a href={`tel:${contactInfo.phone}`} className="text-sm text-gray-300 hover:text-white transition-colors">
                      {contactInfo.phone}
                    </a>
                  </div>
                </li>
              )}
              {contactInfo?.showGmail && contactInfo.gmail && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                    <FaEnvelope className="text-sky-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">Email</p>
                    <a href={`mailto:${contactInfo.gmail}`} className="text-sm text-gray-300 hover:text-white transition-colors break-all">
                      {contactInfo.gmail}
                    </a>
                  </div>
                </li>
              )}
              {contactInfo?.grievanceOfficerEmail && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                    <FaHeadset className="text-amber-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">Grievance Officer</p>
                    <p className="text-sm text-gray-300">{contactInfo.grievanceOfficerName}</p>
                    <a href={`mailto:${contactInfo.grievanceOfficerEmail}`} className="text-xs text-gray-400 hover:text-white transition-colors break-all">
                      {contactInfo.grievanceOfficerEmail}
                    </a>
                  </div>
                </li>
              )}
            </ul>

            {/* App download placeholder */}
            {/* <div className="mt-6">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-3">Download App</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Google Play", icon: "▶" },
                  { label: "App Store",   icon: "🍎" },
                ].map(({ label, icon }) => (
                  <div key={label}
                    className="flex items-center gap-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-3 py-2 cursor-pointer transition-colors">
                    <span className="text-base">{icon}</span>
                    <div>
                      <p className="text-[10px] text-gray-500 leading-none">Available on</p>
                      <p className="text-xs font-bold text-white">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

        </div>
      </div>

      {/* ── Payment & Legal Bottom Bar ── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

          {/* Payment methods */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span className="text-[11px] text-gray-500 uppercase tracking-widest">We Accept</span>
              <div className="flex items-center gap-2">
                {[
                  { src: visa,       alt: "Visa",       bg: "bg-white" },
                  { src: mastercard, alt: "Mastercard", bg: "bg-white" },
                  { src: upi,        alt: "UPI",        bg: "bg-white" },
                ].map(({ src, alt, bg }) => (
                  <div key={alt} className={`${bg} rounded-md px-2 py-1 flex items-center justify-center`}>
                    <img src={src} alt={alt} className="h-4 object-contain" />
                  </div>
                ))}
                <div className="bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1">
                  <span className="text-[10px] font-bold text-gray-300">COD</span>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1">
                  <span className="text-[10px] font-bold text-gray-300">EMI</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">🔒 256-bit SSL Encrypted · 100% Authentic Products</p>
          </div>

          {/* Legal entity info */}
          {(contactInfo?.gstin || contactInfo?.registeredAddress || contactInfo?.businessName) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800/60 text-[11px] text-gray-600">
              <div className="space-y-0.5">
                <p className="text-gray-500 font-semibold">{contactInfo?.businessName || "Raphaaa by Citimart"}</p>
                {contactInfo?.registeredAddress && <p>{contactInfo.registeredAddress}</p>}
                {contactInfo?.gstin && (
                  <p>GSTIN: <span className="font-mono text-gray-500">{contactInfo.gstin}</span></p>
                )}
                {contactInfo?.cin && (
                  <p>CIN: <span className="font-mono text-gray-500">{contactInfo.cin}</span></p>
                )}
              </div>
              {(contactInfo?.grievanceOfficerName || contactInfo?.grievanceOfficerEmail) && (
                <div className="space-y-0.5">
                  <p className="text-gray-500 font-semibold">Consumer Grievance Officer</p>
                  {contactInfo.grievanceOfficerName && <p>{contactInfo.grievanceOfficerName}</p>}
                  {contactInfo.grievanceOfficerEmail && (
                    <p>
                      <a href={`mailto:${contactInfo.grievanceOfficerEmail}`} className="hover:text-gray-400 transition-colors">
                        {contactInfo.grievanceOfficerEmail}
                      </a>
                    </p>
                  )}
                  <p>Response: within {contactInfo.grievanceResponseTime || "48 hours"}</p>
                  <p className="text-gray-700 mt-1">As per Consumer Protection (E-Commerce) Rules, 2020</p>
                </div>
              )}
            </div>
          )}

          {/* Copyright + links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-800/60">
            <p className="text-xs text-gray-600">
              &copy; {startYear === year ? startYear : `${startYear}–${year}`}{" "}
              <span className="text-gray-400 font-semibold">Raphaaa</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <Link to="/privacy-policy"  className="hover:text-gray-400 transition-colors">Privacy</Link>
              <span>·</span>
              <Link to="/terms"           className="hover:text-gray-400 transition-colors">Terms</Link>
              <span>·</span>
              <Link to="/return-policy"   className="hover:text-gray-400 transition-colors">Returns</Link>
              <span>·</span>
              <Link to="/sitemap.xml"     className="hover:text-gray-400 transition-colors">Sitemap</Link>
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;
