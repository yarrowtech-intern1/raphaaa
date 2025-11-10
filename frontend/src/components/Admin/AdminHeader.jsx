import React, { useEffect, useState, useRef } from "react";
import { FaBell, FaUserCircle, FaSignOutAlt, FaCog } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { clearCart } from "../../redux/slices/cartSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FiChevronDown } from "react-icons/fi"; // ⬅️ for dropdown arrow
import icon from "../../assets/man.png";
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { toast } from "sonner";

const AdminHeader = () => {
    const { user } = useSelector((state) => state.auth);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [profile, setProfile] = useState(null);


    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCart());
        navigate("/login");
        toast.success("Logout successful!");
    };

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/contact`);
                setContacts(res.data);
                setUnreadCount(res.data.length); // unread = all messages initially
            } catch (error) {
                console.error("Failed to fetch contacts", error);
            }
        };
        fetchContacts();
    }, []);

    // Close dropdown when navigating to other pages
    useEffect(() => {
        setShowNotifications(false);
        setShowProfile(false);
    }, [location]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowNotifications(false);
                setShowProfile(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
        setShowProfile(false);

        // mark as read (hide badge)
        if (!showNotifications) {
            setUnreadCount(0);
        }
    };

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
            setProfile(data); // Save full user object from DB
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            toast.error("Could not fetch profile");
        }
    };
    useEffect(() => {
        fetchUserProfile();
    }, []);

    return (
        <header className="flex justify-between items-center bg-gray-800 px-6 py-3 shadow-md">
            <h1 className="text-xl font-bold text-white">Raphaaa {user.role === "admin" ? "Admin" : user.role === "merchantise" ? "Merchandise" : user.role === "marketing" ? "Marketing" : user.role === "delivery_boy" ? "Delivery Boy" : "Customer"} </h1>

            <div className="flex items-center gap-6 relative" ref={dropdownRef}>
                {/* Notifications */}
                <div className="relative">
                    {/* <button
            onClick={handleBellClick}
            className="relative text-white hover:text-yellow-400"
          >
            <FaBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button> */}

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg p-4 z-50">
                            <h3 className="font-semibold mb-3 text-gray-800">Recent Messages</h3>

                            {contacts.length === 0 ? (
                                <p className="text-sm text-gray-500">No new messages</p>
                            ) : (
                                <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                                    {contacts.slice(0, 5).map((msg) => (
                                        <li key={msg._id} className="py-2 flex items-start gap-3">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                                <FaUserCircle size={24} />
                                            </div>

                                            {/* Message Details */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">
                                                    {msg.name}
                                                </p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{msg.message}</p>
                                                <p className="text-[11px] text-gray-400">
                                                    {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Footer link */}
                            <div className="mt-3 text-center">
                                <Link
                                    to="/admin/contact-messages"
                                    className="text-blue-600 text-sm font-medium hover:underline"
                                >
                                    See all messages
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowProfile(!showProfile);
                            setShowNotifications(false);
                        }}
                        className="flex items-center gap-2 mr-4 text-white focus:outline-none"
                    >
                        {profile?.photo ? (
                            <img
                                src={profile.photo}
                                alt="profile"
                                className="w-9 h-9 rounded-full object-cover shadow-md"
                            />
                        ) : (
                            // <FaUserCircle size={30} className="text-yellow-400" />
                            <img
                                src={icon}
                                alt="profile"
                                className="w-9 h-9 rounded-full object-cover shadow-md"
                            />
                        )}
                        <span className="hidden sm:inline font-medium">{user?.name || "Admin"}</span>
                        <FiChevronDown
                            className={`transition-transform ${showProfile ? "rotate-180" : "rotate-0"}`}
                        />
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50">
                                {profile?.photo ? (
                                    <img
                                        src={profile.photo}
                                        alt="profile"
                                        className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                                    />
                                ) : (
                                    // <FaUserCircle size={40} className="text-gray-400" />
                                    <img
                                        src={icon}
                                        alt="profile"
                                        className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                                    />
                                )}
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                        {user?.name || "Admin"}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>

                            {/* Links */}
                            <div className="py-2">
                                <Link
                                    to="/admin/"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                >
                                    {/* <FaUserCircle className="text-gray-500" /> */}
                                    <RiDashboardHorizontalFill className="text-gray-500" />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/admin/update-profile"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                >
                                    <FaUserCircle className="text-gray-500" />
                                    Profile
                                </Link>
                                {/* <Link
          to="/admin/settings"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
        >
          <FaCog className="text-gray-500" />
          Settings
        </Link> */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                >
                                    <FaSignOutAlt className="text-red-500" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
};

export default AdminHeader;
