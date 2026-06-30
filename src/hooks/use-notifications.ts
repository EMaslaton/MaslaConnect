import { NotificationManager } from '@/services/notificationService';
import { useEffect } from 'react';

/**
 * Hook para inicializar el sistema de notificaciones en la app
 * Registra el Service Worker y solicita permisos
 */
export const useNotifications = () => {
  useEffect(() => {
    const initializeNotifications = async () => {
      // 1. Registrar Service Worker
      const swRegistered = await NotificationManager.registerServiceWorker();
      
      if (swRegistered) {
        // 2. Solicitar permiso para Push Notifications
        const permission = await NotificationManager.requestPushPermission();
        
        if (permission) {
          console.log('✅ Push notifications habilitadas');
        } else {
          console.log('ℹ️ User rechazó push notifications');
        }
      }
    };

    // Ejecutar inicialización
    initializeNotifications();
  }, []);

  return {
    sendInAppNotification: NotificationManager.sendInAppNotification,
    sendPushNotification: NotificationManager.sendPushNotification,
    sendEmailNotification: NotificationManager.sendEmailNotification,
    notifyNewMessage: NotificationManager.notifyNewMessage,
  };
};
