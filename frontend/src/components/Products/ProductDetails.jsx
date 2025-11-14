// import React, { useEffect, useState, useMemo, useRef } from "react";
// import { toast } from "sonner";
// import ProductGrid from "./ProductGrid";
// import { HiOutlineShoppingBag } from "react-icons/hi";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchProductDetails,
//   fetchSimilarProducts,
// } from "../../redux/slices/productsSlice";
// import { addToCart } from "../../redux/slices/cartSlice";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import { BsPatchCheckFill, BsSearch } from "react-icons/bs";
// import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
// import axios from "axios";
// import { FiShoppingCart, FiZap } from "react-icons/fi";
// import { GoDotFill } from "react-icons/go";
// import { FaCartShopping } from "react-icons/fa6";
// import { flyToCart } from "../../utils/flyToCart";
// import { FiShare2 } from "react-icons/fi";
// import { FiCopy } from "react-icons/fi";

// const ProductDetails = ({ productId }) => {
//   const imgRef = useRef(null); // 👈 ref to product image
//   const cartIconRef = window.cartIconRef;
//   // const { id } = useParams();
//   const { slug, sku } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { selectedProduct, loading, error, similarProducts } = useSelector(
//     (state) => state.products
//   );
//   const { user, guestId } = useSelector((state) => state.auth);
//   const [mainImage, setMainImage] = useState("");
//   const [selectedSize, setSelectedSize] = useState("");
//   const [selectedColor, setSelectedColor] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   // const [isButtonDisabled, setIsButtonDisabled] = useState(false);
//   const [isButtonDisabled, setIsButtonDisabled] = useState(
//     selectedProduct?.countInStock === 0
//   );
//   const [isAddingToCart, setIsAddingToCart] = useState(false);
//   const [reviews, setReviews] = useState([]);

//   // New state for pincode delivery check
//   const [pincode, setPincode] = useState("");
//   const [deliveryInfo, setDeliveryInfo] = useState(null);
//   const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
//   const [showDeliveryCheck, setShowDeliveryCheck] = useState(false);

//   // const productFetchId = productId || id;
//   const productFetchId = selectedProduct?._id;
//   const [sortOption, setSortOption] = useState("newest");
//   const [expandedReviews, setExpandedReviews] = useState({});
//   const [showAllReviews, setShowAllReviews] = useState(false);

//   // ✅ Inside your ProductDetails component (near useState declarations)
//   const [showModal, setShowModal] = useState(false);
//   const [modalImage, setModalImage] = useState("");
//   const [couponCode, setCouponCode] = useState("");
//   const [finalPrice, setFinalPrice] = useState(null);
//   const [wishlistItems, setWishlistItems] = useState([]);
//   const [isBuyingNow, setIsBuyingNow] = useState(false);
//   const [isBuyNowDisabled, setIsBuyNowDisabled] = useState(false);
//   const [displayCount, setDisplayCount] = useState(8); // Initial 4 products shown

//   const [featuredCollab, setFeaturedCollab] = useState(null);
//   // zoom state + position (in % of the image box)
//   const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

//   const [shareOpen, setShareOpen] = useState(false);
//   const [copied, setCopied] = useState(false);


//   const cart = useSelector((state) => state.cart);

//   const handleZoomEnter = () => setZoom((s) => ({ ...s, active: true }));
//   const handleZoomLeave = () => setZoom({ active: false, x: 50, y: 50 });
//   const handleZoomMove = (e) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = ((e.clientX - rect.left) / rect.width) * 100;
//     const y = ((e.clientY - rect.top) / rect.height) * 100;
//     setZoom((prev) => ({ ...prev, x, y }));
//   };

//   // (optional) mobile touch support
//   const handleZoomTouchMove = (e) => {
//     const t = e.touches?.[0];
//     if (!t) return;
//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = ((t.clientX - rect.left) / rect.width) * 100;
//     const y = ((t.clientY - rect.top) / rect.height) * 100;
//     setZoom((prev) => ({ ...prev, x, y }));
//   };

//   useEffect(() => {
//     const fetchWishlist = async () => {
//       try {
//         const token = localStorage.getItem("userToken");
//         const { data } = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setWishlistItems(data);
//       } catch (err) {
//         console.error("Error fetching wishlist:", err);
//       }
//     };

//     fetchWishlist();
//   }, []);

//   // 👇 Add this
//   const isInWishlist = (productId) => {
//     return wishlistItems.some((item) => item._id === productId); // ✅ Correct
//   };

//   const handleRemoveFromWishlist = async (productId) => {
//     try {
//       const token = localStorage.getItem("userToken");
//       if (!token) {
//         toast.warning("Please login to add itmes to wishlist");
//         navigate("/login");
//         return;
//       }
//       await axios.delete(
//         `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${productId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       toast.success("Removed from wishlist");
//       setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
//     } catch (err) {
//       console.error("Failed to remove from wishlist:", err);
//       toast.error("Failed to remove from wishlist");
//     }
//   };

//   const handleAddToWishlist = async (product) => {
//     try {
//       const token = localStorage.getItem("userToken");
//       if (!token) {
//         toast.warning("Please login to add itmes to wishlist");
//         navigate("/login");
//         return;
//       }
//       await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/add/${product._id}`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       toast.success(`${product.name} added to wishlist`);
//       setWishlistItems((prev) => [...prev, product]);
//     } catch (error) {
//       console.error("Failed to add to wishlist:", error);
//       toast.error("Failed to add to wishlist");
//     }
//   };

//   useEffect(() => {
//     const fetchByParams = async () => {
//       try {
//         const { data } = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/products`
//         );

//         // // Convert product name to slug and match
//         // const matchedProduct = data.find((p) =>
//         //   p.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
//         // );

//         // if (matchedProduct) {
//         //   dispatch(fetchProductDetails(matchedProduct._id));
//         //   dispatch(fetchSimilarProducts(matchedProduct._id));
//         // } else {
//         //   toast.error("Product not found");
//         // }

//         // build slug from name the same way everywhere
//         const toSlug = (name = "") =>
//           name.toLowerCase().trim().replace(/\s+/g, "-");

//         // 1) prefer SKU if present
//         let matchedProduct = null;
//         if (sku) {
//           matchedProduct = data.find(
//             (p) =>
//               String(p.skuCode || p.sku || p._id) === String(sku)
//           );
//         }

//         // 2) fallback to slug match
//         if (!matchedProduct && slug) {
//           matchedProduct = data.find((p) => toSlug(p.name) === toSlug(slug));
//         }

//         if (matchedProduct) {
//           dispatch(fetchProductDetails(matchedProduct._id));
//           dispatch(fetchSimilarProducts(matchedProduct._id));
//         } else {
//           toast.error("Product not found");
//         }
//       } catch (err) {
//         console.error("Error fetching product by slug:", err);
//       }
//     };

//     //   if (slug) fetchBySlug();
//     // }, [slug, dispatch]);
//     fetchByParams();
//   }, [slug, sku, dispatch]);

//   const handleBuyNow = async () => {
//     if (!selectedSize || !selectedColor) {
//       toast.error("Please select a size and color.");
//       return;
//     }

//     const cartItems = cart?.products || [];
//     const totalQuantity = cartItems.reduce(
//       (acc, item) => acc + item.quantity,
//       0
//     );

//     if (totalQuantity >= 10) {
//       toast.error("You can buy up to 10 items only.");
//       return;
//     }

//     setIsBuyingNow(true);
//     setIsBuyNowDisabled(true);

//     const alreadyInCart = cartItems.find(
//       (item) =>
//         item.productId === selectedProduct._id &&
//         item.size === selectedSize &&
//         item.color === selectedColor
//     );

//     try {
//       if (!alreadyInCart) {
//         const user = JSON.parse(localStorage.getItem("userInfo"));
//         const guestId = localStorage.getItem("guestId");

//         const res = await dispatch(
//           addToCart({
//             productId: selectedProduct._id,
//             quantity,
//             size: selectedSize,
//             color: selectedColor,
//             userId: user?._id,
//             guestId,
//           })
//         );

//         if (res.meta.requestStatus !== "fulfilled") {
//           toast.error("Failed to add product. Try again.");
//           return;
//         }
//       }

//       navigate("/checkout");
//     } catch (error) {
//       console.error("Buy Now Error:", error);
//       toast.error("Error while adding to cart.");
//     } finally {
//       setIsBuyingNow(false);
//       setIsBuyNowDisabled(false);
//     }
//   };

//   useEffect(() => {
//     const validateUserCoupon = async () => {
//       try {
//         const token = localStorage.getItem("userToken");
//         if (!token || !couponCode.trim()) {
//           setFinalPrice(null);
//           return;
//         }

//         const { data } = await axios.post(
//           `${import.meta.env.VITE_BACKEND_URL}/api/users/validate-coupon`,
//           { couponCode },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (data.valid && selectedProduct) {
//           const discount = data.discount || 0;
//           const discounted =
//             selectedProduct.discountPrice -
//             selectedProduct.discountPrice * (discount / 100);
//           setFinalPrice(Math.round(discounted));
//           toast.success("Coupon applied successfully!");
//         } else {
//           setFinalPrice(null);
//           toast.error("Invalid or expired coupon");
//         }
//       } catch (err) {
//         console.error("Coupon validation error:", err);
//         toast.error("Failed to validate coupon");
//         setFinalPrice(null);
//       }
//     };

//     validateUserCoupon();
//   }, [couponCode, selectedProduct]);

//   // ✅ Function to handle image click
//   const handleImageClick = (imgUrl) => {
//     setModalImage(imgUrl);
//     setShowModal(true);
//   };

//   // ✅ Function to close modal
//   const handleCloseModal = () => setShowModal(false);

//   // ✅ Optional: close on Esc key
//   useEffect(() => {
//     const escHandler = (e) => {
//       if (e.key === "Escape") handleCloseModal();
//     };
//     document.addEventListener("keydown", escHandler);
//     return () => document.removeEventListener("keydown", escHandler);
//   }, []);

//   useEffect(() => {
//     if (selectedProduct) {
//       setIsButtonDisabled(selectedProduct.countInStock === 0);
//     }
//   }, [selectedProduct]);

//   useEffect(() => {
//     if (productFetchId) {
//       dispatch(fetchProductDetails(productFetchId));
//       dispatch(fetchSimilarProducts(productFetchId));

//       setSelectedColor("");
//       setSelectedSize("");
//     }
//   }, [dispatch, productFetchId]);

//   useEffect(() => {
//     if (selectedProduct?.images?.length > 0) {
//       setMainImage(selectedProduct.images[0].url);
//     }
//   }, [selectedProduct]);

//   const sortedReviews = useMemo(() => {
//     if (sortOption === "highest") {
//       return [...reviews].sort((a, b) => b.rating - a.rating);
//     } else if (sortOption === "lowest") {
//       return [...reviews].sort((a, b) => a.rating - b.rating);
//     } else {
//       return [...reviews].sort(
//         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//       );
//     }
//   }, [sortOption, reviews]);

//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         const res = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/reviews/product/${productFetchId}`
//         );
//         const data = await res.json();
//         setReviews(data);
//       } catch (error) {
//         console.error("Failed to fetch reviews:", error);
//       }
//     };

//     if (productFetchId) {
//       fetchReviews();
//     }
//   }, [productFetchId]);

//   const handleQuantityChange = (action) => {
//     if (action === "plus") {
//       setQuantity((prev) => prev + 1);
//     }
//     if (action === "minus" && quantity > 1) {
//       setQuantity((prev) => prev - 1);
//     }
//   };

//   // Function to check actual pincode delivery availability
//   const checkDeliveryAvailability = async (pincode) => {
//     setIsCheckingDelivery(true);

//     // Validate pincode format
//     const isValidPincode = /^\d{6}$/.test(pincode);

//     if (!isValidPincode) {
//       setDeliveryInfo({
//         isDeliverable: false,
//         message: "Please enter a valid 6-digit pincode",
//       });
//       setIsCheckingDelivery(false);
//       return;
//     }

//     try {
//       // Get pincode details from India Post API
//       const response = await fetch(
//         `https://api.postalpincode.in/pincode/${pincode}`
//       );
//       const data = await response.json();

//       if (data[0].Status === "Error") {
//         setDeliveryInfo({
//           isDeliverable: false,
//           message: "Invalid pincode. Please check and try again.",
//         });
//         setIsCheckingDelivery(false);
//         return;
//       }

//       // Get the location details
//       const location = data[0].PostOffice[0];
//       const district = location.District;
//       const state = location.State;

//       // Calculate distance using Haversine formula
//       // You should replace these coordinates with your actual warehouse/store location
//       const warehouseLocation = {
//         lat: 22.5726, // Kolkata coordinates (replace with your actual location)
//         lon: 88.3639,
//       };

//       // Get approximate coordinates for the pincode location
//       // This is a simplified approach - you might want to use a proper geocoding service
//       const locationCoordinates = await getLocationCoordinates(district, state);

//       if (!locationCoordinates) {
//         setDeliveryInfo({
//           isDeliverable: false,
//           message:
//             "Unable to verify delivery location. Please contact support.",
//         });
//         setIsCheckingDelivery(false);
//         return;
//       }

//       const distance = calculateDistance(
//         warehouseLocation.lat,
//         warehouseLocation.lon,
//         locationCoordinates.lat,
//         locationCoordinates.lon
//       );

//       const isDeliverable = distance <= 22717;

//       const currentDate = new Date();
//       const deliveryDate = new Date(currentDate);
//       deliveryDate.setDate(
//         currentDate.getDate() +
//         (isDeliverable ? Math.floor(Math.random() * 5) + 2 : 0)
//       ); // 2-6 days

//       setDeliveryInfo({
//         isDeliverable,
//         message: isDeliverable
//           ? `Delivery available -  (${distance.toFixed(1)}km away)`
//           : `Not deliverable - beyond 80km radius (${distance.toFixed(
//             1
//           )}km away)`,
//         deliveryDate: isDeliverable
//           ? deliveryDate.toLocaleDateString("en-IN", {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           })
//           : null,
//         deliveryDays: isDeliverable
//           ? Math.ceil((deliveryDate - currentDate) / (1000 * 60 * 60 * 24))
//           : null,
//         location: `${district}, ${state}`,
//       });
//     } catch (error) {
//       console.error("Error checking delivery:", error);
//       setDeliveryInfo({
//         isDeliverable: false,
//         message: "Error checking delivery availability. Please try again.",
//       });
//     } finally {
//       setIsCheckingDelivery(false);
//     }
//   };

//   // Function to get approximate coordinates for a location
//   const getLocationCoordinates = async (district, state) => {
//     try {
//       // Using OpenStreetMap Nominatim API for geocoding
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//           district
//         )},${encodeURIComponent(state)},India&limit=1`
//       );
//       const data = await response.json();

//       if (data.length > 0) {
//         return {
//           lat: parseFloat(data[0].lat),
//           lon: parseFloat(data[0].lon),
//         };
//       }
//       return null;
//     } catch (error) {
//       console.error("Error getting coordinates:", error);
//       return null;
//     }
//   };

//   // Haversine formula to calculate distance between two points
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371; // Earth's radius in kilometers
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLon = ((lon2 - lon1) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c;
//     return distance;
//   };

//   const handleDeliveryCheck = () => {
//     if (pincode.trim()) {
//       checkDeliveryAvailability(pincode.trim());
//     } else {
//       toast.error("Please enter a pincode", { duration: 1500 });
//     }
//   };

//   const handleAddToCart = () => {
//     if (!selectedSize || !selectedColor) {
//       toast.error("Please select a size and color before adding to cart.", {
//         duration: 1500,
//       });
//       return;
//     }

//     const currentCartItems = JSON.parse(
//       localStorage.getItem("persist:root")
//     )?.cart;
//     const totalProductsInCart = currentCartItems
//       ? JSON.parse(currentCartItems)?.cartItems?.reduce(
//         (acc, item) => acc + item.quantity,
//         0
//       )
//       : 0;

//     if (totalProductsInCart + quantity > 10) {
//       toast.error("You can buy up to 10 items", { duration: 2000 });
//       return;
//     }

//     setIsButtonDisabled(true);
//     setIsAddingToCart(true);
//     dispatch(
//       addToCart({
//         productId: productFetchId,
//         quantity,
//         size: selectedSize,
//         color: selectedColor,
//         guestId,
//         userId: user?._id,
//       })
//     )
//       .then(() => {
//         toast.success("Product added to cart!!", { duration: 3000 });
//         flyToCart(mainImage, imgRef.current, cartIconRef); // ✅ Correct image used
//       })
//       .finally(() => {
//         setIsButtonDisabled(false);
//         setIsAddingToCart(false);
//       });
//     // flyToCart(mainImage, imgRef.current, cartIconRef);
//   };

//   useEffect(() => {
//     const fetchCollab = async () => {
//       try {
//         const { data } = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/collabs`
//         );
//         if (data && data.length > 0) {
//           setFeaturedCollab(data[0]);
//         }
//       } catch (err) {
//         console.error("Failed to load featured collab", err);
//       }
//     };

//     fetchCollab();
//   }, []);

//   if (loading) return <ProductDetailsSkeleton />;

//   if (error) return <p>Error: {error}</p>;

//   const calculateOriginalPrice = () => {
//     if (selectedProduct.discountPrice && selectedProduct.offerPercentage > 0) {
//       return Math.floor(
//         (selectedProduct.discountPrice * 100) /
//         (100 - selectedProduct.offerPercentage)
//       );
//     }
//     return selectedProduct.discountPrice || selectedProduct.price;
//   };

//   const formatReviewDate = (isoDate) => {
//     const options = { day: "2-digit", month: "long", year: "numeric" };
//     return new Date(isoDate).toLocaleDateString("en-IN", options);
//   };
//   const totalReviews = reviews.length || 1;
//   const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
//     const count = reviews.filter((r) => r.rating === star).length;
//     return {
//       star,
//       count,
//       percentage: Math.round((count / totalReviews) * 100),
//     };
//   });
//   const totalQuantity =
//     cart?.products?.reduce((acc, item) => acc + item.quantity, 0) || 0;
//   const maxLimitReached = totalQuantity >= 10;

//   const handleShare = async () => {
//     try {
//       const productUrl = window.location.href;

//       if (navigator.share) {
//         await navigator.share({
//           title: selectedProduct?.name,
//           text: "Check out this product!",
//           url: productUrl,
//         });
//       } else {
//         await navigator.clipboard.writeText(productUrl);
//         toast.success("Link copied to clipboard!");
//       }
//     } catch (err) {
//       console.error("Share failed:", err);
//     }
//   };


//   return (
//     <div className="min-h-screen py-10 px-3 md:px-4">
//       {selectedProduct && (
//         <div className="max-w-6xl mx-auto rounded-2xl border border-white/60 shadow-[0_10px_50px_-15px_rgba(16,24,40,0.15)] bg-white/70 backdrop-blur-md">
//           {/* Top Section */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 p-4 md:p-8">
//             {/* Media Column */}
//             <div className="md:sticky md:top-24">
//               <div className="flex gap-4">
//                 {/* Left Thumbs (desktop) */}
//                 <div className="hidden md:flex flex-col space-y-3">
//                   {selectedProduct.images.map((image, index) => (
//                     <img
//                       key={index}
//                       src={image.url}
//                       alt={image.altText || `Thumb ${index}`}
//                       className={`w-16 h-16 rounded-xl cursor-pointer border transition-all duration-300 ${mainImage === image.url
//                         ? "border-sky-600 shadow-md scale-[1.03]"
//                         : "border-gray-200 hover:border-sky-400"
//                         }`}
//                       onClick={() => setMainImage(image.url)}
//                     />
//                   ))}
//                 </div>

//                 {/* Main Image */}
//                 <div className="flex-1">
//                   {mainImage ? (
//                     <div
//                       className="relative w-full h-[420px] md:h-[520px] bg-white rounded-2xl border border-gray-200 overflow-hidden"
//                       onMouseEnter={handleZoomEnter}
//                       onMouseLeave={handleZoomLeave}
//                       onMouseMove={handleZoomMove}
//                       onTouchStart={() => setZoom((s) => ({ ...s, active: true }))}
//                       onTouchEnd={handleZoomLeave}
//                       onTouchMove={handleZoomTouchMove}
//                     >
//                       <img
//                         ref={imgRef}
//                         src={mainImage}
//                         alt="Main Product"
//                         onClick={() => handleImageClick(mainImage)}
//                         className="w-full h-full object-contain cursor-zoom-in"
//                         style={{
//                           transform: zoom.active ? "scale(2)" : "scale(1)",
//                           transformOrigin: `${zoom.x}% ${zoom.y}%`,
//                           transition: "transform 120ms ease-out",
//                           willChange: "transform",
//                         }}
//                       />

//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           isInWishlist(selectedProduct._id)
//                             ? handleRemoveFromWishlist(selectedProduct._id)
//                             : handleAddToWishlist(selectedProduct);
//                         }}
//                         title={
//                           isInWishlist(selectedProduct._id)
//                             ? "Remove from Wishlist"
//                             : "Add to Wishlist"
//                         }
//                         className={`absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full p-2 shadow-md transition duration-300 ease-in-out hover:scale-110 ${isInWishlist(selectedProduct._id)
//                           ? "bg-red-100 text-red-600 hover:bg-red-200"
//                           : "bg-white text-gray-800 hover:bg-pink-100"
//                           }`}
//                       >
//                         {isInWishlist(selectedProduct._id) ? (
//                           <AiFillHeart className="text-2xl animate-pulse" />
//                         ) : (
//                           <AiOutlineHeart className="text-2xl" />
//                         )}
//                       </button>
//                       {/* <button
//   onClick={(e) => {
//     e.stopPropagation();
//     handleShare();
//   }}
//   title="Share Product"
//   className="absolute top-4 right-16 z-10 w-11 h-11 flex items-center justify-center rounded-full p-2 shadow-md bg-white text-gray-800 hover:bg-sky-100 transition duration-300 ease-in-out hover:scale-110"
// >
//   <FiShare2 className="text-2xl" />
// </button> */}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setShareOpen(true);
//                         }}
//                         title="Share Product"
//                         className="absolute top-4 right-16 z-10 w-11 h-11 flex items-center justify-center rounded-full p-2 shadow-md bg-white text-gray-800 hover:bg-sky-100 transition duration-300 ease-in-out hover:scale-110"
//                       >
//                         <FiShare2 className="text-2xl" />
//                       </button>

//                       {/* Alert badge below image */}
//                       <div className="mt-3">
//                         <div className="inline-block px-3 py-1 text-sm font-medium text-white rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 shadow-md animate-pulse">
//                           🔍 Click on the image to view the full image
//                         </div>
//                       </div>

//                     </div>
//                   ) : (
//                     <div className="w-full h-[300px] flex items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
//                       No image available
//                     </div>
//                   )}

//                   {/* Alert badge below image */}
//                   <div className="mt-3 flex justify-center">
//                     <div className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-sm border border-white/20 cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-md">
//                       <span><BsSearch /> </span>
//                       <span>Click image to view full size</span>
//                     </div>
//                   </div>


//                   {/* Mobile Thumbnails */}
//                   <div className="flex md:hidden mt-4 space-x-3 overflow-x-auto no-scrollbar">
//                     {selectedProduct.images.map((image, index) => (
//                       <img
//                         key={index}
//                         src={image.url}
//                         alt={image.altText || `Thumb ${index}`}
//                         className={`w-20 h-20 rounded-xl cursor-pointer border transition-all duration-300 ${mainImage === image.url
//                           ? "border-sky-600 shadow-md scale-105"
//                           : "border-gray-300 hover:border-sky-400"
//                           }`}
//                         onClick={() => setMainImage(image.url)}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Characteristics */}
//               {/* Characteristics */}
//               <div className="mt-6 hidden md:block">
//                 <h3 className="text-lg font-semibold mb-2 text-gray-800">
//                   Specifications
//                 </h3>
//                 <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
//                   <table className="w-full text-sm text-gray-800">
//                     <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-600">
//                       <tr>
//                         <th className="px-4 py-3">Attribute</th>
//                         <th className="px-4 py-3">Value</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr className="hover:bg-gray-50 transition">
//                         <td className="px-4 py-3 font-medium">Brand</td>
//                         <td className="px-4 py-3">{selectedProduct.brand}</td>
//                       </tr>
//                       <tr className="bg-gray-50 hover:bg-gray-100 transition">
//                         <td className="px-4 py-3 font-medium">Material</td>
//                         <td className="px-4 py-3">{selectedProduct.material}</td>
//                       </tr>
//                       <tr className="hover:bg-gray-50 transition">
//                         <td className="px-4 py-3 font-medium">Gender</td>
//                         <td className="px-4 py-3">{selectedProduct.gender}</td>
//                       </tr>
//                       {selectedProduct.dimensions && (
//                         <tr className="hover:bg-gray-50 transition">
//                           <td className="px-4 py-3 font-medium">Dimensions</td>
//                           <td className="px-4 py-3">
//                             {selectedProduct.dimensions.length || 0} x{" "}
//                             {selectedProduct.dimensions.width || 0} x{" "}
//                             {selectedProduct.dimensions.height || 0} cm
//                           </td>
//                         </tr>
//                       )}
//                       {selectedProduct.weight && (
//                         <tr className="hover:bg-gray-50 transition">
//                           <td className="px-4 py-3 font-medium">Weight</td>
//                           <td className="px-4 py-3">
//                             {selectedProduct.weight} gm
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//             </div>

//             {/* Info Column */}
//             <div className="flex flex-col">
//               <div className="mb-2 flex items-center gap-2">
//                 <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs">
//                   <BsPatchCheckFill /> Verified
//                 </span>
//                 {selectedProduct?.offerPercentage ? (
//                   <span className="inline-flex items-center gap-1 text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full text-xs">
//                     {selectedProduct.offerPercentage}% off
//                   </span>
//                 ) : null}
//               </div>

//               <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
//                 {selectedProduct.name}
//               </h1>

//               {/* Ratings */}
//               {selectedProduct.rating > 0 &&
//                 selectedProduct.numReviews > 0 && (
//                   <div className="mt-2 flex items-center gap-2">
//                     <span className="bg-green-600 text-white px-2 py-0.5 rounded-md">
//                       {selectedProduct.rating.toFixed(1)} ★
//                     </span>
//                     <span className="text-sm text-gray-600">
//                       {selectedProduct.numReviews} review
//                       {selectedProduct.numReviews === 1 ? "" : "s"}
//                     </span>
//                   </div>
//                 )}

//               {/* Pricing */}
//               {selectedProduct.discountPrice &&
//                 selectedProduct.offerPercentage ? (
//                 <div className="mt-4">
//                   <div className="flex items-end gap-3">
//                     <div className="text-4xl font-semibold text-sky-700 tracking-tight">
//                       ₹{Math.floor(selectedProduct.discountPrice)}
//                     </div>
//                     <div className="text-gray-500 line-through text-xl">
//                       ₹{Math.floor(selectedProduct.price)}
//                     </div>
//                   </div>
//                   <div className="text-green-600 font-medium mt-1">
//                     {selectedProduct.offerPercentage}% OFF
//                   </div>
//                 </div>
//               ) : (
//                 <div className="mt-4">
//                   <div className="flex items-end gap-3">
//                     <div className="text-4xl font-semibold text-sky-700 tracking-tight">
//                       ₹{Math.floor(selectedProduct.price)}
//                     </div>
//                     <div className="text-gray-500 line-through text-xl">
//                       ₹
//                       {Math.floor(
//                         (selectedProduct.price * 100) /
//                         (100 - selectedProduct.discountPrice)
//                       )}
//                     </div>
//                   </div>
//                   <div className="text-green-600 font-medium mt-1">
//                     {selectedProduct.discountPrice}% OFF
//                   </div>
//                 </div>
//               )}

//               <p className="mt-4 text-gray-700 leading-relaxed">
//                 {selectedProduct.description}
//               </p>

//               {/* Colors */}
//               <div className="mt-6">
//                 <p className="font-medium text-gray-800 mb-2">Color</p>
//                 <div className="flex flex-wrap gap-3">
//                   {selectedProduct.colors.map((color) => (
//                     <button
//                       onClick={() =>
//                         setSelectedColor((prev) =>
//                           prev === color ? null : color
//                         )
//                       }
//                       key={color}
//                       className={`w-10 h-10 rounded-full border transition-all duration-300 ${selectedColor === color
//                         ? "border-4 border-sky-600 scale-110"
//                         : "border-gray-300 hover:border-gray-500"
//                         }`}
//                       style={{ backgroundColor: color.toLowerCase() }}
//                       title={color}
//                     />
//                   ))}
//                 </div>
//               </div>

//               {/* Sizes */}
//               <div className="mt-6">
//                 <p className="font-medium text-gray-800 mb-2">Size</p>
//                 <div className="flex flex-wrap gap-3">
//                   {selectedProduct.sizes.map((size) => (
//                     <button
//                       onClick={() =>
//                         setSelectedSize((prev) =>
//                           prev === size ? null : size
//                         )
//                       }
//                       key={size}
//                       className={`px-4 py-2 rounded-full border transition-all font-medium ${selectedSize === size
//                         ? "bg-sky-600 text-white shadow"
//                         : "border-gray-300 hover:bg-sky-50"
//                         }`}
//                     >
//                       {size}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Quantity */}
//               <div className="mt-6">
//                 <p className="font-medium text-gray-800 mb-2">Quantity</p>
//                 <div className="inline-flex items-center gap-4 rounded-full bg-gray-100 p-2">
//                   <button
//                     onClick={() => handleQuantityChange("minus")}
//                     disabled={quantity <= 1}
//                     className={`w-9 h-9 flex justify-center items-center rounded-full text-lg bg-white border ${quantity <= 1
//                       ? "opacity-50 cursor-not-allowed"
//                       : "hover:bg-gray-50"
//                       }`}
//                   >
//                     −
//                   </button>
//                   <span className="text-lg min-w-[24px] text-center">
//                     {quantity}
//                   </span>
//                   <button
//                     onClick={() => handleQuantityChange("plus")}
//                     disabled={quantity >= 10}
//                     className={`w-9 h-9 flex justify-center items-center rounded-full text-lg bg-white border ${quantity >= 10
//                       ? "opacity-50 cursor-not-allowed"
//                       : "hover:bg-gray-50"
//                       }`}
//                   >
//                     +
//                   </button>
//                 </div>
//                 {quantity >= 10 && (
//                   <p className="text-xs text-red-600 mt-1">
//                     You can buy up to 10 items only.
//                   </p>
//                 )}
//               </div>

//               {/* Stock Info */}
//               <div className="mt-4">
//                 <p className="font-medium text-gray-800 mb-1">Availability</p>
//                 {selectedProduct.countInStock === 0 ? (
//                   <span className="font-semibold text-lg text-red-600">
//                     Out of Stock
//                   </span>
//                 ) : selectedProduct.countInStock < 10 ? (
//                   <>
//                     <span className="font-semibold text-lg text-red-600">
//                       Hurry! Only {selectedProduct.countInStock} item
//                       {selectedProduct.countInStock === 1 ? "" : "s"} left
//                     </span>
//                     <p className="text-sm text-red-500 mt-1 animate-pulse">
//                       Almost gone! Order soon.
//                     </p>
//                   </>
//                 ) : (
//                   <span className="font-semibold text-lg text-emerald-600">
//                     In Stock
//                   </span>
//                 )}
//               </div>

//               {/* CTAs */}
//               <div className="mt-6 flex gap-4">
//                 {/* <img ref={imgRef} src={selectedProduct.images[0].url} alt={selectedProduct.name} className="rounded-xl w-full object-cover" /> */}
//                 <button
//                   onClick={handleAddToCart}
//                   disabled={isButtonDisabled || quantity >= 10}
//                   className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${isButtonDisabled
//                     ? "bg-sky-300 text-white cursor-not-allowed"
//                     : "bg-sky-600 text-white hover:bg-sky-700"
//                     }`}
//                 >
//                   < FaCartShopping className="text-xl" />
//                   {isAddingToCart ? "Adding..." : "Add to Bag"}
//                 </button>

//                 {/* Buy Now logic kept but button visually consistent; still commented as in your file */}
//                 {/* <button
//                   onClick={handleBuyNow}
//                   disabled={isBuyNowDisabled || totalQuantity >= 10}
//                   className={`w-1/2 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${
//                     isBuyNowDisabled
//                       ? "bg-emerald-400 text-white cursor-not-allowed"
//                       : "bg-emerald-600 text-white hover:bg-emerald-700"
//                   }`}
//                 >
//                   <FiZap className={`text-xl ${isBuyingNow ? "animate-pulse" : ""}`} />
//                   {isBuyingNow ? "Processing..." : "Buy Now"}
//                 </button> */}
//               </div>

//               {/* Pincode Delivery Check */}
//               <div className="mt-6 p-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white">
//                 <div className="flex items-center gap-2 mb-3">
//                   <span className="text-lg">🚚</span>
//                   <p className="font-medium text-gray-800">
//                     Check Delivery Availability
//                   </p>
//                 </div>

//                 <div className="flex flex-col md:flex-row gap-3 mb-3">
//                   <input
//                     type="text"
//                     placeholder="Enter pincode"
//                     value={pincode}
//                     onChange={(e) => setPincode(e.target.value)}
//                     className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
//                     maxLength={6}
//                   />
//                   <button
//                     onClick={handleDeliveryCheck}
//                     disabled={isCheckingDelivery}
//                     className="px-6 py-2 rounded-lg font-medium text-white bg-sky-600 hover:bg-sky-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
//                   >
//                     {isCheckingDelivery ? "Checking..." : "Check"}
//                   </button>
//                 </div>

//                 {deliveryInfo && (
//                   <div
//                     className={`p-3 rounded-xl ${deliveryInfo.isDeliverable
//                       ? "bg-emerald-50 border border-emerald-200"
//                       : "bg-red-50 border border-red-200"
//                       }`}
//                   >
//                     <div className="flex items-center gap-2 mb-2">
//                       <span
//                         className={`font-medium ${deliveryInfo.isDeliverable
//                           ? "text-emerald-700"
//                           : "text-red-700"
//                           }`}
//                       >
//                         {deliveryInfo.message}
//                       </span>
//                     </div>

//                     {deliveryInfo.isDeliverable && deliveryInfo.deliveryDate && (
//                       <div className="text-sm text-emerald-700 space-y-0.5">
//                         <p>
//                           <strong>Location:</strong> {deliveryInfo.location}
//                         </p>
//                         <p>
//                           <strong>Estimated Delivery:</strong>{" "}
//                           {deliveryInfo.deliveryDate}
//                         </p>
//                         <p>
//                           <strong>Delivery Time:</strong>{" "}
//                           {deliveryInfo.deliveryDays} days from today
//                         </p>
//                       </div>
//                     )}

//                     {!deliveryInfo.isDeliverable && deliveryInfo.location && (
//                       <div className="text-sm text-red-700">
//                         <p>
//                           <strong>Location:</strong> {deliveryInfo.location}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Specifications (mobile-only, shown after details) */}
//               <div className="mt-6 md:hidden">
//                 <h3 className="text-lg font-semibold mb-2 text-gray-800">
//                   Specifications
//                 </h3>
//                 <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
//                   <table className="w-full text-sm text-gray-800">
//                     <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-600">
//                       <tr>
//                         <th className="px-4 py-3">Attribute</th>
//                         <th className="px-4 py-3">Value</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr className="hover:bg-gray-50 transition">
//                         <td className="px-4 py-3 font-medium">Brand</td>
//                         <td className="px-4 py-3">{selectedProduct.brand}</td>
//                       </tr>
//                       <tr className="bg-gray-50 hover:bg-gray-100 transition">
//                         <td className="px-4 py-3 font-medium">Material</td>
//                         <td className="px-4 py-3">{selectedProduct.material}</td>
//                       </tr>
//                       <tr className="hover:bg-gray-50 transition">
//                         <td className="px-4 py-3 font-medium">Gender</td>
//                         <td className="px-4 py-3">{selectedProduct.gender}</td>
//                       </tr>
//                       {selectedProduct.dimensions && (
//                         <tr className="hover:bg-gray-50 transition">
//                           <td className="px-4 py-3 font-medium">Dimensions</td>
//                           <td className="px-4 py-3">
//                             {selectedProduct.dimensions.length || 0} x{" "}
//                             {selectedProduct.dimensions.width || 0} x{" "}
//                             {selectedProduct.dimensions.height || 0} cm
//                           </td>
//                         </tr>
//                       )}
//                       {selectedProduct.weight && (
//                         <tr className="hover:bg-gray-50 transition">
//                           <td className="px-4 py-3 font-medium">Weight</td>
//                           <td className="px-4 py-3">
//                             {selectedProduct.weight} gm
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//             </div>
//           </div>

//           {/* Reviews + Breakdown */}
//           <div className="px-4 md:px-8 pb-10">
//             <div className="mt-6 mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* ⭐ Rating Summary (screenshot-style) */}
//               {(() => {
//                 // Map stars → label and color
//                 const LABELS = {
//                   5: "Excellent",
//                   4: "Very Good",
//                   3: "Good",
//                   2: "Average",
//                   1: "Poor",
//                 };
//                 const BAR_COLOR = (star) =>
//                   star >= 4
//                     ? "bg-emerald-500"
//                     : star === 3
//                       ? "bg-amber-400"
//                       : star === 2
//                         ? "bg-orange-400"
//                         : "bg-red-500";

//                 // Pull counts per star from your ratingCounts array
//                 const byStar = (star) =>
//                   ratingCounts.find((r) => r.star === star)?.count || 0;

//                 const totalRatings =
//                   selectedProduct?.numRatings ??
//                   ratingCounts.reduce((sum, r) => sum + (r.count || 0), 0);

//                 const avg = selectedProduct?.rating || 0;
//                 const totalReviews = selectedProduct?.numReviews || 0;

//                 return (
//                   <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm self-start">
//                     <h3 className="text-lg font-semibold text-sky-800 mb-4">
//                       Rating Breakdown
//                     </h3>

//                     <div className="grid grid-cols-12 gap-6 items-start">
//                       {/* Left: Average rating block */}
//                       <div className="col-span-12 sm:col-span-4">
//                         <div className="flex items-center gap-2">
//                           <span className="text-4xl font-bold text-emerald-600">
//                             {avg.toFixed(1)}
//                           </span>
//                           <span className="text-emerald-600 text-2xl leading-none">
//                             ★
//                           </span>
//                         </div>

//                         <div className="mt-3 text-sm text-slate-500 space-y-0.5">
//                           <div className="leading-none">
//                             <span className="font-medium">{totalRatings}</span>{" "}
//                             Ratings,
//                           </div>
//                           <div className="leading-none">
//                             <span className="font-medium">{totalReviews}</span>{" "}
//                             Reviews
//                           </div>
//                         </div>
//                       </div>

//                       {/* Right: Bars */}
//                       <div className="col-span-12 sm:col-span-8 space-y-4">
//                         {[5, 4, 3, 2, 1].map((star) => {
//                           const count = byStar(star);
//                           const pct = totalRatings
//                             ? (count / totalRatings) * 100
//                             : 0;

//                           return (
//                             <div key={star} className="space-y-1">
//                               {/* Row header: label on left, count on right */}
//                               <div className="flex items-center justify-between text-sm text-slate-600">
//                                 <span className="min-w-24">
//                                   {LABELS[star]}
//                                 </span>
//                                 <span className="font-semibold tabular-nums">
//                                   {count}
//                                 </span>
//                               </div>

//                               {/* Progress bar */}
//                               <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
//                                 <div
//                                   className={`h-full ${BAR_COLOR(
//                                     star
//                                   )} rounded-full transition-all duration-500`}
//                                   style={{ width: `${pct}%` }}
//                                   aria-label={`${LABELS[star]}: ${count} (${pct.toFixed(
//                                     0
//                                   )}%)`}
//                                 />
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })()}

//               {/* Reviews */}
//               <div className="lg:col-span-2">
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
//                   <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
//                     Customer Reviews
//                   </h2>
//                   <div className="mt-3 sm:mt-0">
//                     <select
//                       value={sortOption}
//                       onChange={(e) => setSortOption(e.target.value)}
//                       className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
//                     >
//                       <option value="newest">Newest First</option>
//                       <option value="highest">Highest Rating</option>
//                       <option value="lowest">Lowest Rating</option>
//                     </select>
//                   </div>
//                 </div>

//                 {sortedReviews.length > 0 ? (
//                   <>
//                     <div className="bg-white rounded-2xl shadow-sm">
//                       {(showAllReviews ? sortedReviews : sortedReviews.slice(0, 3)).map((review, index) => (
//                         <div
//                           key={index}
//                           className=" p-4 pl-5"
//                         >
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center gap-4">
//                               <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-lg ring-1 ring-sky-200">
//                                 {review.user?.name?.charAt(0).toUpperCase() ||
//                                   "U"}
//                               </div>
//                               <div>
//                                 <h4 className="text-base md:text-lg font-semibold text-gray-900">
//                                   {review.user?.name || "Anonymous"}
//                                 </h4>
//                                 <div className="flex items-center gap-1 mt-1">
//                                   <span
//                                     className={`text-white px-2 rounded text-sm ${review.rating >= 4
//                                       ? "bg-emerald-500"
//                                       : review.rating === 3
//                                         ? "bg-amber-400"
//                                         : review.rating === 2
//                                           ? "bg-orange-400"
//                                           : "bg-red-500"
//                                       }`}
//                                   >
//                                     {review.rating}.0 ★
//                                   </span>

//                                   <GoDotFill
//                                     size={10}
//                                     className="text-gray-600"
//                                   />
//                                   <span className="text-xs text-gray-500">
//                                     <span className="text-black/70">
//                                       Posted on:{" "}
//                                     </span>
//                                     <span>
//                                       {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", })}
//                                     </span>
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                           <p className="text-gray-700">{review.comment}</p>

//                           {/* Display Image if available */}
//                           {review.image && review.image.length > 0 && (
//                             <div className="mt-4 flex flex-wrap gap-2">
//                               {review.image.map((imgUrl, index) => (
//                                 <img
//                                   key={index}
//                                   src={imgUrl}
//                                   alt={`Review image ${index + 1}`}
//                                   onClick={() => handleImageClick(imgUrl)}   // ← open modal
//                                   className="w-18 h-18 rounded-lg object-cover cursor-zoom-in" // ← pointer + zoom cursor
//                                 />

//                               ))}
//                             </div>
//                           )}
//                           <hr className="mt-4 border-t-1 border-gray-400" />
//                         </div>
//                       ))}
//                     </div>

//                     {sortedReviews.length > 3 && (
//                       <div className="text-center mt-6">
//                         <button
//                           onClick={() => setShowAllReviews((v) => !v)}
//                           className="px-4 py-2 text-sm font-semibold text-sky-700 border border-sky-400 rounded-lg hover:bg-sky-50 transition"
//                         >
//                           {showAllReviews ? "Show Less" : "View More Reviews"}
//                         </button>
//                       </div>
//                     )}
//                   </>
//                 ) : (
//                   <div className="bg-sky-50 border border-sky-100 text-center p-8 rounded-2xl text-gray-500">
//                     <p>No reviews yet.</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Similar Products */}
//             {similarProducts.length > 0 && !featuredCollab?.isPublished && (
//               <div className="mt-6">
//                 <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
//                   More Products You Might Love
//                 </h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
//                   {similarProducts.slice(0, displayCount).map((product) => (
//                     <div
//                       key={product._id}
//                       onClick={() =>
//                         navigate(
//                           `/product/${product.name
//                             .toLowerCase()
//                             .replace(/\s+/g, "-")}`
//                         )
//                       }
//                       className="cursor-pointer rounded-xl border border-gray-200 hover:shadow-lg transition bg-white"
//                     >
//                       <img
//                         src={product.images?.[0]?.url || "/no-image.png"}
//                         alt={product.name}
//                         className="w-full h-60 object-cover rounded-t-xl"
//                       />
//                       <div className="px-3 pt-2 pb-3">
//                         <h4 className="text-sm font-medium text-gray-900 truncate">
//                           {product.name}
//                         </h4>
//                         <div className="flex items-center gap-2 mt-1">
//                           <span className="inline-flex items-center gap-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
//                             ★ {product.rating?.toFixed(1) || "0.0"}
//                           </span>
//                           <span className="text-gray-500 text-xs">
//                             {product.numReviews || 0} Reviews
//                           </span>
//                         </div>
//                         <div className="mt-1 flex items-center gap-2">
//                           <p className="text-base font-bold text-sky-700">
//                             ₹{Math.floor(
//                               product.discountPrice || product.price
//                             )}
//                           </p>
//                           {product.discountPrice && (
//                             <p className="text-xs line-through text-gray-500">
//                               ₹{product.price}
//                             </p>
//                           )}
//                           <p className="text-sm text-green-600">
//                             {product.offerPercentage
//                               ? product.offerPercentage + "%"
//                               : ""}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 {similarProducts.length > displayCount && (
//                   <div className="flex justify-center mt-6">
//                     <button
//                       onClick={() => setDisplayCount((prev) => prev + 4)}
//                       className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
//                     >
//                       Load More
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//       {shareOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//           onClick={() => setShareOpen(false)}   // ← CLOSE WHEN CLICK OUTSIDE
//         >
//           <div
//             className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 relative"
//             onClick={(e) => e.stopPropagation()}   // ← PREVENT CLOSE WHEN CLICK INSIDE
//           >
//             {/* Close Button */}
//             <button
//               onClick={() => setShareOpen(false)}
//               className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
//             >
//               ✕
//             </button>

//             <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
//               Share this Product
//             </h2>

//             <div className="grid grid-cols-3 gap-4 text-center">

//               {/* WhatsApp */}
//               <a
//                 href={`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex flex-col items-center"
//               >
//                 <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" className="w-10 h-10" />
//                 <span className="text-sm mt-1">WhatsApp</span>
//               </a>

//               {/* Facebook */}
//               <a
//                 href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex flex-col items-center"
//               >
//                 <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" className="w-10 h-10" />
//                 <span className="text-sm mt-1">Facebook</span>
//               </a>

//               {/* Instagram */}
//               <a
//                 href="https://www.instagram.com/"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex flex-col items-center"
//               >
//                 <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" className="w-10 h-10" />
//                 <span className="text-sm mt-1">Instagram</span>
//               </a>

//               {/* Telegram */}
//               <a
//                 href={`https://t.me/share/url?url=${window.location.href}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex flex-col items-center"
//               >
//                 <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" className="w-10 h-10" />
//                 <span className="text-sm mt-1">Telegram</span>
//               </a>

//               {/* Twitter */}
//               <a
//                 href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex flex-col items-center"
//               >
//                 <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" className="w-10 h-10" />
//                 <span className="text-sm mt-1">Twitter</span>
//               </a>

//               {/* Copy Link */}
//               <button
//                 onClick={() => {
//                   navigator.clipboard.writeText(window.location.href);
//                   setCopied(true);
//                   toast.success("Link Copied!");

//                   setTimeout(() => setCopied(false), 1000); // reset after animation
//                 }}
//                 className="flex flex-col items-center transition"
//               >
//                 <FiCopy
//                   className={`w-10 h-10 transition-all duration-300 
//       ${copied ? "text-green-600 scale-110" : "text-gray-800"}`}
//                 />

//                 <span className="text-sm mt-1">
//                   {copied ? "Copied!" : "Copy link"}
//                 </span>
//               </button>

//             </div>
//           </div>
//         </div>
//       )}



//       {/* 🔍 Image Modal */}
//       {showModal && (
//         <div
//           className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
//           onClick={handleCloseModal}
//         >
//           <div
//             className="w-full h-full max-w-5xl max-h-screen relative"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Close Button */}
//             <button
//               onClick={handleCloseModal}
//               className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl font-bold z-50"
//             >
//               ✕
//             </button>

//             {/* Zoomable Image */}
//             <div className="w-full h-full flex items-center justify-center overflow-hidden touch-pinch-zoom">
//               <img
//                 src={modalImage}
//                 alt="Zoomed Product"
//                 className="max-w-full max-h-full object-contain transition-transform duration-300"
//                 style={{ touchAction: "pan-x pan-y", userSelect: "none" }}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const ProductDetailsSkeleton = () => {
//   return (
//     <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-8 md:p-12 animate-pulse">
//       <div className="flex flex-col md:flex-row gap-8">
//         <div className="hidden md:flex flex-col space-y-4">
//           {[...Array(4)].map((_, i) => (
//             <Skeleton key={i} width={80} height={80} circle />
//           ))}
//         </div>

//         <div className="md:w-1/2 w-full">
//           <Skeleton height={400} className="rounded-3xl" />
//           <div className="flex md:hidden mt-4 space-x-4 overflow-x-auto scrollbar-hide">
//             {[...Array(4)].map((_, i) => (
//               <Skeleton key={i} width={80} height={80} circle />
//             ))}
//           </div>

//           <div className="mt-4 space-y-2">
//             <Skeleton height={20} width={150} />
//             <Skeleton height={80} />
//           </div>
//         </div>

//         <div className="md:w-1/2 space-y-4">
//           <Skeleton height={40} width={`80%`} />
//           <Skeleton height={20} width={`60%`} />
//           <Skeleton height={30} width={`30%`} />
//           <Skeleton height={60} />
//           <Skeleton height={20} width={`40%`} />
//           <Skeleton count={3} height={20} />
//           <Skeleton height={45} width={`100%`} className="rounded-full" />
//         </div>
//       </div>

//       <div className="mt-20">
//         <Skeleton height={30} width={200} className="mx-auto mb-6" />
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {[...Array(4)].map((_, i) => (
//             <Skeleton key={i} height={250} className="rounded-xl" />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetails;


import React, { useEffect, useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import ProductGrid from "./ProductGrid";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductDetails,
  fetchSimilarProducts,
} from "../../redux/slices/productsSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { BsPatchCheckFill, BsSearch } from "react-icons/bs";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import axios from "axios";
import { FiShoppingCart, FiZap } from "react-icons/fi";
import { GoDotFill } from "react-icons/go";
import { FaCartShopping } from "react-icons/fa6";
import { flyToCart } from "../../utils/flyToCart";
import { FiShare2 } from "react-icons/fi";
import { FiCopy } from "react-icons/fi";

const ProductDetails = ({ productId }) => {
  const imgRef = useRef(null); // 👈 ref to product image
  const cartIconRef = window.cartIconRef;
  const { slug, sku } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct, loading, error, similarProducts } = useSelector(
    (state) => state.products
  );
  const { user, guestId } = useSelector((state) => state.auth);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(
    selectedProduct?.countInStock === 0
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);

  // New state for pincode delivery check
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const [showDeliveryCheck, setShowDeliveryCheck] = useState(false);

  const productFetchId = selectedProduct?._id;
  const [sortOption, setSortOption] = useState("newest");
  const [expandedReviews, setExpandedReviews] = useState({});
  const [showAllReviews, setShowAllReviews] = useState(false);

  // ✅ Inside your ProductDetails component (near useState declarations)
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [finalPrice, setFinalPrice] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isBuyNowDisabled, setIsBuyNowDisabled] = useState(false);
  const [displayCount, setDisplayCount] = useState(8); // Initial 8 products shown

  const [featuredCollab, setFeaturedCollab] = useState(null);
  // zoom state + position (in % of the image box)
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cart = useSelector((state) => state.cart);

  const handleZoomEnter = () => setZoom((s) => ({ ...s, active: true }));
  const handleZoomLeave = () => setZoom({ active: false, x: 50, y: 50 });
  const handleZoomMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom((prev) => ({ ...prev, x, y }));
  };

  // (optional) mobile touch support
  const handleZoomTouchMove = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((t.clientX - rect.left) / rect.width) * 100;
    const y = ((t.clientY - rect.top) / rect.height) * 100;
    setZoom((prev) => ({ ...prev, x, y }));
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWishlistItems(data);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };

    fetchWishlist();
  }, []);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.warning("Please login to add itmes to wishlist");
        navigate("/login");
        return;
      }
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/remove/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Removed from wishlist");
      setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      toast.error("Failed to remove from wishlist");
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.warning("Please login to add itmes to wishlist");
        navigate("/login");
        return;
      }
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/add/${product._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`${product.name} added to wishlist`);
      setWishlistItems((prev) => [...prev, product]);
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      toast.error("Failed to add to wishlist");
    }
  };

  useEffect(() => {
    const fetchByParams = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products`
        );

        const toSlug = (name = "") =>
          name.toLowerCase().trim().replace(/\s+/g, "-");

        let matchedProduct = null;
        if (sku) {
          matchedProduct = data.find(
            (p) =>
              String(p.skuCode || p.sku || p._id) === String(sku)
          );
        }

        if (!matchedProduct && slug) {
          matchedProduct = data.find((p) => toSlug(p.name) === toSlug(slug));
        }

        if (matchedProduct) {
          dispatch(fetchProductDetails(matchedProduct._id));
          dispatch(fetchSimilarProducts(matchedProduct._id));
        } else {
          toast.error("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product by slug:", err);
      }
    };

    fetchByParams();
  }, [slug, sku, dispatch]);

  const handleBuyNow = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color.");
      return;
    }

    const cartItems = cart?.products || [];
    const totalQuantity = cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    if (totalQuantity >= 10) {
      toast.error("You can buy up to 10 items only.");
      return;
    }

    setIsBuyingNow(true);
    setIsBuyNowDisabled(true);

    const alreadyInCart = cartItems.find(
      (item) =>
        item.productId === selectedProduct._id &&
        item.size === selectedSize &&
        item.color === selectedColor
    );

    try {
      if (!alreadyInCart) {
        const user = JSON.parse(localStorage.getItem("userInfo"));
        const guestId = localStorage.getItem("guestId");

        const res = await dispatch(
          addToCart({
            productId: selectedProduct._id,
            quantity,
            size: selectedSize,
            color: selectedColor,
            userId: user?._id,
            guestId,
          })
        );

        if (res.meta.requestStatus !== "fulfilled") {
          toast.error("Failed to add product. Try again.");
          return;
        }
      }

      navigate("/checkout");
    } catch (error) {
      console.error("Buy Now Error:", error);
      toast.error("Error while adding to cart.");
    } finally {
      setIsBuyingNow(false);
      setIsBuyNowDisabled(false);
    }
  };

  useEffect(() => {
    const validateUserCoupon = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token || !couponCode.trim()) {
          setFinalPrice(null);
          return;
        }

        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/validate-coupon`,
          { couponCode },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.valid && selectedProduct) {
          const discount = data.discount || 0;
          const discounted =
            selectedProduct.discountPrice -
            selectedProduct.discountPrice * (discount / 100);
          setFinalPrice(Math.round(discounted));
          toast.success("Coupon applied successfully!");
        } else {
          setFinalPrice(null);
          toast.error("Invalid or expired coupon");
        }
      } catch (err) {
        console.error("Coupon validation error:", err);
        toast.error("Failed to validate coupon");
        setFinalPrice(null);
      }
    };

    validateUserCoupon();
  }, [couponCode, selectedProduct]);

  const handleImageClick = (imgUrl) => {
    setModalImage(imgUrl);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === "Escape") handleCloseModal();
    };
    document.addEventListener("keydown", escHandler);
    return () => document.removeEventListener("keydown", escHandler);
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setIsButtonDisabled(selectedProduct.countInStock === 0);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (productFetchId) {
      dispatch(fetchProductDetails(productFetchId));
      dispatch(fetchSimilarProducts(productFetchId));

      setSelectedColor("");
      setSelectedSize("");
    }
  }, [dispatch, productFetchId]);

  useEffect(() => {
    if (selectedProduct?.images?.length > 0) {
      setMainImage(selectedProduct.images[0].url);
    }
  }, [selectedProduct]);

  const sortedReviews = useMemo(() => {
    if (sortOption === "highest") {
      return [...reviews].sort((a, b) => b.rating - a.rating);
    } else if (sortOption === "lowest") {
      return [...reviews].sort((a, b) => a.rating - b.rating);
    } else {
      return [...reviews].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
  }, [sortOption, reviews]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/reviews/product/${productFetchId}`
        );
        const data = await res.json();
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };

    if (productFetchId) {
      fetchReviews();
    }
  }, [productFetchId]);

  const handleQuantityChange = (action) => {
    if (action === "plus") {
      setQuantity((prev) => prev + 1);
    }
    if (action === "minus" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const checkDeliveryAvailability = async (pincode) => {
    setIsCheckingDelivery(true);

    const isValidPincode = /^\d{6}$/.test(pincode);

    if (!isValidPincode) {
      setDeliveryInfo({
        isDeliverable: false,
        message: "Please enter a valid 6-digit pincode",
      });
      setIsCheckingDelivery(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();

      if (data[0].Status === "Error") {
        setDeliveryInfo({
          isDeliverable: false,
          message: "Invalid pincode. Please check and try again.",
        });
        setIsCheckingDelivery(false);
        return;
      }

      const location = data[0].PostOffice[0];
      const district = location.District;
      const state = location.State;

      const warehouseLocation = {
        lat: 22.5726,
        lon: 88.3639,
      };

      const locationCoordinates = await getLocationCoordinates(district, state);

      if (!locationCoordinates) {
        setDeliveryInfo({
          isDeliverable: false,
          message:
            "Unable to verify delivery location. Please contact support.",
        });
        setIsCheckingDelivery(false);
        return;
      }

      const distance = calculateDistance(
        warehouseLocation.lat,
        warehouseLocation.lon,
        locationCoordinates.lat,
        locationCoordinates.lon
      );

      const isDeliverable = distance <= 22717;

      const currentDate = new Date();
      const deliveryDate = new Date(currentDate);
      deliveryDate.setDate(
        currentDate.getDate() +
        (isDeliverable ? Math.floor(Math.random() * 5) + 2 : 0)
      );

      setDeliveryInfo({
        isDeliverable,
        message: isDeliverable
          ? `Delivery available -  (${distance.toFixed(1)}km away)`
          : `Not deliverable - beyond 80km radius (${distance.toFixed(
            1
          )}km away)`,
        deliveryDate: isDeliverable
          ? deliveryDate.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          : null,
        deliveryDays: isDeliverable
          ? Math.ceil((deliveryDate - currentDate) / (1000 * 60 * 60 * 24))
          : null,
        location: `${district}, ${state}`,
      });
    } catch (error) {
      console.error("Error checking delivery:", error);
      setDeliveryInfo({
        isDeliverable: false,
        message: "Error checking delivery availability. Please try again.",
      });
    } finally {
      setIsCheckingDelivery(false);
    }
  };

  const getLocationCoordinates = async (district, state) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          district
        )},${encodeURIComponent(state)},India&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting coordinates:", error);
      return null;
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const handleDeliveryCheck = () => {
    if (pincode.trim()) {
      checkDeliveryAvailability(pincode.trim());
    } else {
      toast.error("Please enter a pincode", { duration: 1500 });
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color before adding to cart.", {
        duration: 1500,
      });
      return;
    }

    const currentCartItems = JSON.parse(
      localStorage.getItem("persist:root")
    )?.cart;
    const totalProductsInCart = currentCartItems
      ? JSON.parse(currentCartItems)?.cartItems?.reduce(
        (acc, item) => acc + item.quantity,
        0
      )
      : 0;

    if (totalProductsInCart + quantity > 10) {
      toast.error("You can buy up to 10 items", { duration: 2000 });
      return;
    }

    setIsButtonDisabled(true);
    setIsAddingToCart(true);
    dispatch(
      addToCart({
        productId: productFetchId,
        quantity,
        size: selectedSize,
        color: selectedColor,
        guestId,
        userId: user?._id,
      })
    )
      .then(() => {
        toast.success("Product added to cart!!", { duration: 3000 });
        flyToCart(mainImage, imgRef.current, cartIconRef);
      })
      .finally(() => {
        setIsButtonDisabled(false);
        setIsAddingToCart(false);
      });
  };

  useEffect(() => {
    const fetchCollab = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/collabs`
        );
        if (data && data.length > 0) {
          setFeaturedCollab(data[0]);
        }
      } catch (err) {
        console.error("Failed to load featured collab", err);
      }
    };

    fetchCollab();
  }, []);

  if (loading) return <ProductDetailsSkeleton />;

  if (error) return <p>Error: {error}</p>;

  const calculateOriginalPrice = () => {
    if (selectedProduct.discountPrice && selectedProduct.offerPercentage > 0) {
      return Math.floor(
        (selectedProduct.discountPrice * 100) /
        (100 - selectedProduct.offerPercentage)
      );
    }
    return selectedProduct.discountPrice || selectedProduct.price;
  };

  const formatReviewDate = (isoDate) => {
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return new Date(isoDate).toLocaleDateString("en-IN", options);
  };
  const totalReviews = reviews.length || 1;
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return {
      star,
      count,
      percentage: Math.round((count / totalReviews) * 100),
    };
  });
  const totalQuantity =
    cart?.products?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const maxLimitReached = totalQuantity >= 10;

  const handleShare = async () => {
    try {
      const productUrl = window.location.href;

      if (navigator.share) {
        await navigator.share({
          title: selectedProduct?.name,
          text: "Check out this product!",
          url: productUrl,
        });
      } else {
        await navigator.clipboard.writeText(productUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className="min-h-screen py-8 md:py-10 px-3 md:px-4">
      {selectedProduct && (
        <div className="max-w-6xl mx-auto space-y-8">
          {/* MAIN CARD: Hybrid Amazon + Flipkart layout */}
          <div className="rounded-2xl border border-white/60 shadow-[0_10px_50px_-15px_rgba(16,24,40,0.15)] bg-white/80 backdrop-blur-md p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* LEFT: IMAGE GALLERY + SPECIFICATIONS (desktop) */}
              <div className="lg:col-span-5 lg:border-r lg:border-gray-100 lg:pr-6">
                <div className="flex gap-4">
                  {/* Left Thumbs (desktop) */}
                  <div className="hidden md:flex flex-col space-y-3">
                    {selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={image.altText || `Thumb ${index}`}
                        className={`w-16 h-16 rounded-xl cursor-pointer border transition-all duration-300 ${mainImage === image.url
                          ? "border-sky-600 shadow-md scale-[1.03]"
                          : "border-gray-200 hover:border-sky-400"
                          }`}
                        onClick={() => setMainImage(image.url)}
                      />
                    ))}
                  </div>

                  {/* Main Image */}
                  <div className="flex-1">
                    {mainImage ? (
                      <div
                        className="relative w-full h-[380px] md:h-[480px] lg:h-[520px] bg-white rounded-2xl border border-gray-200 overflow-hidden"
                        onMouseEnter={handleZoomEnter}
                        onMouseLeave={handleZoomLeave}
                        onMouseMove={handleZoomMove}
                        onTouchStart={() => setZoom((s) => ({ ...s, active: true }))}
                        onTouchEnd={handleZoomLeave}
                        onTouchMove={handleZoomTouchMove}
                      >
                        <img
                          ref={imgRef}
                          src={mainImage}
                          alt="Main Product"
                          onClick={() => handleImageClick(mainImage)}
                          className="w-full h-full object-contain cursor-zoom-in"
                          style={{
                            transform: zoom.active ? "scale(2)" : "scale(1)",
                            transformOrigin: `${zoom.x}% ${zoom.y}%`,
                            transition: "transform 120ms ease-out",
                            willChange: "transform",
                          }}
                        />

                        {/* Wishlist button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            isInWishlist(selectedProduct._id)
                              ? handleRemoveFromWishlist(selectedProduct._id)
                              : handleAddToWishlist(selectedProduct);
                          }}
                          title={
                            isInWishlist(selectedProduct._id)
                              ? "Remove from Wishlist"
                              : "Add to Wishlist"
                          }
                          className={`absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full p-2 shadow-md transition duration-300 ease-in-out hover:scale-110 ${isInWishlist(selectedProduct._id)
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-white text-gray-800 hover:bg-pink-100"
                            }`}
                        >
                          {isInWishlist(selectedProduct._id) ? (
                            <AiFillHeart className="text-2xl animate-pulse" />
                          ) : (
                            <AiOutlineHeart className="text-2xl" />
                          )}
                        </button>

                        {/* Share button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareOpen(true);
                          }}
                          title="Share Product"
                          className="absolute top-4 right-16 z-10 w-11 h-11 flex items-center justify-center rounded-full p-2 shadow-md bg-white text-gray-800 hover:bg-sky-100 transition duration-300 ease-in-out hover:scale-110"
                        >
                          <FiShare2 className="text-2xl" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-[300px] flex items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                        No image available
                      </div>
                    )}

                    {/* Hint below image */}
                    <div className="mt-3 flex justify-center">
                      <div className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-sm border border-white/20 cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-md">
                        <span>
                          <BsSearch />
                        </span>
                        <span>Click image to view full size</span>
                      </div>
                    </div>

                    {/* Mobile Thumbnails */}
                    <div className="flex md:hidden mt-4 space-x-3 overflow-x-auto no-scrollbar">
                      {selectedProduct.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={image.altText || `Thumb ${index}`}
                          className={`w-20 h-20 rounded-xl cursor-pointer border transition-all duration-300 ${mainImage === image.url
                            ? "border-sky-600 shadow-md scale-105"
                            : "border-gray-300 hover:border-sky-400"
                            }`}
                          onClick={() => setMainImage(image.url)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Specifications (desktop) */}
                <div className="mt-6 hidden md:block">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    Specifications
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm text-gray-800">
                      <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-600">
                        <tr>
                          <th className="px-4 py-3">Attribute</th>
                          <th className="px-4 py-3">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium">Brand</td>
                          <td className="px-4 py-3">{selectedProduct.brand}</td>
                        </tr>
                        <tr className="bg-gray-50 hover:bg-gray-100 transition">
                          <td className="px-4 py-3 font-medium">Material</td>
                          <td className="px-4 py-3">
                            {selectedProduct.material}
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium">Gender</td>
                          <td className="px-4 py-3">{selectedProduct.gender}</td>
                        </tr>
                        {selectedProduct.dimensions && (
                          <tr className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 font-medium">
                              Dimensions
                            </td>
                            <td className="px-4 py-3">
                              {selectedProduct.dimensions.length || 0} x{" "}
                              {selectedProduct.dimensions.width || 0} x{" "}
                              {selectedProduct.dimensions.height || 0} cm
                            </td>
                          </tr>
                        )}
                        {selectedProduct.weight && (
                          <tr className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 font-medium">Weight</td>
                            <td className="px-4 py-3">
                              {selectedProduct.weight} gm
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* MIDDLE: PRODUCT INFO (title, rating, colors, sizes, description) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="mb-2 flex items-center flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs">
                    <BsPatchCheckFill /> Verified
                  </span>
                  {selectedProduct?.offerPercentage ? (
                    <span className="inline-flex items-center gap-1 text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full text-xs">
                      {selectedProduct.offerPercentage}% off
                    </span>
                  ) : null}
                  {selectedProduct?.skuCode && (
                    <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full text-xs">
                      SKU: {selectedProduct.skuCode}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {selectedProduct.name}
                </h1>

                {/* Ratings */}
                {selectedProduct.rating > 0 &&
                  selectedProduct.numReviews > 0 && (
                    <div className="mt-2 flex items-center gap-3 text-sm">
                      <span className="bg-green-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                        {selectedProduct.rating.toFixed(1)} ★
                      </span>
                      <span className="text-gray-600">
                        {selectedProduct.numReviews} review
                        {selectedProduct.numReviews === 1 ? "" : "s"}
                      </span>
                    </div>
                  )}

                {/* Short description */}
                {selectedProduct.description && (
                  <p className="mt-4 text-gray-700 leading-relaxed text-sm md:text-base">
                    {selectedProduct.description}
                  </p>
                )}

                {/* Color selection */}
                <div className="mt-6">
                  <p className="font-medium text-gray-800 mb-2 text-sm">
                    Color
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {selectedProduct.colors.map((color) => (
                      <button
                        onClick={() =>
                          setSelectedColor((prev) =>
                            prev === color ? null : color
                          )
                        }
                        key={color}
                        className={`w-10 h-10 rounded-full border transition-all duration-300 ${selectedColor === color
                          ? "border-4 border-sky-600 scale-110"
                          : "border-gray-300 hover:border-gray-500"
                          }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                  {selectedColor && (
                    <p className="mt-1 text-xs text-sky-700">
                      Selected: <span className="font-medium">{selectedColor}</span>
                    </p>
                  )}
                </div>

                {/* Sizes */}
                <div className="mt-6">
                  <p className="font-medium text-gray-800 mb-2 text-sm">
                    Size
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        onClick={() =>
                          setSelectedSize((prev) =>
                            prev === size ? null : size
                          )
                        }
                        key={size}
                        className={`px-4 py-2 rounded-full border transition-all font-medium text-sm ${selectedSize === size
                          ? "bg-sky-600 text-white shadow"
                          : "border-gray-300 hover:bg-sky-50"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <p className="mt-1 text-xs text-sky-700">
                      Selected: <span className="font-medium">{selectedSize}</span>
                    </p>
                  )}
                </div>

                {/* Specifications (mobile-only, after info) */}
                <div className="mt-6 md:hidden">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    Specifications
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm text-gray-800">
                      <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-600">
                        <tr>
                          <th className="px-4 py-3">Attribute</th>
                          <th className="px-4 py-3">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium">Brand</td>
                          <td className="px-4 py-3">{selectedProduct.brand}</td>
                        </tr>
                        <tr className="bg-gray-50 hover:bg-gray-100 transition">
                          <td className="px-4 py-3 font-medium">Material</td>
                          <td className="px-4 py-3">
                            {selectedProduct.material}
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium">Gender</td>
                          <td className="px-4 py-3">{selectedProduct.gender}</td>
                        </tr>
                        {selectedProduct.dimensions && (
                          <tr className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 font-medium">
                              Dimensions
                            </td>
                            <td className="px-4 py-3">
                              {selectedProduct.dimensions.length || 0} x{" "}
                              {selectedProduct.dimensions.width || 0} x{" "}
                              {selectedProduct.dimensions.height || 0} cm
                            </td>
                          </tr>
                        )}
                        {selectedProduct.weight && (
                          <tr className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 font-medium">Weight</td>
                            <td className="px-4 py-3">
                              {selectedProduct.weight} gm
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* RIGHT: BUY BOX (sticky like Amazon) */}
              <div className="lg:col-span-3">
                <div className="lg:sticky lg:top-24 space-y-4">
                  {/* Price block */}
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 shadow-sm">
                    {selectedProduct.discountPrice &&
                      selectedProduct.offerPercentage ? (
                      <>
                        <div className="flex items-end gap-3">
                          <div className="text-3xl md:text-4xl font-semibold text-sky-700 tracking-tight">
                            ₹{Math.floor(selectedProduct.discountPrice)}
                          </div>
                          <div className="text-gray-500 line-through text-lg md:text-xl">
                            ₹{Math.floor(selectedProduct.price)}
                          </div>
                        </div>
                        <div className="text-green-600 font-semibold mt-1 text-sm">
                          {selectedProduct.offerPercentage}% OFF
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-end gap-3">
                          <div className="text-3xl md:text-4xl font-semibold text-sky-700 tracking-tight">
                            ₹{Math.floor(selectedProduct.price)}
                          </div>
                          {selectedProduct.discountPrice && (
                            <div className="text-gray-500 line-through text-lg md:text-xl">
                              ₹
                              {Math.floor(
                                (selectedProduct.price * 100) /
                                (100 - selectedProduct.discountPrice)
                              )}
                            </div>
                          )}
                        </div>
                        {selectedProduct.discountPrice && (
                          <div className="text-green-600 font-semibold mt-1 text-sm">
                            {selectedProduct.discountPrice}% OFF
                          </div>
                        )}
                      </>
                    )}

                    <p className="mt-3 text-xs text-gray-600">
                      Inclusive of all taxes • Secure payment via trusted
                      gateways
                    </p>
                  </div>

                  {/* Stock status */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <p className="font-medium text-gray-800 mb-1 text-sm">
                      Availability
                    </p>
                    {selectedProduct.countInStock === 0 ? (
                      <span className="font-semibold text-base text-red-600">
                        Out of Stock
                      </span>
                    ) : selectedProduct.countInStock < 10 ? (
                      <>
                        <span className="font-semibold text-base text-red-600">
                          Hurry! Only {selectedProduct.countInStock} item
                          {selectedProduct.countInStock === 1 ? "" : "s"} left
                        </span>
                        <p className="text-xs text-red-500 mt-1 animate-pulse">
                          Almost gone! Order soon.
                        </p>
                      </>
                    ) : (
                      <span className="font-semibold text-base text-emerald-600">
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* Quantity + CTAs */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
                    {/* Quantity */}
                    <div>
                      <p className="font-medium text-gray-800 mb-2 text-sm text-center">
                        Quantity
                      </p>
                      <div className="flex justify-center">
                        <div className="inline-flex items-center gap-4 rounded-full bg-gray-100 p-2">
                          <button
                            onClick={() => handleQuantityChange("minus")}
                            disabled={quantity <= 1}
                            className={`w-9 h-9 flex justify-center items-center rounded-full text-lg bg-white border ${quantity <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                              }`}
                          >
                            −
                          </button>
                          <span className="text-lg min-w-[24px] text-center">{quantity}</span>
                          <button
                            onClick={() => handleQuantityChange("plus")}
                            disabled={quantity >= 10}
                            className={`w-9 h-9 flex justify-center items-center rounded-full text-lg bg-white border ${quantity >= 10 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                              }`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {quantity >= 10 && (
                        <p className="text-xs text-red-600 mt-1">
                          You can buy up to 10 items only.
                        </p>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={isButtonDisabled || quantity >= 10}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition text-sm md:text-base ${isButtonDisabled
                          ? "bg-sky-300 text-white cursor-not-allowed"
                          : "bg-sky-600 text-white hover:bg-sky-700"
                          }`}
                      >
                        <FaCartShopping className="text-lg" />
                        {isAddingToCart ? "Adding..." : "Add to Bag"}
                      </button>

                      {/* Buy Now logic kept, still optional */}
                      {/* <button
                        onClick={handleBuyNow}
                        disabled={isBuyNowDisabled || totalQuantity >= 10}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition text-sm md:text-base ${
                          isBuyNowDisabled
                            ? "bg-emerald-400 text-white cursor-not-allowed"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        <FiZap
                          className={`text-lg ${
                            isBuyingNow ? "animate-pulse" : ""
                          }`}
                        />
                        {isBuyingNow ? "Processing..." : "Buy Now"}
                      </button> */}
                    </div>
                  </div>

                  {/* Pincode Delivery Check */}
                  <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚚</span>
                      <p className="font-medium text-gray-800 text-sm">
                        Check Delivery Availability
                      </p>
                    </div>

                    <div className="flex flex-col md:flex-col gap-3">
                      <input
                        type="text"
                        placeholder="Enter pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
                        maxLength={6}
                      />
                      <button
                        onClick={handleDeliveryCheck}
                        disabled={isCheckingDelivery}
                        className="px-6 py-2 rounded-lg font-medium text-white bg-sky-600 hover:bg-sky-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                      >
                        {isCheckingDelivery ? "Checking..." : "Check"}
                      </button>
                    </div>

                    {deliveryInfo && (
                      <div
                        className={`p-3 rounded-xl text-sm ${deliveryInfo.isDeliverable
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                          : "bg-red-50 border border-red-200 text-red-700"
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {deliveryInfo.message}
                          </span>
                        </div>

                        {deliveryInfo.isDeliverable &&
                          deliveryInfo.deliveryDate && (
                            <div className="space-y-0.5">
                              <p>
                                <strong>Location:</strong>{" "}
                                {deliveryInfo.location}
                              </p>
                              <p>
                                <strong>Estimated Delivery:</strong>{" "}
                                {deliveryInfo.deliveryDate}
                              </p>
                              <p>
                                <strong>Delivery Time:</strong>{" "}
                                {deliveryInfo.deliveryDays} days from today
                              </p>
                            </div>
                          )}

                        {!deliveryInfo.isDeliverable &&
                          deliveryInfo.location && (
                            <div>
                              <p>
                                <strong>Location:</strong>{" "}
                                {deliveryInfo.location}
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REVIEWS & RATING BREAKDOWN + SIMILAR PRODUCTS */}
          <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm px-4 md:px-6 lg:px-8 pb-10 pt-6">
            <div className="mt-2 mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Rating Summary */}
              {(() => {
                const LABELS = {
                  5: "Excellent",
                  4: "Very Good",
                  3: "Good",
                  2: "Average",
                  1: "Poor",
                };
                const BAR_COLOR = (star) =>
                  star >= 4
                    ? "bg-emerald-500"
                    : star === 3
                      ? "bg-amber-400"
                      : star === 2
                        ? "bg-orange-400"
                        : "bg-red-500";

                const byStar = (star) =>
                  ratingCounts.find((r) => r.star === star)?.count || 0;

                const totalRatings =
                  selectedProduct?.numRatings ??
                  ratingCounts.reduce((sum, r) => sum + (r.count || 0), 0);

                const avg = selectedProduct?.rating || 0;
                const totalReviews = selectedProduct?.numReviews || 0;

                return (
                  <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm self-start">
                    <h3 className="text-lg font-semibold text-sky-800 mb-4">
                      Rating Breakdown
                    </h3>

                    <div className="grid grid-cols-12 gap-6 items-start">
                      {/* Left: Average rating block */}
                      <div className="col-span-12 sm:col-span-4">
                        <div className="flex items-center gap-2">
                          <span className="text-4xl font-bold text-emerald-600">
                            {avg.toFixed(1)}
                          </span>
                          <span className="text-emerald-600 text-2xl leading-none">
                            ★
                          </span>
                        </div>

                        <div className="mt-3 text-sm text-slate-500 space-y-0.5">
                          <div className="leading-none">
                            <span className="font-medium">{totalRatings}</span>{" "}
                            Ratings,
                          </div>
                          <div className="leading-none">
                            <span className="font-medium">{totalReviews}</span>{" "}
                            Reviews
                          </div>
                        </div>
                      </div>

                      {/* Right: Bars */}
                      <div className="col-span-12 sm:col-span-8 space-y-4">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = byStar(star);
                          const pct = totalRatings
                            ? (count / totalRatings) * 100
                            : 0;

                          return (
                            <div key={star} className="space-y-1">
                              <div className="flex items-center justify-between text-sm text-slate-600">
                                <span className="min-w-24">
                                  {LABELS[star]}
                                </span>
                                <span className="font-semibold tabular-nums">
                                  {count}
                                </span>
                              </div>

                              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${BAR_COLOR(
                                    star
                                  )} rounded-full transition-all duration-500`}
                                  style={{ width: `${pct}%` }}
                                  aria-label={`${LABELS[star]}: ${count} (${pct.toFixed(
                                    0
                                  )}%)`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Reviews */}
              <div className="lg:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    Customer Reviews
                  </h2>
                  <div>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    >
                      <option value="newest">Newest First</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                    </select>
                  </div>
                </div>

                {sortedReviews.length > 0 ? (
                  <>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                      {(showAllReviews
                        ? sortedReviews
                        : sortedReviews.slice(0, 3)
                      ).map((review, index) => (
                        <div
                          key={index}
                          className="p-4 md:p-5 border-b last:border-b-0 border-gray-100"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-lg ring-1 ring-sky-200">
                                {review.user?.name?.charAt(0).toUpperCase() ||
                                  "U"}
                              </div>
                              <div>
                                <h4 className="text-base md:text-lg font-semibold text-gray-900">
                                  {review.user?.name || "Anonymous"}
                                </h4>
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  <span
                                    className={`text-white px-2 rounded text-xs md:text-sm ${review.rating >= 4
                                      ? "bg-emerald-500"
                                      : review.rating === 3
                                        ? "bg-amber-400"
                                        : review.rating === 2
                                          ? "bg-orange-400"
                                          : "bg-red-500"
                                      }`}
                                  >
                                    {review.rating}.0 ★
                                  </span>

                                  <GoDotFill
                                    size={10}
                                    className="text-gray-600 hidden sm:block"
                                  />
                                  <span className="text-[11px] md:text-xs text-gray-500">
                                    <span className="text-black/70">
                                      Posted on:{" "}
                                    </span>
                                    <span>
                                      {new Date(
                                        review.createdAt
                                      ).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 text-sm md:text-base">
                            {review.comment}
                          </p>

                          {/* Display Image if available */}
                          {review.image && review.image.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {review.image.map((imgUrl, idx) => (
                                <img
                                  key={idx}
                                  src={imgUrl}
                                  alt={`Review image ${idx + 1}`}
                                  onClick={() => handleImageClick(imgUrl)}
                                  className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover cursor-zoom-in"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {sortedReviews.length > 3 && (
                      <div className="text-center mt-6">
                        <button
                          onClick={() => setShowAllReviews((v) => !v)}
                          className="px-4 py-2 text-sm font-semibold text-sky-700 border border-sky-400 rounded-lg hover:bg-sky-50 transition"
                        >
                          {showAllReviews ? "Show Less" : "View More Reviews"}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-sky-50 border border-sky-100 text-center p-8 rounded-2xl text-gray-500">
                    <p>No reviews yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && !featuredCollab?.isPublished && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  More Products You Might Love
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                  {similarProducts.slice(0, displayCount).map((product) => (
                    <div
                      key={product._id}
                      onClick={() =>
                        navigate(
                          `/product/${product.name
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`
                        )
                      }
                      className="cursor-pointer rounded-xl border border-gray-200 hover:shadow-lg transition bg-white overflow-hidden"
                    >
                      <img
                        src={product.images?.[0]?.url || "/no-image.png"}
                        alt={product.name}
                        className="w-full h-52 md:h-60 object-cover"
                      />
                      <div className="px-3 pt-2 pb-3">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                            ★ {product.rating?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {product.numReviews || 0} Reviews
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-base font-bold text-sky-700">
                            ₹{Math.floor(
                              product.discountPrice || product.price
                            )}
                          </p>
                          {product.discountPrice && (
                            <p className="text-xs line-through text-gray-500">
                              ₹{product.price}
                            </p>
                          )}
                          <p className="text-sm text-green-600">
                            {product.offerPercentage
                              ? product.offerPercentage + "%"
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {similarProducts.length > displayCount && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setDisplayCount((prev) => prev + 4)}
                      className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition text-sm"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShareOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Share this Product
            </h2>

            <div className="grid grid-cols-3 gap-4 text-center">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
                  className="w-10 h-10"
                />
                <span className="text-sm mt-1">WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                  className="w-10 h-10"
                />
                <span className="text-sm mt-1">Facebook</span>
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                  className="w-10 h-10"
                />
                <span className="text-sm mt-1">Instagram</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png"
                  className="w-10 h-10"
                />
                <span className="text-sm mt-1">Telegram</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
                  className="w-10 h-10"
                />
                <span className="text-sm mt-1">Twitter</span>
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  toast.success("Link Copied!");
                  setTimeout(() => setCopied(false), 1000);
                }}
                className="flex flex-col items-center transition"
              >
                <FiCopy
                  className={`w-10 h-10 transition-all duration-300 ${copied
                    ? "text-green-600 scale-110"
                    : "text-gray-800"
                    }`}
                />
                <span className="text-sm mt-1">
                  {copied ? "Copied!" : "Copy link"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="w-full h-full max-w-5xl max-h-screen relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl font-bold z-50"
            >
              ✕
            </button>
            <div className="w-full h-full flex items-center justify-center overflow-hidden touch-pinch-zoom">
              <img
                src={modalImage}
                alt="Zoomed Product"
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{ touchAction: "pan-x pan-y", userSelect: "none" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductDetailsSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-8 md:p-12 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="hidden md:flex flex-col space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} width={80} height={80} circle />
          ))}
        </div>

        <div className="md:w-1/2 w-full">
          <Skeleton height={400} className="rounded-3xl" />
          <div className="flex md:hidden mt-4 space-x-4 overflow-x-auto scrollbar-hide">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} width={80} height={80} circle />
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <Skeleton height={20} width={150} />
            <Skeleton height={80} />
          </div>
        </div>

        <div className="md:w-1/2 space-y-4">
          <Skeleton height={40} width={`80%`} />
          <Skeleton height={20} width={`60%`} />
          <Skeleton height={30} width={`30%`} />
          <Skeleton height={60} />
          <Skeleton height={20} width={`40%`} />
          <Skeleton count={3} height={20} />
          <Skeleton height={45} width={`100%`} className="rounded-full" />
        </div>
      </div>

      <div className="mt-20">
        <Skeleton height={30} width={200} className="mx-auto mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height={250} className="rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;