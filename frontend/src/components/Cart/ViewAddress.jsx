import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaLocationCrosshairs } from "react-icons/fa6";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaTrash, FaMapMarkerAlt } from "react-icons/fa";



const ViewAddress = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const authHeaders = () => {
    const token = localStorage.getItem("userToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [countryList, setCountryList] = useState([]);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (!Array.isArray(data)) throw new Error("Invalid data structure");

        const countries = data
          .map((country) => country?.name?.common)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        setCountryList(countries);
      } catch (error) {
        console.error("Failed to load countries:", error.message);
        toast.error("Could not load country list.");
        setCountryList(["India", "United States", "Canada", "Australia"]); // fallback
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const sync = (e) => {
      const incoming = e.detail;
      // handle either an array or {addresses: [...]}
      const next = Array.isArray(incoming) ? incoming : incoming?.addresses;
      if (Array.isArray(next)) setAddresses(next);
    };
    window.addEventListener("address:list-updated", sync);
    return () => window.removeEventListener("address:list-updated", sync);
  }, []);

  //   useEffect(() => {
  //     const fetchCoupon = async () => {
  //       try {
  //         const token = user?.token || localStorage.getItem("userToken");
  //         const { data } = await axios.get(
  //           `${import.meta.env.VITE_BACKEND_URL}/api/users/my-coupon`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //             },
  //           }
  //         );
  //         setCoupon(data);
  //         setCouponError("");
  //       } catch (err) {
  //         setCoupon(null);
  //         setCouponError(
  //           err.response?.data?.message || "Could not fetch coupon details"
  //         );
  //       }
  //     };

  //     if (activeTab === "coupon" && user?.role === "customer") {
  //       fetchCoupon();
  //     }
  //   }, [activeTab, user]);

  useEffect(() => {
    if (!user) {
      const redirect = encodeURIComponent(location.pathname || "/checkout");
      navigate(`/login?redirect=${redirect}`);
    }
  }, [user, navigate, location.pathname]);

  //   useEffect(() => {
  //     const fetchWishlist = async () => {
  //       try {
  //         const token = localStorage.getItem("userToken");
  //         const { data } = await axios.get(
  //           `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //             },
  //           }
  //         );
  //         setWishlistItems(data);
  //       } catch (err) {
  //         console.error("Failed to fetch wishlist:", err);
  //       }
  //     };

  //     if (activeTab === "wishlist") fetchWishlist();
  //   }, [activeTab]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("userToken");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
  };

  const handleIconClick = () => alert("Open profile settings or image upload!");

  //   useEffect(() => {
  //     const handleOnline = () => {
  //       if (!isOnline) {
  //         setIsOnline(true);
  //         toast.success("You're back online");
  //       }
  //     };
  //     const handleOffline = () => {
  //       if (isOnline) {
  //         setIsOnline(false);
  //         toast.error("You're offline");
  //       }
  //     };
  //     window.addEventListener("online", handleOnline);
  //     window.addEventListener("offline", handleOffline);
  //     return () => {
  //       window.removeEventListener("online", handleOnline);
  //       window.removeEventListener("offline", handleOffline);
  //     };
  //   }, [isOnline]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/addresses`,
          { headers: authHeaders() }
        );
        setAddresses(data);
      } catch (err) {
        console.error("Failed to load addresses", err);
      }
    };
    if (user && localStorage.getItem("userToken")) fetchAddresses();
  }, [user]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/addresses`,
        newAddress,
        { headers: authHeaders() }
      );
      //   if(addresses === ""){
      //     toast.warning("Number is required");
      //   }
      setAddresses(data.addresses);
      toast.success("Address saved!");
      setNewAddress({
        address: "",
        city: "",
        postalCode: "",
        country: "",
        phone: "",
      });
    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  const handleDeleteAddress = async (index) => {
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/addresses/${index}`,
        { headers: authHeaders() }
      );
      setAddresses(data.addresses);
      toast.success("Address deleted");
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by your browser.");
    }

    setLocating(true); // ⬅️ start spinner

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          const { address } = data;

          if (!address) {
            toast.error("Unable to extract address.");
            return;
          }

          setNewAddress((prev) => ({
            ...prev,
            address:
              address.road ||
              address.neighbourhood ||
              address.suburb ||
              address.display_name ||
              "",
            city: address.city || address.town || address.village || "",
            postalCode: address.postcode || "",
            country: address.country || "",
          }));

          toast.success("Address auto-filled from current location!");
        } catch (err) {
          console.error("Geolocation fetch error:", err);
          toast.error("Failed to fetch address from coordinates.");
        } finally {
          setLocating(false); // ⬅️ stop spinner
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        switch (err.code) {
          case 1:
            toast.error("Permission denied. Please allow location access.");
            break;
          case 2:
            toast.error("Location unavailable.");
            break;
          case 3:
            toast.error("Request timed out.");
            break;
          default:
            toast.error("Unknown geolocation error.");
        }
        setLocating(false); // ⬅️ stop spinner on error too
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div>
      {/* <h3 className="text-xl font-semibold mb-4">
                Add New Address
            </h3> */}
      {/* <form
                onSubmit={handleAddressSubmit}
                className="space-y-6 "
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="address"
                        value={newAddress.address}
                        onChange={(e) =>
                            setNewAddress({
                                ...newAddress,
                                address: e.target.value,
                            })
                        }
                        placeholder="Street Address"
                        className="bg-white w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <input
                        type="text"
                        name="city"
                        value={newAddress.city}
                        onChange={(e) =>
                            setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        placeholder="City"
                        className="bg-white w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="number"
                        name="postalCode"
                        value={newAddress.postalCode}
                        onChange={(e) =>
                            setNewAddress({
                                ...newAddress,
                                postalCode: e.target.value,
                            })
                        }
                        placeholder="Postal Code"
                        className="bg-white w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <select
                        name="country"
                        value={newAddress.country}
                        onChange={(e) =>
                            setNewAddress({
                                ...newAddress,
                                country: e.target.value,
                            })
                        }
                        className="bg-white w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    >
                        <option value="" disabled>Select Country</option>
                        {countryList.map((country) => (
                            <option key={country} value={country}>
                                {country}
                            </option>
                        ))}
                    </select>

                </div>
                <div className="flex justify-between items-center">
                    <input
                        type="number"
                        name="phone"
                        value={newAddress.phone}
                        onChange={(e) =>
                            setNewAddress({ ...newAddress, phone: e.target.value })
                        }
                        placeholder="Phone"
                        className="bg-white w-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none [-moz-appearance:textfield] [appearance:textfield]"
                    />
                    <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={locating}
                        className="ml-2 whitespace-nowrap text-sm bg-sky-500 hover:bg-sky-600 disabled:bg-sky-400 disabled:cursor-not-allowed text-white font-medium px-4 py-3 transition flex justify-around items-center gap-2"
                    >
                        {/* Spinner while locating */}
      {/* {locating ? (
                            <>
                                <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                <span>Loading...</span>
                            </>
                        ) : (
                            <>
                                <FaLocationCrosshairs className="inline" size={25} />
                                Use my current Location
                            </>
                        )}
                    </button>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 text-white font-semibold bg-blue-600 hover:bg-blue-700 transition"
                >
                    Save Address
                </button>
            </form>  */}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-sky-700">
          Saved Addresses
        </h3>

        {(!addresses || addresses.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-white via-sky-50 to-blue-100 rounded-2xl border border-blue-100 shadow-sm">
            <FaMapMarkerAlt className="text-sky-500 text-4xl mb-3 animate-bounce" />
            <p className="text-gray-600 text-lg font-medium">
              No address found
            </p>
            <p className="text-sm text-gray-400">
              Add a new address to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr, idx) => (
              <div
                key={idx}
                className="relative bg-gradient-to-br from-white via-blue-50 to-sky-100 border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteAddress(idx)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-600 hover:scale-110 transition-transform"
                  title="Delete address"
                >
                  <FaTrash size={16} />
                </button>

                {/* Address Details */}
                <div className="space-y-2 text-sm text-gray-800">
                  <p>
                    <span className="font-semibold text-gray-900">Address:</span>{" "}
                    {addr.address}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">City:</span>{" "}
                    {addr.city}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Postal Code:</span>{" "}
                    {addr.postalCode}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Country:</span>{" "}
                    {addr.country}
                  </p>
                  {addr.phone && (
                    <p>
                      <span className="font-semibold text-gray-900">Phone:</span>{" "}
                      +91 {addr.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default ViewAddress
