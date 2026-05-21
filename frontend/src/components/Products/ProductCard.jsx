import { Link } from "react-router-dom";
import { IoFlash } from "react-icons/io5";
import demoImg from "../../assets/login.jpg";

const ProductCard = ({ product, badge }) => {
  const imageUrl =
    product?.colorVariants?.[0]?.images?.[0]?.url ||
    product?.images?.[0]?.url ||
    (typeof product?.image === "string" ? product.image : null) ||
    demoImg;
  const imageAlt =
    product?.colorVariants?.[0]?.images?.[0]?.altText ||
    product?.images?.[0]?.altText ||
    product?.name ||
    "Product";

  return (
    <Link
      to={`/product/${String(product?.name || "")
        .toLowerCase()
        .replace(/\s+/g, "-")}/p/${encodeURIComponent(
        product?.skuCode || product?.sku || product?._id
      )}`}
      className="block group transition-transform transform hover:-translate-y-1"
    >
      <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-sky-200">
        <div className="w-full h-[220px] md:h-[300px] lg:h-[300px] mb-3 relative overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {new Date() - new Date(product.createdAt) <
            2 * 24 * 60 * 60 * 1000 && (
              <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-[10px] font-bold px-2 py-[2px] rounded-full shadow-md animate-bounce tracking-wide uppercase">
                New
              </div>
            )}

          <div className="absolute top-2 left-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-bold px-2 py-[2px] rounded-full shadow-md tracking-wide flex items-center gap-1">
            <IoFlash className="text-yellow-300 text-xs" />
            Raphaaa Assured
          </div>

          <div className="absolute bottom-2 right-2 bg-white text-blue-900 text-xs font-semibold px-2 py-1 rounded shadow-sm backdrop-blur-sm">
            {product.countInStock === 0 ? (
              <span className="text-red-600">Out of Stock</span>
            ) : product.countInStock < 10 ? (
              <span className="text-red-600">
                Hurry! Only {product.countInStock} left
              </span>
            ) : (
              <span className="text-green-600">In Stock</span>
            )}
          </div>
        </div>

        <div className="p-3">
          <h3 className="text-base font-semibold text-blue-900 mb-1 truncate">
            {product.name}
          </h3>

          {product.discountPrice && product.discountPrice > 0 ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-blue-700 font-bold text-2xl md:text-3xl tracking-wide">
                ₹ {Math.floor(product.discountPrice)}
              </p>
              <p className="text-sm text-gray-500 line-through">
                ₹ {Math.floor(product.price)}
              </p>
              <p className="text-green-600 text-md font-semibold">
                {product.offerPercentage ? `${product.offerPercentage}% OFF` : ""}
              </p>
            </div>
          ) : (
            <p className="text-blue-700 font-bold text-2xl tracking-wide">
              ₹ {Math.floor(product.price)}
            </p>
          )}


          {product.rating > 0 && product.numReviews > 0 && (
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-sm bg-green-600 p-[0.2px] rounded-xl text-white px-2">
                {product.rating} ★
              </span>
              <span className="text-xs text-gray-500 ml-1">
                {product.numReviews} Reviews
              </span>
            </div>
          )}

          {/* 🔥 Badge for sold count */}
          {badge && (
            <p className="text-xs mt-1 font-medium text-orange-600">{badge}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
