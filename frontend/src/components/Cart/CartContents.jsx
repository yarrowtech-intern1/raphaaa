import React from "react";
import { RiDeleteBin3Line } from "react-icons/ri";
import { useDispatch } from "react-redux";
import {
  removeFromCart,
  updateCartItemQuantity,
} from "../../redux/slices/cartSlice";
import { FaTrash } from "react-icons/fa";

const CartContents = ({ cart, userId, guestId }) => {
  const dispatch = useDispatch();
  const totalCartQuantity = cart.products.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  // Handle adding or subtracting to cart
  const handleAddToCart = (productId, delta, quantity, size, color) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      dispatch(
        updateCartItemQuantity({
          productId,
          quantity: newQuantity,
          guestId,
          userId,
          size,
          color,
        })
      );
    }
  };

  const handleRemoveFromCart = (productId, size, color) => {
    dispatch(removeFromCart({ productId, guestId, userId, size, color }));
  };

  // const totalAmount = cart.products.reduce(
  //   (acc, item) => acc + item.price * item.quantity,
  //   0
  // );

  const totalAmount = cart.products.reduce(
    (acc, item) =>
      acc + ((item.discountPrice ?? item.price) * item.quantity),
    0
  );


  return (
    <div className="p-4 space-y-4">
      {cart.products.map((product, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-md p-4 flex flex-col sm:flex-row sm:items-start justify-between transition-all hover:shadow-lg"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-28 h-32 object-cover rounded-xl"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500">
                Size: {product.size} | Color: {product.color}
              </p>
              {/* <p className="text-sm text-gray-600 mt-1">
                Quantity: {product.quantity}
              </p>
              <p className="text-sm text-gray-700 font-semibold mt-1">
                Price: ₹{(product.price * product.quantity).toLocaleString("en-IN")}
              </p> */}

              <div className="flex items-center mt-3 space-x-3">
                <button
                  onClick={() =>
                    handleAddToCart(
                      product.productId,
                      -1,
                      product.quantity,
                      product.size,
                      product.color
                    )
                  }
                  className="bg-gray-200 text-gray-800 font-bold rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-300 transition"
                >
                  -
                </button>
                <span className="text-lg font-medium">{product.quantity}</span>
                <button
                  onClick={() => {
                    if (totalCartQuantity < 10) {
                      handleAddToCart(
                        product.productId,
                        1,
                        product.quantity,
                        product.size,
                        product.color
                      );
                    }
                  }}
                  disabled={totalCartQuantity >= 10}
                  className={`font-bold rounded-full w-8 h-8 flex items-center justify-center transition ${totalCartQuantity >= 10
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-800 text-white hover:bg-gray-900"
                    }`}
                >
                  +
                </button>
              </div>
              {totalCartQuantity >= 10 && (
                <p className="text-xs text-red-600 mt-1">
                  You can buy up to 10 items only.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 sm:mt-0 sm:ml-4">
            <button
              onClick={() =>
                handleRemoveFromCart(
                  product.productId,
                  product.size,
                  product.color
                )
              }
              className="text-red-500 hover:text-red-800 transition flex flex-wrap justify-center items-center gap-0.5"
            >
              <FaTrash size={18} className="inline" /> Remove
            </button>
          </div>
        </div>
      ))}


      {/* 🎟️ 50% Discount Coupon Section - Modern UI */}
      {cart.products.length > 0 && (
        <div className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-100 via-blue-50 to-indigo-100 border border-blue-200 shadow-lg p-6 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_#93C5FD,_transparent_70%)]"></div>

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
              🎉 Coupon Applied Successfully!
            </h2>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm px-4 py-1.5 rounded-full shadow-md font-semibold tracking-wide">
              COUPON50
            </span>
          </div>

          <div className="relative bg-white/70 backdrop-blur-sm rounded-xl shadow-inner p-4 border border-blue-100">
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Original Price:</span>
              <span className="font-semibold text-gray-900">
                ₹{(totalAmount / 0.5).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 mt-2">
              <span>Discount (50% OFF):</span>
              <span className="text-red-600 font-medium">
                -₹{(totalAmount / 0.5 - totalAmount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-green-700 font-bold text-lg border-t border-dashed border-green-300 mt-3 pt-3">
              <span>Final Price After Discount:</span>
              <span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* <div className="mt-4 flex justify-end">
            <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] transition-all">
              Proceed to Checkout
            </button>
          </div> */}
        </div>
      )}


      {/* ✅ Total Cart Summary Section */}
      {cart.products.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl shadow-inner">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Cart Summary
          </h2>
          <div className="flex justify-between text-gray-800 font-medium text-base">
            <span>Total Items:</span>
            <span>
              {cart.products.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <div className="flex justify-between text-gray-800 font-semibold text-lg mt-1">
            <span>Total Price:</span>
            <span>₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartContents;
