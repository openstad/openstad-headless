// 📌 notification-service.ts
class NotificationService {
  private static instance: NotificationService;
  private listeners: ((message: string, type: "success" | "error") => void)[] = [];

  private constructor() {} // Singleton: zorgt ervoor dat maar één instantie bestaat

  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ✅ Voeg een notificatie toe en trigger alle listeners
  addNotification(message: string, type: "success" | "error") {
    this.listeners.forEach((listener) => listener(message, type));
  }

  // ✅ Registreer een listener in `<NotificationToaster />`
  registerListener(callback: (message: string, type: "success" | "error") => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }
}

// Exporteer de singleton instance
export default NotificationService.getInstance();
