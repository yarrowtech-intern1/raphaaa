import { useEffect } from "react";

const DesktopNotificationButton = () => {
  useEffect(() => {
    // Ask permission when component mounts
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("🚀 New Drop Alert!", {
        body: "Check out the latest arrivals on Raphaaa!",
        icon: "/logo192.png", // optional icon path
      });
    } else {
      alert("Please allow notifications to receive alerts.");
    }
  };

  return (
    <button
      onClick={showNotification}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Show Push Notification
    </button>
  );
};

export default DesktopNotificationButton;
