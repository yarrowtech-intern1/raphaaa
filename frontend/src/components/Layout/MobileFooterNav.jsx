import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaStore, FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { useSelector } from "react-redux";

const tabs = [
  { to: "/", label: "Home", icon: FaHome },
  { to: "/collections/all", label: "Shop", icon: FaStore },
  { to: "/profile", label: "Account", icon: FaUserCircle },
  { to: "/cart", label: "Cart", icon: FaShoppingCart },
];

const MobileFooterNav = () => {
  const { cart } = useSelector((state) => state.cart);
  const cartItemCount =
    cart?.products?.reduce((total, product) => total + Number(product.quantity || 0), 0) || 0;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <ul className="grid grid-cols-4">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                  isActive ? "text-sky-600" : "text-gray-500"
                }`
              }
            >
              <span className="relative">
                <Icon className="text-base" />
                {label === "Cart" && cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-600 text-white text-[10px] font-bold leading-[18px] text-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileFooterNav;
