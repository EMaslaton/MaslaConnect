import { useNotificationStore } from '@/store/notificationStore';
import { Resend } from 'resend';

// Inicializar Resend con la API key desde variables de entorno
let resend: Resend | null = null;
if (import.meta.env.VITE_RESEND_API_KEY) {
  resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
} else {
  console.warn('⚠️ VITE_RESEND_API_KEY not found in environment variables. Email notifications will be disabled.');
}

export interface NotificationOptions {
  title: string;
  message: string;
  type?: 'message' | 'contact' | 'success' | 'error' | 'info';
  userId?: string;
  data?: Record<string, any>;
}

export class NotificationManager {
  /**
   * Enviar notificación in-app (toast)
   */
  static sendInAppNotification(options: NotificationOptions) {
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      title: options.title,
      message: options.message,
      type: options.type || 'info',
    });
  }

  /**
   * Enviar notificación push del navegador
   */
  static async sendPushNotification(
    title: string,
    options?: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: Record<string, any>;
    }
  ) {
    // Verificar soporte de Web Push API
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Web Push API no está soportada en este navegador');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Verificar si ya hay permisos
      if (Notification.permission === 'granted') {
        registration.showNotification(title, {
          icon: '/maslaconnect-icon.png',
          badge: '/maslaconnect-badge.png',
          ...options,
        });
      }
    } catch (error) {
      console.error('Error al enviar push notification:', error);
    }
  }

  /**
   * Enviar notificación por email
   */
  static async sendEmailNotification(
    toEmail: string,
    subject: string,
    htmlContent: string
  ) {
    if (!resend) {
      console.warn('⚠️ Resend API key not configured. Email notification skipped.');
      return false;
    }

    try {
      const response = await resend.emails.send({
        from: 'MaslaConnect <noreply@maslaconnect.com>',
        to: toEmail,
        subject,
        html: htmlContent,
      });

      if (response.error) {
        console.error('Error al enviar email:', response.error);
        return false;
      }

      console.log(`Email enviado exitosamente: ${response.data?.id}`);
      return true;
    } catch (error) {
      console.error('Error en sendEmailNotification:', error);
      return false;
    }
  }

  /**
   * Enviar notificación de nuevo mensaje
   */
  static async notifyNewMessage(
    recipientEmail: string,
    recipientName: string,
    senderName: string,
    messagePreview: string,
    conversationId: string
  ) {
    // 1. In-app notification (si está en la app)
    this.sendInAppNotification({
      title: `Nuevo mensaje de ${senderName}`,
      message: messagePreview,
      type: 'message',
      data: { conversationId },
    });

    // 2. Push notification del navegador
    await this.sendPushNotification(`Nuevo mensaje de ${senderName}`, {
      body: messagePreview,
      icon: '/maslaconnect-icon.png',
      tag: `message-${conversationId}`,
      data: { conversationId },
    });

    // 3. Email notification
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; color: white; text-align: center;">
          <h2 style="margin: 0;">Nuevo mensaje en MaslaConnect</h2>
        </div>
        <div style="padding: 20px; background: #f9f9f9; border-radius: 8px; margin-top: 20px;">
          <p>¡Hola ${recipientName}!</p>
          <p><strong>${senderName}</strong> te ha enviado un nuevo mensaje:</p>
          <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333;">"${messagePreview}"</p>
          </div>
          <p style="text-align: center; margin-top: 20px;">
            <a href="${import.meta.env.VITE_APP_URL}/messages" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver conversación
            </a>
          </p>
        </div>
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
          <p>© 2026 MaslaConnect - Plataforma de servicios freelance</p>
        </div>
      </div>
    `;

    await this.sendEmailNotification(recipientEmail, `Nuevo mensaje de ${senderName}`, htmlContent);
  }

  /**
   * Solicitar permiso para Push Notifications
   */
  static async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notificaciones no están soportadas en este navegador');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Registrar Service Worker para Push Notifications
   */
  static async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registrado correctamente');
        return true;
      } catch (error) {
        console.error('Error registrando Service Worker:', error);
        return false;
      }
    }
    return false;
  }
}
