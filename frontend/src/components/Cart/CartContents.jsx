import React from "react";
import { useDispatch } from "react-redux";
import { removeFromCart, updateCartItemQuantity } from "../../redux/slices/cartSlice";
import { HiTrash } from "react-icons/hi2";

const CartContents = ({ cart, userId, guestId }) => {
  const dispatch = useDispatch();

  const totalQty = cart.products.reduce((acc, p) => acc + p.quantity, 0);

  const totalAmount = cart.products.reduce(
    (acc, p) => acc + ((p.discountPrice ?? p.price) * p.quantity),
    0
  );

  const originalAmount = cart.products.reduce(
    (acc, p) => acc + (p.price * p.quantity),
    0
  );

  const totalSavings = originalAmount - totalAmount;

  const handleQty = (productId, delta, quantity, size, color) => {
    const next = quantity + delta;
    if (next >= 1) {
      dispatch(updateCartItemQuantity({ productId, quantity: next, guestId, userId, size, color }));
    }
  };

  const handleRemove = (productId, size, color) => {
    dispatch(removeFromCart({ productId, guestId, userId, size, color }));
  };

  return (
    <div className="space-y-3">

      {/* ── Product rows ── */}
      {cart.products.map((product, index) => {
        const hasDiscount = product.discountPrice && product.discountPrice < product.price;
        const lineTotal   = (product.discountPrice ?? product.price) * product.quantity;

        return (
          <div
            key={index}
            className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-3.5 hover:border-sky-200 hover:shadow-sm transition-all group"
          >
            {/* Image */}
            <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                {product.name}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {product.size && (
                  <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    Size: {product.size}
                  </span>
                )}
                {product.color && (
                  <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {product.color}
                  </span>
                )}
              </div>

              {/* Price row */}
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-sm font-bold text-gray-900">
                  ₹{(product.discountPrice ?? product.price).toLocaleString("en-IN")}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Qty stepper */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQty(product.productId, -1, product.quantity, product.size, product.color)}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-base border-r border-gray-200 font-medium"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-gray-800">
                    {product.quantity}
                  </span>
                  <button
                    onClick={() => {
                      if (totalQty < 10)
                        handleQty(product.productId, 1, product.quantity, product.size, product.color);
                    }}
                    disabled={totalQty >= 10}
                    className={`w-7 h-7 flex items-center justify-center transition text-base border-l border-gray-200 font-medium
                      ${totalQty >= 10 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    +
                  </button>
                </div>
                {totalQty >= 10 && (
                  <p className="text-[10px] text-red-500 font-medium">Max 10 items</p>
                )}
              </div>
            </div>

            {/* Right: total + remove */}
            <div className="flex flex-col items-end justify-between h-24 shrink-0">
              <p className="text-sm font-bold text-gray-900">
                ₹{lineTotal.toLocaleString("en-IN")}
              </p>
              <button
                onClick={() => handleRemove(product.productId, product.size, product.color)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition"
                title="Remove from cart"
              >
                <HiTrash className="text-sm" />
              </button>
            </div>
          </div>
        );
      })}

      {/* ── Coupon badge (if applied) ── */}
      {cart.products.length > 0 && cart.couponApplied && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 text-lg">🎟️</span>
            <div>
              <p className="text-xs font-bold text-emerald-700">Coupon Applied!</p>
              <p className="text-[11px] text-emerald-600 font-mono">COUPON50</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            50% OFF
          </span>
        </div>
      )}

      {/* ── Cart Summary ── */}
      {cart.products.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-linear-to-r from-sky-50 to-blue-50">
            <p className="text-[11px] font-bold text-sky-700 uppercase tracking-widest">
              Order Summary
            </p>
          </div>

          <div className="px-4 py-4 space-y-2.5">
            {/* Items count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Items ({totalQty})</span>
              <span className="font-semibold text-gray-800">
                ₹{originalAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Discount row */}
            {totalSavings > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Product Discount</span>
                <span className="font-semibold text-emerald-600">
                  − ₹{totalSavings.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* Shipping */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span className="font-semibold text-emerald-600">Free</span>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200 pt-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Total Amount</span>
                <span className="text-lg font-extrabold text-sky-700">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              {totalSavings > 0 && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 text-right">
                  You save ₹{totalSavings.toLocaleString("en-IN")} 🎉
                </p>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50">
            {[
              { icon: "🔒", text: "Secure Checkout" },
              { icon: "🚚", text: "Free Delivery" },
              { icon: "↩", text: "Easy Returns" },
            ].map(({ icon, text }) => (
              <span key={text} className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                {icon} {text}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartContents;
