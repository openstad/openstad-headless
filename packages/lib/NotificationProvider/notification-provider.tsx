import React, { useState, useEffect } from "react";
import NotificationService from "./notification-service";
import "./style.css";

// Notificatie type
type NotificationType = "success" | "error";

// 📌 **NotificationToaster Component**
const NotificationProvider = () => {
  const [notifications, setNotifications] = useState<{ id: number; message: string; type: NotificationType; fadeOut: boolean }[]>([]);

  useEffect(() => {
    const unregister = NotificationService.registerListener((message, type) => {
      const id = Date.now();

      setNotifications((prev) => [...prev, { id, message, type, fadeOut: false }]);

      // 🔥 **Eerst fade-out toepassen, daarna verwijderen**
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, fadeOut: true } : n))
        );
      }, 4600); // Iets langer dan de standaard 5s (100ms overlap)

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000); // Na 5s definitief verwijderen
    });

    return () => unregister();
  }, []);

  return (
    <div className="notification-container">
      {notifications.map(({ id, message, type, fadeOut }) => (
        <div key={id} className={`notification ${fadeOut ? "fade-out" : ""}`}>
                <span className="notification-icon">
                        {type === "success" ? "✅️" : "❌"}
                    </span>
          <span className="notification-message">{message}</span>
        </div>
      ))}
    </div>
  );
};

export default NotificationProvider;