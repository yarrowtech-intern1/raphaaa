import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const AutoLogout = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) return;

    // const AUTO_LOGOUT_TIME = 5000; // 5 seconds for testing
    const AUTO_LOGOUT_TIME = 40 * 60 * 60 * 1000; // 40 hours

    const timer = setTimeout(() => {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      dispatch(logout());
      setShowDialog(true); // Show custom alert
    }, AUTO_LOGOUT_TIME);

    return () => clearTimeout(timer);
  }, [user, token, dispatch]);

  const handleLoginAgain = () => {
    setShowDialog(false);
    // window.location.href = "/login";
    navigate("/login");
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  return (
    <>
      {showDialog && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-3">
              Session Expired
            </h2>
            <p className="text-sm text-gray-800 mb-6">
              Your session has expired. Please login again to continue.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleLoginAgain}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold hover:from-blue-600 hover:to-sky-600 transition duration-200"
              >
                Login Again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoLogout;
