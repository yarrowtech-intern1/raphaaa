import React, { useEffect, useState } from "react";
import {
  FaBoxOpen,
  FaClipboardList,
  FaShoppingBag,
  FaSignOutAlt,
  FaStore,
  FaUser,
  FaCog,
  FaLock,
} from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { clearCart } from "../../redux/slices/cartSlice";
import icon from "../../assets/man.png";
import { HiPlusCircle } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import { MdOutlineAddTask } from "react-icons/md";
import { FaTasks, FaRupeeSign, FaUsers } from "react-icons/fa";
import { BsGraphUpArrow } from "react-icons/bs";
import { LuMessageSquareText } from "react-icons/lu";
import axios from "axios";
import { toast } from "sonner";
import { GiLetterBomb } from "react-icons/gi";
import { BiSolidOffer, BiCategoryAlt } from "react-icons/bi";
import { FaPeopleCarryBox } from "react-icons/fa6";
import { TbHierarchy3 } from "react-icons/tb";
import { MdCampaign } from "react-icons/md";
import { SiMinutemailer } from "react-icons/si";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [profile, setProfile] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Could not fetch profile");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
    toast.success("Logout successful!");
  };

  // Active/hover link styling utility
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
        : "text-gray-300 hover:bg-white/10 hover:text-white"
    }`;

  // Sub-link styling
  const subLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
      isActive
        ? "bg-white/10 text-white"
        : "text-gray-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside className="md:w-auto w-full sm:w-72 bg-gradient-to-b from-gray-900 via-gray-850 to-gray-900 text-gray-100 shadow-2xl flex flex-col">
      {/* Brand */}
      <div className="px-6 py-4 font-extrabold text-xl tracking-wide rounded-b-xl shadow-md">
        <Link to="/" title={undefined}>Raphaaa</Link>
      </div>

      {/* Profile */}
      <div className="px-6 py-5 border-b border-white/10 bg-white/5 backdrop-blur-md">
        {user && (
          <div className="flex items-center gap-4 rounded-xl p-3 border border-white/10 bg-white/5">
            {profile?.photo ? (
              <img
                src={profile.photo}
                alt={user.name || user.email}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = icon; // local fallback
                }}
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <img
                src={icon}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold flex items-center gap-1 truncate">
                <span className="truncate">{user?.name}</span>
                <span
                  className="inline-flex items-center justify-center w-6 h-6 text-blue-500"
                  title="Verified by Raphaaa"
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="m18.774 8.245-.892-.893a1.5 1.5 0 0 1-.437-1.052V5.036a2.484 2.484 0 0 0-2.48-2.48H13.7a1.5 1.5 0 0 1-1.052-.438l-.893-.892a2.484 2.484 0 0 0-3.51 0l-.893.892a1.5 1.5 0 0 1-1.052.437H5.036a2.484 2.484 0 0 0-2.48 2.481V6.3a1.5 1.5 0 0 1-.438 1.052l-.892.893a2.484 2.484 0 0 0 0 3.51l.892.893a1.5 1.5 0 0 1 .437 1.052v1.264a2.484 2.484 0 0 0 2.481 2.481H6.3a1.5 1.5 0 0 1 1.052.437l.893.892a2.484 2.484 0 0 0 3.51 0l.893-.892a1.5 1.5 0 0 1 1.052-.437h1.264a2.484 2.484 0 0 0 2.481-2.48V13.7a1.5 1.5 0 0 1 .437-1.052l.892-.893a2.484 2.484 0 0 0 0-3.51Z" />
                    <path
                      fill="#fff"
                      d="M8 13a1 1 0 0 1-.707-.293l-2-2a1 1 0 1 1 1.414-1.414l1.42 1.42 5.318-3.545a1 1 0 0 1 1.11 1.664l-6 4A1 1 0 0 1 8 13Z"
                    />
                  </svg>
                </span>
              </p>

              <p className="mt-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    user?.role === "admin"
                      ? "bg-red-100/20 text-red-300"
                      : user?.role === "merchantise"
                      ? "bg-purple-100/20 text-purple-300"
                      : user?.role === "delivery_boy"
                      ? "bg-yellow-100/20 text-yellow-300"
                      : "bg-gray-200/20 text-gray-300"
                  }`}
                >
                  {user?.role === "admin"
                    ? "Admin"
                    : user?.role === "merchantise"
                    ? "Merchandise"
                    : user?.role === "delivery_boy"
                    ? "Delivery Boy"
                    : user?.role?.charAt(0).toUpperCase() +
                      user?.role?.slice(1)}
                </span>
              </p>

              <p className={`text-xs mt-1 ${isOnline ? "text-green-400" : "text-red-400"}`}>
                ● {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar">
        {/* Dashboard */}
        {(user?.role === "admin" ||
          user?.role === "merchantise" ||
          user?.role === "marketing") && (
          <NavLink to="/admin" end className={navLinkClass}>
            <RiDashboardHorizontalFill />
            <span>Dashboard</span>
          </NavLink>
        )}

        {/* Task (merchantise) */}
        {user?.role === "merchantise" && (
          <div className="text-gray-300">
            <details className="group">
              <summary className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer">
                <span className="flex items-center gap-2">
                  <FaTasks className="text-lg" />
                  <span>Task</span>
                </span>
                <svg
                  className="w-4 h-4 ml-1 group-open:rotate-90 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </summary>
              <div className="ml-6 mt-2 space-y-1">
                <NavLink to="/admin/add-task" className={subLinkClass}>
                  <MdOutlineAddTask /> <span>Add Task</span>
                </NavLink>
                <NavLink to="/admin/view-tasks" className={subLinkClass}>
                  <FaClipboardList /> <span>View My Tasks</span>
                </NavLink>
              </div>
            </details>
          </div>
        )}

        {/* All Tasks (admin) */}
        {user?.role === "admin" && (
          <NavLink to="/admin/all-tasks" className={navLinkClass}>
            <FaTasks />
            <span>All Tasks</span>
          </NavLink>
        )}
        {(user?.role === "admin" || user?.role === "merchantise") && (
          <div className="text-gray-300">
            <details className="group">
              <summary className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer">
                <span className="flex items-center gap-2">
                  <BsGraphUpArrow className="text-lg" />
                  <span>Analysis</span>
                </span>
                <svg
                  className="w-4 h-4 ml-1 group-open:rotate-90 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </summary>
              <div className="ml-6 mt-2 space-y-1">
                <NavLink to="/admin/inventory" className={subLinkClass}>
                  <FaBoxOpen /> <span>Inventory</span>
                </NavLink>
                <NavLink to="/admin/trend-analysis" className={subLinkClass}>
                  <BsGraphUpArrow /> <span>Sales Analysis</span>
                </NavLink>
                <NavLink to="/admin/revenue" className={subLinkClass}>
                  <FaRupeeSign /> <span>Total Revenue</span>
                </NavLink>
              </div>
            </details>
          </div>
        )}

        {/* Inventory */}
        {/* {(user?.role === "admin" || user?.role === "merchantise") && (
          <NavLink to="/admin/inventory" className={navLinkClass}>
            <FaBoxOpen />
            <span>Inventory</span>
          </NavLink>
        )} */}

        {/* Sales Analysis */}
        {/* {(user?.role === "admin" || user?.role === "merchantise") && (
          <NavLink to="/admin/trend-analysis" className={navLinkClass}>
            <BsGraphUpArrow />
            <span>Sales Analysis</span>
          </NavLink>
        )} */}

        {/* Total Revenue */}
        {/* {(user?.role === "admin" || user?.role === "merchantise") && (
          <NavLink to="/admin/revenue" className={navLinkClass}>
            <FaRupeeSign />
            <span>Total Revenue</span>
          </NavLink>
        )} */}

        {(user?.role === "admin" || user?.role === "merchantise") && (
          <div className="text-gray-300">
            <details className="group">
              <summary className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer">
                <span className="flex items-center gap-2">
                  <FaUsers className="text-lg" />
                  <span>Users</span>
                </span>
                <svg
                  className="w-4 h-4 ml-1 group-open:rotate-90 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </summary>
              <div className="ml-6 mt-2 space-y-1">
                <NavLink to="/admin/users" className={subLinkClass}>
                  <FaUsers /> <span>Manage Users</span>
                </NavLink>
                <NavLink to="/admin/reset-password" className={subLinkClass}>
                  <FaLock /> <span>Reset Password</span>
                </NavLink>
              </div>
            </details>
          </div>
        )}

        {/* Users */}
        {/* {(user?.role === "admin" || user?.role === "merchantise") && (
          <NavLink to="/admin/users" className={navLinkClass}>
            <FaUsers />
            <span>Users</span>
          </NavLink>
        )} */}

        {/* Categories */}
        {(user?.role === "admin" || user?.role === "merchantise") && (
          <NavLink to="/admin/custom-categories" className={navLinkClass}>
            <BiCategoryAlt />
            <span>Categories</span>
          </NavLink>
        )}

        {/* Products */}
        {(user?.role === "admin" || user?.role === "merchantise") && (
          <div className="text-gray-300">
            <details className="group">
              <summary className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer">
                <span className="flex items-center gap-2">
                  <FaBoxOpen className="text-lg" />
                  <span>Products</span>
                </span>
                <svg
                  className="w-4 h-4 ml-1 group-open:rotate-90 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </summary>
              <div className="ml-6 mt-2 space-y-1">
                <NavLink to="/admin/add-product" className={subLinkClass}>
                  <HiPlusCircle /> <span>Add Product</span>
                </NavLink>
                <NavLink to="/admin/products" className={subLinkClass}>
                  <FaShoppingBag /> <span>All Products</span>
                </NavLink>
              </div>
            </details>
          </div>
        )}

        {/* Campaigns (admin/marketing) */}
        {/* {(a */}

        {/* Collab (admin/merchantise/marketing) */}
        {(user?.role === "admin" ||
          user?.role === "merchantise" ||
          user?.role === "marketing") && (
          <div className="text-gray-300">
            <details className="group">
              <summary className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer">
                <span className="flex items-center gap-2">
                  <FaPeopleCarryBox className="text-lg" />
                  <span>Collab</span>
                </span>
                <svg
                  className="w-4 h-4 ml-1 group-open:rotate-90 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </summary>
              <div className="ml-6 mt-2 space-y-1">
                {(user?.role === "admin" || user?.role === "marketing") && (
                  <NavLink to="/admin/collab-settings" className={subLinkClass}>
                    <HiPlusCircle /> <span>Add Collab</span>
                  </NavLink>
                )}
                {(user?.role === "admin" ||
                  user?.role === "merchantise" ||
                  user?.role === "marketing") && (
                  <NavLink to="/admin/collabs" className={subLinkClass}>
                    <FaPeopleCarryBox /> <span>View Collabs</span>
                  </NavLink>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Offers */}
        {(user?.role === "admin" || user?.role === "merchantise") && (
          <div className="text-gray-300">
            <details className="group">
              <summary className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg白/10 hover:bg-white/10 cursor-pointer">
                <span className="flex items-center gap-2">
                  <BiSolidOffer className="text-lg" />
                  <span>Offers</span>
                </span>
                <svg
                  className="w-4 h-4 ml-1 group-open:rotate-90 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </summary>
              <div className="ml-6 mt-2 space-y-1">
                <NavLink to="/admin/create-offers" className={subLinkClass}>
                  <HiPlusCircle /> <span>Create Offer</span>
                </NavLink>
                <NavLink to="/admin/offers" className={subLinkClass}>
                  <BiSolidOffer /> <span>View Offers</span>
                </NavLink>
              </div>
            </details>
          </div>
        )}

        {/* Orders */}
        {(user?.role === "admin" ||
          user?.role === "merchantise" ||
          user?.role === "delivery_boy") && (
          <NavLink to="/admin/orders" className={navLinkClass}>
            <FaClipboardList />
            <span>Orders</span>
          </NavLink>
        )}

        {/* Contact */}
        {(user?.role === "admin" || user?.role === "merchantise" || user?.role === "marketing") && (
          <NavLink to="/admin/contact-messages" className={navLinkClass}>
            <LuMessageSquareText />
            <span>Contact</span>
          </NavLink>
        )}

        {/* Subscribers */}
        {(user?.role === "admin" || user?.role === "merchantise" || user?.role === "marketing") && (
          <NavLink to="/admin/subscribed-users" className={navLinkClass}>
            <GiLetterBomb />
            <span>Subscribers</span>
          </NavLink>
        )}
        {(user?.role === "admin" || user?.role === "marketing") && (
          <NavLink to="/admin/email-scheduler" className={navLinkClass}>
            <SiMinutemailer />
            <span>Email Scheduler</span>
          </NavLink>
        )}

        {/* Profile */}
        <NavLink to="update-profile" className={navLinkClass}>
          <CgProfile />
          <span>Profile</span>
        </NavLink>

        {/* Raphaaa Hierarchy */}
        {(user?.role === "admin" ||
          user?.role === "merchantise" ||
          user?.role === "marketing") && (
          <NavLink to="hierarchy" className={navLinkClass}>
            <TbHierarchy3 />
            <span>Raphaaa Hierarchy</span>
          </NavLink>
        )}

        {/* Website Settings */}
        {(user?.role === "admin" || user?.role === "merchantise") && (
          <div className="text-gray-300">
            <details className="group">
              <summary className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer">
                <span className="flex items-center gap-2">
                  <FaCog className="text-lg" />
                  <span>Website Settings</span>
                </span>
                <svg
                  className="w-4 h-4 ml-1 group-open:rotate-90 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </summary>
              <div className="ml-6 mt-2 space-y-1">
                <NavLink
                  to="/admin/website-settings/about"
                  className={subLinkClass}
                >
                  <FaUser /> <span>About Section</span>
                </NavLink>
                <NavLink
                  to="/admin/website-settings/privacy&policy"
                  className={subLinkClass}
                >
                  <FaClipboardList /> <span>Privacy &amp; Policy</span>
                </NavLink>
                <NavLink
                  to="/admin/website-settings/contact"
                  className={subLinkClass}
                >
                  <FaStore /> <span>Contact Details</span>
                </NavLink>
              </div>
            </details>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90 transition-all text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
