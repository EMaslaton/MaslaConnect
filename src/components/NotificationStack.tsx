import { useNotificationStore } from "@/store/notificationStore";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, Info, MessageSquare, X } from "lucide-react";

const iconMap = {
  message: <MessageSquare className="w-5 h-5" />,
  contact: <MessageSquare className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const colorMap = {
  message: "bg-blue-500/10 border-blue-500/20 text-blue-600",
  contact: "bg-purple-500/10 border-purple-500/20 text-purple-600",
  success: "bg-green-500/10 border-green-500/20 text-green-600",
  error: "bg-red-500/10 border-red-500/20 text-red-600",
  info: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600",
};

export const NotificationStack = () => {
  const { notifications, removeNotification, markAsRead } = useNotificationStore();

  return (
    <div className="fixed top-20 right-4 z-[100] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.slice(0, 5).map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, x: 400, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="mb-3 pointer-events-auto"
          >
            <div
              className={`${colorMap[notification.type]} border rounded-lg p-4 max-w-sm shadow-lg`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {iconMap[notification.type]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{notification.title}</h3>
                  <p className="text-xs opacity-90 mt-1">{notification.message}</p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
