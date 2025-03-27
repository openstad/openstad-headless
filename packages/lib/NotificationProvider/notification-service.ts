class NotificationService {
  private static instance: NotificationService;
  private listeners: ((message: string, type: "success" | "error") => void)[] = [];

  private constructor() {}

  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  addNotification(message: string, type: "success" | "error") {
    this.listeners.forEach((listener) => listener(message, type));
  }

  registerListener(callback: (message: string, type: "success" | "error") => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }
}

export default NotificationService.getInstance();
