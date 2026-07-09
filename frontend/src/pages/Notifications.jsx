import { useEffect, useState } from "react";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      const { data } = await axios.get(
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      setNotifications(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchNotifications();
    }, 0);
  }, []);

  const markRead = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      await axios.put(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      fetchNotifications();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">🔔 Notifications</h1>

      <div className="space-y-4">
        {notifications.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold">No Notifications</h2>

            <p className="text-gray-400 mt-2">You're all caught up.</p>
          </div>
        )}
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`p-5 rounded-2xl border ${
              notification.isRead
                ? "bg-white/5 border-white/10"
                : "bg-cyan-500/10 border-cyan-500/30"
            }`}
          >
            <h3 className="font-bold">{notification.title}</h3>

            <p className="text-gray-400 mt-2">{notification.message}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(notification.createdAt).toLocaleString()}
            </p>

            {!notification.isRead && (
              <button
                onClick={() => markRead(notification._id)}
                className="mt-4 bg-cyan-500 px-4 py-2 rounded-lg"
              >
                Mark Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
