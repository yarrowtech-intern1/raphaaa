import { IoIosClose } from "react-icons/io";
import CartContents from "../Cart/CartContents";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CartDrawer = ({ drawerOpen, toggleCartDrawer }) => {
  const navigate = useNavigate();
  const { user, guestId } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const userId = user ? user._id : null;

  const handleCheckout = () => {
    toggleCartDrawer();
    if (!user) {
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <>
      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 bg-opacity-40 z-40"
          onClick={toggleCartDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 w-3/4 sm:w-1/2 md:w-[30rem] h-full bg-white backdrop-blur-md shadow-lg transform transition-transform duration-300 flex flex-col z-50 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()} // prevent clicks inside drawer from closing it
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={toggleCartDrawer}
            className="text-gray-600 hover:text-gray-800"
          >
            <IoIosClose className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Cart Contents */}
        <div className="flex-grow p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Cart Summery</h2>
          {cart && cart?.products?.length > 0 ? (
            <CartContents cart={cart} userId={userId} guestId={guestId} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-600 space-y-4">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
                alt="Empty Cart"
                className="w-32 h-32 mx-auto opacity-80"
              />
              <h3 className="text-lg font-semibold">Your cart is empty</h3>
              <p className="text-sm text-gray-500">
                Looks like you haven’t added anything yet.
              </p>
              <button
                onClick={() => {
                  toggleCartDrawer();
                  navigate("/collections/all");
                }}
                className="mt-2 px-5 py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 transition"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Checkout Button */}
        <div className="p-4 bg-white sticky bottom-0">
          {cart && cart?.products?.length > 0 && (
            <>
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700"
              >
               Proceed to Checkout
              </button>
              <p className="text-sm tracking-tighter text-gray-500 mt-2 text-center">
                Shipping, taxes and discount codes calculated at checkout.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};


export default CartDrawer;
