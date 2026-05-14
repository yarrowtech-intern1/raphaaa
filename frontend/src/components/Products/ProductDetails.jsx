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
//         flyToCart(effectiveMainImage, imgRef.current, cartIconRef); // ✅ Correct image used
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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState([]);

  const cart = useSelector((state) => state.cart);

  // ── Derived variant data (supports both new colorVariants and legacy variants) ──
  const hasColorVariants =
    Array.isArray(selectedProduct?.colorVariants) && selectedProduct.colorVariants.length > 0;
  const hasLegacyVariants =
    !hasColorVariants &&
    Array.isArray(selectedProduct?.variants) && selectedProduct.variants.length > 0;

  // All unique colors the user can pick
  const effectiveColors = hasColorVariants
    ? [...new Set(selectedProduct.colorVariants.map((cv) => cv.color).filter(Boolean))]
    : hasLegacyVariants
    ? [...new Set(selectedProduct.variants.map((v) => v.color).filter(Boolean))]
    : selectedProduct?.colors || [];

  // The colorVariant object for the currently selected color
  const activeColorVariant = hasColorVariants && selectedColor
    ? selectedProduct.colorVariants.find(
        (cv) => String(cv.color || "").toLowerCase() === String(selectedColor || "").toLowerCase()
      )
    : null;

  // Images to show: switch to selected color's images when available
  const displayImages = activeColorVariant?.images?.length
    ? activeColorVariant.images
    : selectedProduct?.images || [];

  // Effective main image: if stored mainImage isn't in current color's set, auto-show first
  const effectiveMainImage =
    displayImages.length > 0
      ? (displayImages.some((img) => img.url === mainImage)
          ? mainImage
          : displayImages[0].url)
      : mainImage;

  // Sizes available for the selected color (or all sizes for legacy)
  const effectiveSizes = hasColorVariants
    ? activeColorVariant
      ? activeColorVariant.sizes.map((s) => s.size).filter(Boolean)
      : []
    : hasLegacyVariants
    ? [...new Set(
        selectedProduct.variants
          .filter((v) => !selectedColor || String(v.color || "").toLowerCase() === String(selectedColor || "").toLowerCase())
          .map((v) => v.size)
          .filter(Boolean)
      )]
    : selectedProduct?.sizes || [];

  // Stock for a given size in the selected color
  const getSizeStock = (size) => {
    if (hasColorVariants && activeColorVariant) {
      const sz = activeColorVariant.sizes.find(
        (s) => String(s.size || "").toLowerCase() === String(size || "").toLowerCase()
      );
      return Number(sz?.countInStock || 0);
    }
    if (hasLegacyVariants) {
      const v = selectedProduct.variants.find(
        (v) =>
          String(v.color || "").toLowerCase() === String(selectedColor || "").toLowerCase() &&
          String(v.size  || "").toLowerCase() === String(size  || "").toLowerCase()
      );
      return Number(v?.countInStock || 0);
    }
    return Number(selectedProduct?.countInStock || 0);
  };

  // Matched variant for SKU / stock of the exact color+size combo
  const matchedColorSizeEntry = (() => {
    if (hasColorVariants && activeColorVariant && selectedSize) {
      return activeColorVariant.sizes.find(
        (s) => String(s.size || "").toLowerCase() === String(selectedSize || "").toLowerCase()
      ) || null;
    }
    if (hasLegacyVariants && selectedColor && selectedSize) {
      return selectedProduct.variants.find(
        (v) =>
          String(v.color || "").toLowerCase() === String(selectedColor || "").toLowerCase() &&
          String(v.size  || "").toLowerCase() === String(selectedSize  || "").toLowerCase()
      ) || null;
    }
    return null;
  })();

  const matchedVariantBySku =
    hasLegacyVariants && sku
      ? selectedProduct.variants.find((v) => String(v?.sku || "") === String(sku))
      : null;

  const overallStock = Number(selectedProduct?.countInStock || 0);
  const selectedVariantStock = matchedColorSizeEntry
    ? Number(matchedColorSizeEntry.countInStock || 0)
    : matchedVariantBySku
    ? Number(matchedVariantBySku.countInStock || 0)
    : overallStock;

  const isOutOfStock = overallStock <= 0 || (selectedSize ? selectedVariantStock <= 0 : false);

  const selectedVariantSku =
    matchedColorSizeEntry?.sku ||
    matchedVariantBySku?.sku ||
    selectedProduct?.skuCode ||
    selectedProduct?.sku;

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
        setCatalogProducts(Array.isArray(data) ? data : []);

        const toSlug = (name = "") =>
          name.toLowerCase().trim().replace(/\s+/g, "-");

        let matchedProduct = null;
        if (sku) {
          matchedProduct = data.find((p) => {
            // match product-level sku
            if (String(p.skuCode || p.sku || p._id) === String(sku)) return true;
            // match colorVariants sizes sku
            if (Array.isArray(p.colorVariants)) {
              for (const cv of p.colorVariants) {
                if (Array.isArray(cv.sizes) && cv.sizes.some((s) => String(s?.sku || "") === String(sku)))
                  return true;
              }
            }
            // match legacy variants sku
            if (Array.isArray(p.variants) && p.variants.some((v) => String(v?.sku || "") === String(sku)))
              return true;
            return false;
          });
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

  const resolvedSimilarProducts = useMemo(() => {
    if (Array.isArray(similarProducts) && similarProducts.length > 0) {
      return similarProducts;
    }

    if (!selectedProduct || !Array.isArray(catalogProducts)) return [];

    return catalogProducts
      .filter(
        (p) =>
          p?._id !== selectedProduct?._id &&
          String(p?.category || "").toLowerCase() ===
            String(selectedProduct?.category || "").toLowerCase()
      )
      .slice(0, 12);
  }, [similarProducts, selectedProduct, catalogProducts]);

  const handleBuyNow = async () => {
    if (isOutOfStock) {
      toast.error("This product is out of stock.");
      return;
    }

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
            sku: selectedVariantSku,
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
      setIsButtonDisabled(isOutOfStock);
    }
  }, [selectedProduct, isOutOfStock]);

  useEffect(() => {
    if (productFetchId) {
      dispatch(fetchProductDetails(productFetchId));
      dispatch(fetchSimilarProducts(productFetchId));

      setSelectedColor("");
      setSelectedSize("");
      setMainImage("");  // reset so the initialization effect can set the correct initial image
    }
  }, [dispatch, productFetchId]);

  // Set initial main image from product (or first colorVariant) — only when no image is displayed yet
  useEffect(() => {
    if (!selectedProduct) return;
    const firstImg =
      selectedProduct.colorVariants?.[0]?.images?.[0]?.url ||
      selectedProduct.images?.[0]?.url ||
      "";
    // Only reset when there is no image yet (avoids overriding the user's gallery selection on background re-fetches)
    if (firstImg && !mainImage) setMainImage(firstImg);
    // Also auto-select the first color
    if (!selectedColor && Array.isArray(selectedProduct.colorVariants) && selectedProduct.colorVariants.length > 0) {
      setSelectedColor(selectedProduct.colorVariants[0].color || "");
    }
  }, [selectedProduct]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep main image in sync whenever the selected color changes
  useEffect(() => {
    if (!selectedColor || !selectedProduct) return;
    if (hasColorVariants) {
      // colorVariant products: show the first image of the selected color variant
      const cv = selectedProduct.colorVariants.find(
        (c) => String(c.color || "").toLowerCase() === String(selectedColor || "").toLowerCase()
      );
      const img = cv?.images?.[0]?.url;
      if (img) setMainImage(img);
    } else {
      // Legacy / colors-array products: use position-based mapping (color index → image index)
      const colorIdx = (selectedProduct.colors || []).indexOf(selectedColor);
      const posImg =
        (colorIdx >= 0 && selectedProduct.images?.[colorIdx]?.url) ||
        selectedProduct.images?.[0]?.url;
      if (posImg) setMainImage(posImg);
    }
  }, [selectedColor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-select color/size based on URL sku param or default to first variant
  useEffect(() => {
    if (!selectedProduct) return;

    if (hasColorVariants) {
      if (sku) {
        for (const cv of selectedProduct.colorVariants) {
          const sz = cv.sizes.find((s) => String(s.sku || "") === String(sku));
          if (sz) {
            setSelectedColor(cv.color || "");
            setSelectedSize(sz.size || "");
            return;
          }
        }
      }
      if (!selectedColor && selectedProduct.colorVariants[0]?.color) {
        setSelectedColor(selectedProduct.colorVariants[0].color);
      }
      if (!selectedSize && selectedProduct.colorVariants[0]?.sizes?.[0]?.size) {
        setSelectedSize(selectedProduct.colorVariants[0].sizes[0].size);
      }
      return;
    }

    if (hasLegacyVariants) {
      if (sku) {
        const m = selectedProduct.variants.find((v) => String(v?.sku || "") === String(sku));
        if (m) {
          setSelectedColor(m.color || "");
          setSelectedSize(m.size || "");
          return;
        }
      }
      if (!selectedColor && selectedProduct.variants[0]?.color)
        setSelectedColor(selectedProduct.variants[0].color);
      if (!selectedSize && selectedProduct.variants[0]?.size)
        setSelectedSize(selectedProduct.variants[0].size);
    }
  }, [selectedProduct, hasColorVariants, hasLegacyVariants, sku]);

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

  useEffect(() => {
    setShowFullDescription(false);
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
        `${import.meta.env.VITE_BACKEND_URL}/api/products/delivery/check?pincode=${encodeURIComponent(
          pincode
        )}&cod=0`
      );
      const data = await response.json();
      if (!response.ok || !data?.success) {
        setDeliveryInfo({
          isDeliverable: false,
          message: data?.message || "Unable to check delivery now.",
        });
        return;
      }
      setDeliveryInfo({
        isDeliverable: Boolean(data.isDeliverable),
        message: data.message || "Delivery check completed",
        deliveryDate: data.deliveryDate || null,
        deliveryDays: data.deliveryDays ?? null,
        location: data.location || null,
        courierName: data.courierName || null,
        courierCount: data.courierCount || 0,
        codAvailable: Boolean(data.codAvailable),
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

  const handleDeliveryCheck = () => {
    if (pincode.trim()) {
      checkDeliveryAvailability(pincode.trim());
    } else {
      toast.error("Please enter a pincode", { duration: 1500 });
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("This product is out of stock.", { duration: 1500 });
      return;
    }

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
        sku: selectedVariantSku,
        guestId,
        userId: user?._id,
      })
    )
      .then(() => {
        toast.success("Product added to cart!!", { duration: 3000 });
        flyToCart(effectiveMainImage, imgRef.current, cartIconRef);
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
    <div className="min-h-screen pb-12">
      {selectedProduct && (
        <>
          {/* Breadcrumb */}
          <div className="bg-linear-to-r from-sky-200 to-sky-100 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-2.5 text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
              <span onClick={() => navigate("/")} className="hover:text-sky-600 cursor-pointer transition">Home</span>
              <span>/</span>
              {selectedProduct.category && (
                <>
                  <span onClick={() => navigate(`/collections/${selectedProduct.category.toLowerCase()}`)} className="hover:text-sky-600 cursor-pointer capitalize transition">{selectedProduct.category}</span>
                  <span>/</span>
                </>
              )}
              <span className="text-gray-800 font-medium truncate max-w-[200px]">{selectedProduct.name}</span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-3 md:px-4 pt-4 space-y-3">
          {/* Product Card */}
          {/* Product Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* LEFT: Image Gallery */}
              <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-gray-100 p-4 lg:p-6">
                <div className="lg:sticky lg:top-20">
                  <div className="flex gap-3">
                    {/* Thumbnails (desktop) */}
                    <div className="hidden md:flex flex-col gap-2 flex-shrink-0">
                      {displayImages.map((img, i) => (
                        <img
                          key={i}
                          src={img.url}
                          alt={img.altText || `View ${i + 1}`}
                          onClick={() => setMainImage(img.url)}
                          className={`w-[60px] h-[60px] object-cover rounded border-2 cursor-pointer transition-all ${
                            effectiveMainImage === img.url
                              ? "border-sky-500 shadow-sm"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Main image */}
                    <div className="flex-1 relative">
                      {selectedProduct.offerPercentage > 0 && (
                        <div className="absolute top-2 left-2 z-10 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-sm">
                          {selectedProduct.offerPercentage}% OFF
                        </div>
                      )}
                      {new Date() - new Date(selectedProduct.createdAt) < 2 * 24 * 60 * 60 * 1000 && (
                        <div className="absolute top-2 right-14 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm animate-pulse">
                          NEW
                        </div>
                      )}
                      <div
                        className="relative w-full aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden cursor-zoom-in"
                        onMouseEnter={handleZoomEnter}
                        onMouseLeave={handleZoomLeave}
                        onMouseMove={handleZoomMove}
                        onTouchStart={() => setZoom((s) => ({ ...s, active: true }))}
                        onTouchEnd={handleZoomLeave}
                        onTouchMove={handleZoomTouchMove}
                      >
                        <img
                          ref={imgRef}
                          src={effectiveMainImage || selectedProduct.images?.[0]?.url}
                          alt="Main Product"
                          onClick={() => handleImageClick(effectiveMainImage)}
                          className="w-full h-full object-contain"
                          style={{
                            transform: zoom.active ? "scale(2)" : "scale(1)",
                            transformOrigin: `${zoom.x}% ${zoom.y}%`,
                            transition: "transform 120ms ease-out",
                            willChange: "transform",
                          }}
                        />
                      </div>
                      {/* Action buttons */}
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            isInWishlist(selectedProduct._id)
                              ? handleRemoveFromWishlist(selectedProduct._id)
                              : handleAddToWishlist(selectedProduct);
                          }}
                          className={`w-9 h-9 flex items-center justify-center rounded-full shadow bg-white transition hover:scale-110 ${
                            isInWishlist(selectedProduct._id) ? "text-red-500" : "text-gray-400 hover:text-red-400"
                          }`}
                        >
                          {isInWishlist(selectedProduct._id) ? (
                            <AiFillHeart className="text-lg" />
                          ) : (
                            <AiOutlineHeart className="text-lg" />
                          )}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShareOpen(true); }}
                          className="w-9 h-9 flex items-center justify-center rounded-full shadow bg-white text-gray-400 hover:text-sky-500 hover:scale-110 transition"
                        >
                          <FiShare2 className="text-base" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile thumbnails */}
                  <div className="flex md:hidden mt-3 gap-2 overflow-x-auto pb-1">
                    {displayImages.map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt={img.altText || `View ${i + 1}`}
                        onClick={() => setMainImage(img.url)}
                        className={`w-16 h-16 object-cover rounded border-2 cursor-pointer flex-shrink-0 transition ${
                          effectiveMainImage === img.url ? "border-sky-500" : "border-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="hidden md:flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
                    <BsSearch size={11} /> Hover to zoom · Click to enlarge
                  </p>
                </div>
              </div>

              {/* RIGHT: Product Info + Buy Box */}
              <div className="lg:col-span-7 p-4 lg:p-6 space-y-4">
                {/* Brand + Title */}
                <div>
                  {selectedProduct.brand && (
                    <p className="text-sky-700 font-bold text-xs uppercase tracking-widest mb-1">
                      {selectedProduct.brand}
                    </p>
                  )}
                  <h1 className="text-lg md:text-xl font-medium text-gray-900 leading-snug">
                    {selectedProduct.name}
                  </h1>
                </div>

                {/* Rating row */}
                {selectedProduct.rating > 0 && selectedProduct.numReviews > 0 && (
                  <div className="flex items-center gap-3 flex-wrap border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded">
                      {selectedProduct.rating.toFixed(1)} ★
                    </div>
                    <span className="text-gray-500 text-sm">
                      {selectedProduct.numReviews} Ratings &amp; Reviews
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-medium">
                      <BsPatchCheckFill /> Raphaaa Assured
                    </span>
                  </div>
                )}

                {/* Price Section */}
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl md:text-3xl font-bold text-gray-900">
                      ₹{Math.floor(
                        selectedProduct.discountPrice && selectedProduct.offerPercentage > 0
                          ? selectedProduct.discountPrice
                          : selectedProduct.price
                      )}
                    </span>
                    {selectedProduct.discountPrice && selectedProduct.offerPercentage > 0 && (
                      <>
                        <span className="text-base text-gray-400 line-through">
                          ₹{Math.floor(selectedProduct.price)}
                        </span>
                        <span className="text-pink-600 font-bold text-base">
                          {selectedProduct.offerPercentage}% off
                        </span>
                      </>
                    )}
                  </div>
                  {selectedProduct.discountPrice && selectedProduct.offerPercentage > 0 && (
                    <p className="text-green-600 text-sm font-medium">
                      You save ₹{Math.floor(selectedProduct.price - selectedProduct.discountPrice)}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">Inclusive of all taxes. Free delivery above ₹999.</p>
                  {finalPrice && (
                    <div className="mt-2 inline-flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg text-sm text-green-700">
                      <span className="font-bold">Coupon price: ₹{finalPrice}</span>
                      <span className="text-green-600 text-xs">Applied!</span>
                    </div>
                  )}
                </div>

                {/* Offers strip */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <p className="font-semibold text-gray-800 text-sm">Available Offers</p>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="text-green-600 mt-0.5 shrink-0">🏷️</span>
                      <p><span className="font-semibold text-gray-900">Free Delivery</span> on orders above ₹999</p>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="text-green-600 mt-0.5 shrink-0">🏷️</span>
                      <p><span className="font-semibold text-gray-900">Special Price</span> Get extra {selectedProduct.offerPercentage || 0}% off</p>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="text-green-600 mt-0.5 shrink-0">🏷️</span>
                      <p><span className="font-semibold text-gray-900">Easy Returns</span> 7 days hassle-free returns</p>
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                {effectiveColors.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      Color:{" "}
                      {selectedColor && (
                        <span className="font-normal text-gray-600 capitalize">
                          {hasColorVariants
                            ? (selectedProduct.colorVariants.find(
                                (cv) => cv.color.toLowerCase() === selectedColor.toLowerCase()
                              )?.colorName || selectedColor)
                            : selectedColor}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {effectiveColors.map((color) => {
                        const cvEntry = hasColorVariants
                          ? selectedProduct.colorVariants.find(
                              (cv) => cv.color.toLowerCase() === color.toLowerCase()
                            )
                          : null;
                        const thumb = cvEntry?.images?.[0]?.url;
                        const isActive = selectedColor.toLowerCase() === color.toLowerCase();
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedColor(color);
                              setSelectedSize("");
                              // Switch main image to this color's associated photo
                              const firstImg = cvEntry?.images?.[0]?.url;
                              if (firstImg) {
                                setMainImage(firstImg);
                              } else {
                                // Fallback: position-based image mapping for legacy/colors-only products
                                const colorIdx = effectiveColors.indexOf(color);
                                const posImg =
                                  (colorIdx >= 0 && selectedProduct?.images?.[colorIdx]?.url) ||
                                  selectedProduct?.images?.[0]?.url;
                                if (posImg) setMainImage(posImg);
                              }
                            }}
                            title={cvEntry?.colorName || color}
                            className={`relative transition-all duration-200 ${
                              thumb
                                ? `w-14 h-14 rounded-xl overflow-hidden border-2 ${
                                    isActive
                                      ? "border-sky-500 shadow-lg ring-2 ring-sky-200 scale-110"
                                      : "border-gray-200 hover:border-sky-300 hover:scale-105"
                                  }`
                                : `w-9 h-9 rounded-full border-2 ${
                                    isActive
                                      ? "border-sky-500 scale-110 shadow-md ring-2 ring-sky-100"
                                      : "border-gray-300 hover:border-gray-400 hover:scale-105"
                                  }`
                            }`}
                            style={!thumb ? { backgroundColor: color.toLowerCase() } : {}}
                          >
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={cvEntry?.colorName || color}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {effectiveSizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-800">
                        Size:{" "}
                        {selectedSize && <span className="font-normal text-gray-600">{selectedSize}</span>}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedProduct?.sizeChart?.imageUrl) {
                            setModalImage(selectedProduct.sizeChart.imageUrl);
                            setShowModal(true);
                          } else {
                            toast.error("Size chart not available for this product.");
                          }
                        }}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-800 border-b border-sky-400 transition"
                      >
                        Size Chart
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {effectiveSizes.map((size) => {
                        const sizeStock = getSizeStock(size);
                        const outOfStock = sizeStock <= 0;
                        return (
                        <button
                          key={size}
                          onClick={() => !outOfStock && setSelectedSize(size)}
                          disabled={outOfStock}
                          title={outOfStock ? "Out of stock" : size}
                          className={`min-w-[48px] h-10 px-3 text-sm font-medium rounded border transition-all relative ${
                            outOfStock
                              ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through"
                              : selectedSize === size
                              ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                              : "border-gray-300 text-gray-700 hover:border-sky-400 hover:text-sky-600"
                          }`}
                        >
                          {size}
                        </button>
                      ); })}
                    </div>
                    {matchedColorSizeEntry?.designName && (
                      <p className="text-xs text-gray-600 mt-2">
                        Design: <span className="font-medium">{matchedColorSizeEntry.designName}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Quantity + Stock */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">Qty:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange("minus")}
                        disabled={quantity <= 1}
                        className="w-9 h-9 flex items-center justify-center text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed border-r border-gray-300 transition text-lg font-medium"
                      >−</button>
                      <span className="w-10 text-center text-sm font-bold text-gray-800">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange("plus")}
                        disabled={quantity >= 10 || quantity >= selectedVariantStock || isOutOfStock}
                        className="w-9 h-9 flex items-center justify-center text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed border-l border-gray-300 transition text-lg font-medium"
                      >+</button>
                    </div>
                  </div>
                  <div>
                    {isOutOfStock ? (
                      <span className="text-red-600 font-semibold text-sm bg-red-50 px-2 py-1 rounded">Out of Stock</span>
                    ) : selectedVariantStock < 10 ? (
                      <span className="text-orange-600 font-semibold text-sm bg-orange-50 px-2 py-1 rounded">
                        Only {selectedVariantStock} left! Hurry
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold text-sm bg-green-50 px-2 py-1 rounded">In Stock</span>
                    )}
                  </div>
                </div>

                {/* CTA Buttons */}
                {!isOutOfStock ? (
                  <div className="flex gap-3 flex-col sm:flex-row">
                    <button
                      onClick={handleAddToCart}
                      disabled={isButtonDisabled}
                      className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-base transition-all active:scale-95 ${
                        isButtonDisabled
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200"
                      }`}
                    >
                      <FaCartShopping className="text-lg" />
                      {isAddingToCart ? "Adding..." : "Add to Bag"}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={isBuyNowDisabled || maxLimitReached}
                      className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-base transition-all active:scale-95 ${
                        isBuyNowDisabled || maxLimitReached
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-200"
                      }`}
                    >
                      <FiZap className={`text-lg ${isBuyingNow ? "animate-pulse" : ""}`} />
                      {isBuyingNow ? "Processing..." : "Buy Now"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    This product is currently out of stock.
                  </div>
                )}

                {/* Delivery Check */}
                <div className="border border-gray-200 rounded-xl p-3 space-y-2.5 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>🚚</span>
                    <span>Check Delivery</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      maxLength={6}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                    <button
                      onClick={handleDeliveryCheck}
                      disabled={isCheckingDelivery}
                      className="px-4 py-2 text-sm font-bold text-sky-700 border border-sky-500 rounded-lg hover:bg-sky-50 transition disabled:opacity-50"
                    >
                      {isCheckingDelivery ? "..." : "Check"}
                    </button>
                  </div>
                  {deliveryInfo && (
                    <div className={`p-2.5 rounded-lg text-sm ${
                      deliveryInfo.isDeliverable
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-red-50 border border-red-200 text-red-600"
                    }`}>
                      <p className="font-semibold">{deliveryInfo.message}</p>
                      {deliveryInfo.isDeliverable && deliveryInfo.deliveryDate && (
                        <p className="mt-0.5 text-xs">
                          Estimated: <strong>{deliveryInfo.deliveryDate}</strong> ({deliveryInfo.deliveryDays} days)
                        </p>
                      )}
                      {deliveryInfo.isDeliverable && deliveryInfo.courierName && (
                        <p className="mt-0.5 text-xs">
                          Courier: <strong>{deliveryInfo.courierName}</strong>
                          {deliveryInfo.courierCount > 1 ? ` +${deliveryInfo.courierCount - 1} more` : ""}
                        </p>
                      )}
                      {deliveryInfo.isDeliverable && (
                        <p className="mt-0.5 text-xs">
                          COD: <strong>{deliveryInfo.codAvailable ? "Available" : "Not available"}</strong>
                        </p>
                      )}
                      {deliveryInfo.location && (
                        <p className="mt-0.5 text-xs text-gray-500">{deliveryInfo.location}</p>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-1 border-t border-gray-200">
                    <span>✅ Free delivery above ₹999</span>
                    <span>🔄 7-day easy returns</span>
                    <span>🔒 Secure checkout</span>
                  </div>
                </div>

                {selectedVariantSku && (
                  <p className="text-xs text-gray-400">
                    SKU: <span className="font-mono">{selectedVariantSku}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Product Details + Specs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedProduct.description && (
                <div>
                  <h4 className="font-semibold text-gray-700 text-sm mb-2">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {(() => {
                      const description = String(selectedProduct.description || "");
                      const previewLength = 260;
                      const isLong = description.length > previewLength;
                      if (!isLong || showFullDescription) return description;
                      return `${description.slice(0, previewLength)}...`;
                    })()}
                  </p>
                  {String(selectedProduct.description || "").length > 260 && (
                    <button
                      type="button"
                      onClick={() => setShowFullDescription((prev) => !prev)}
                      className="mt-2 text-sm font-semibold text-sky-700 hover:text-sky-900"
                    >
                      {showFullDescription ? "See less" : "See more"}
                    </button>
                  )}
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-700 text-sm mb-2">Specifications</h4>
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <tbody>
                    {[
                      ["Brand", selectedProduct.brand],
                      ["Material", selectedProduct.material],
                      ["Gender", selectedProduct.gender],
                      selectedProduct.dimensions && [
                        "Dimensions",
                        `${selectedProduct.dimensions.length || 0} x ${selectedProduct.dimensions.width || 0} x ${selectedProduct.dimensions.height || 0} cm`,
                      ],
                      selectedProduct.weight && ["Weight", `${selectedProduct.weight} gm`],
                    ]
                      .filter(Boolean)
                      .map(([label, value], i) => (
                        <tr key={label} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="px-3 py-2.5 text-gray-500 font-medium w-[40%] border-r border-gray-200">{label}</td>
                          <td className="px-3 py-2.5 text-gray-800">{value}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Ratings & Reviews */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Ratings &amp; Reviews
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(() => {
                const LABELS = { 5: "Excellent", 4: "Very Good", 3: "Good", 2: "Average", 1: "Poor" };
                const BAR_COLOR = (star) =>
                  star >= 4 ? "bg-green-500" : star === 3 ? "bg-yellow-400" : star === 2 ? "bg-orange-400" : "bg-red-500";
                const totalRatings = selectedProduct?.numRatings ?? ratingCounts.reduce((sum, r) => sum + (r.count || 0), 0);
                const avg = selectedProduct?.rating || 0;
                const totalReviewCount = selectedProduct?.numReviews || 0;
                return (
                  <div className="bg-gray-50 rounded-xl p-4 self-start border border-gray-200">
                    <div className="mb-4">
                      <p className="text-4xl font-bold text-gray-900">{avg.toFixed(1)}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`text-lg ${s <= Math.round(avg) ? "text-green-500" : "text-gray-300"}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {totalRatings} Ratings · {totalReviewCount} Reviews
                      </p>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingCounts.find((r) => r.star === star)?.count || 0;
                        const pct = totalRatings ? (count / totalRatings) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="w-14 shrink-0">{LABELS[star]}</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${BAR_COLOR(star)} rounded-full transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-5 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-gray-700 text-sm">
                    {sortedReviews.length} Review{sortedReviews.length !== 1 ? "s" : ""}
                  </p>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  >
                    <option value="newest">Newest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                </div>
                {sortedReviews.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {(showAllReviews ? sortedReviews : sortedReviews.slice(0, 3)).map((review, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0">
                              {review.user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div>
                                  <p className="font-semibold text-gray-800 text-sm">
                                    {review.user?.name || "Anonymous"}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                                <span
                                  className={`text-white text-xs font-bold px-2 py-0.5 rounded ${
                                    review.rating >= 4
                                      ? "bg-green-600"
                                      : review.rating === 3
                                      ? "bg-yellow-500"
                                      : review.rating === 2
                                      ? "bg-orange-500"
                                      : "bg-red-500"
                                  }`}
                                >
                                  {review.rating} ★
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm mt-2 leading-relaxed">{review.comment}</p>
                              {review.image && review.image.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {review.image.map((imgUrl, idx) => (
                                    <img
                                      key={idx}
                                      src={imgUrl}
                                      alt={`Review ${idx + 1}`}
                                      onClick={() => handleImageClick(imgUrl)}
                                      className="w-16 h-16 rounded-lg object-cover cursor-zoom-in border border-gray-200 hover:border-sky-400 transition"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {sortedReviews.length > 3 && (
                      <div className="text-center mt-4">
                        <button
                          onClick={() => setShowAllReviews((v) => !v)}
                          className="px-5 py-2 text-sm font-semibold text-sky-700 border border-sky-400 rounded-lg hover:bg-sky-50 transition"
                        >
                          {showAllReviews ? "Show Less" : `View All ${sortedReviews.length} Reviews`}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-3xl mb-2">💬</p>
                    <p className="font-medium text-gray-500">No reviews yet</p>
                    <p className="text-sm mt-1">Be the first to review this product</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similar Products */}
          {resolvedSimilarProducts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Similar Products
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {resolvedSimilarProducts.slice(0, displayCount).map((product) => (
                  <div
                    key={product._id}
                    onClick={() =>
                      navigate(
                        `/product/${product.name.toLowerCase().replace(/\s+/g, "-")}/p/${encodeURIComponent(
                          product.skuCode || product.sku || product._id
                        )}`
                      )
                    }
                    className="cursor-pointer rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all overflow-hidden bg-white group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images?.[0]?.url || "/no-image.png"}
                        alt={product.name}
                        className="w-full h-44 md:h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.offerPercentage > 0 && (
                        <div className="absolute top-2 left-2 bg-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                          {product.offerPercentage}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      {product.brand && (
                        <p className="text-xs text-sky-700 font-semibold uppercase mb-0.5 truncate">
                          {product.brand}
                        </p>
                      )}
                      <h4 className="text-sm font-medium text-gray-800 truncate">{product.name}</h4>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            ★ {product.rating?.toFixed(1)}
                          </span>
                          <span className="text-gray-400 text-[10px]">({product.numReviews})</span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className="font-bold text-sm text-gray-900">
                          ₹{Math.floor(product.discountPrice || product.price)}
                        </span>
                        {product.discountPrice && product.discountPrice < product.price && (
                          <span className="text-xs line-through text-gray-400">
                            ₹{Math.floor(product.price)}
                          </span>
                        )}
                        {product.offerPercentage > 0 && (
                          <span className="text-pink-600 text-[10px] font-bold">
                            {product.offerPercentage}% off
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {resolvedSimilarProducts.length > displayCount && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setDisplayCount((prev) => prev + 4)}
                    className="px-5 py-2 text-sm font-semibold text-sky-700 border border-sky-400 rounded-lg hover:bg-sky-50 transition"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        </>
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
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl transition"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Share this Product</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 hover:opacity-80 transition"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" className="w-10 h-10" />
                <span className="text-xs text-gray-600">WhatsApp</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 hover:opacity-80 transition"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" className="w-10 h-10" />
                <span className="text-xs text-gray-600">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 hover:opacity-80 transition"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" className="w-10 h-10" />
                <span className="text-xs text-gray-600">Instagram</span>
              </a>
              <a
                href={`https://t.me/share/url?url=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 hover:opacity-80 transition"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" className="w-10 h-10" />
                <span className="text-xs text-gray-600">Telegram</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 hover:opacity-80 transition"
              >
                <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" className="w-10 h-10" />
                <span className="text-xs text-gray-600">Twitter</span>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  toast.success("Link Copied!");
                  setTimeout(() => setCopied(false), 1000);
                }}
                className="flex flex-col items-center gap-1 hover:opacity-80 transition"
              >
                <FiCopy
                  className={`w-10 h-10 p-1 transition-all duration-300 ${copied ? "text-green-600 scale-110" : "text-gray-700"}`}
                />
                <span className="text-xs text-gray-600">{copied ? "Copied!" : "Copy link"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="w-full h-full max-w-4xl max-h-screen relative flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-0 right-0 text-white hover:text-red-400 text-2xl font-bold z-50 bg-black/40 w-10 h-10 rounded-full flex items-center justify-center"
            >
              ×
            </button>
            <img
              src={modalImage}
              alt="Zoomed Product"
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{ touchAction: "pan-x pan-y", userSelect: "none" }}
            />
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
