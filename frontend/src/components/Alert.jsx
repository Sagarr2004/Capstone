import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "sonner";
import { Bell, XCircle, ArrowLeft } from "lucide-react"; // Import icons from Lucide

const socket = io("http://localhost:8000", { transports: ["websocket"] });

const Alerts = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    // Fetch notifications from the backend
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get("http://localhost:8000/api/v1/job/getNotifications", {
          withCredentials: true,
        });
        setNotifications(data.notifications.map((n) => n.message));
      } catch (error) {
        console.error("Error fetching notifications:", error.response?.data?.message || error.message);
      }
    };

    fetchNotifications();

    // Listen for new job postings
    socket.on("newJobPosted", (data) => {
      setNotifications((prev) => [...prev, data.message]);
    });

    // Auto-delete notifications after 5 minutes (300,000 ms)
    const deleteTimeout = setTimeout(async () => {
      try {
        const res = await axios.delete("http://localhost:8000/api/v1/job/deleteNotifications", {
          withCredentials: true,
        });
        // Clear from frontend
        if (res.data.message) {
          setNotifications([]);
          toast.success(res.data.message);
          window.location.reload();
        }
      } catch (error) {
        console.error("Error deleting notifications:", error.response?.data?.message || error.message);
      }
    }, 10000); // Change to 10 * 60 * 1000 for 10 min

    return () => {
      socket.off("newJobPosted");
      socket.disconnect();
      clearTimeout(deleteTimeout);
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg rounded-xl border border-gray-300">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")} // Navigate back to home
        className="flex items-center gap-2 mb-4 text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg shadow-md transition duration-300"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </button>

      {/* Notifications */}
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        📢 Student Notifications
      </h2>
      {notifications.length === 0 ? (
        <p className="text-gray-100 text-center">No new notifications</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white border-l-4 border-blue-600 text-gray-800 rounded-lg shadow-md"
            >
              <div className="flex items-center gap-3">
                <Bell className="text-blue-600 w-5 h-5" /> {/* Notification Icon */}
                <span>{notif}</span>
              </div>
              <XCircle
                className="text-red-500 cursor-pointer w-5 h-5 hover:text-red-700"
                onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
