import { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya fue instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Verificar en localStorage si el usuario rechazó la instalación
    const hasRejected = localStorage.getItem('pwa-install-rejected');
    const lastRejectionTime = localStorage.getItem('pwa-install-rejected-time');
    
    if (hasRejected && lastRejectionTime) {
      const daysSinceRejection = (Date.now() - parseInt(lastRejectionTime)) / (1000 * 60 * 60 * 24);
      // Mostrar nuevamente después de 7 días
      if (daysSinceRejection < 7) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar el prompt después de 2 segundos de la primera visita
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-shown');
      if (!hasSeenPrompt) {
        setTimeout(() => {
          setShowPrompt(true);
          localStorage.setItem('pwa-install-prompt-shown', 'true');
        }, 2000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-rejected');
      localStorage.removeItem('pwa-install-rejected-time');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error('Error al instalar PWA:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-rejected', 'true');
    localStorage.setItem('pwa-install-rejected-time', Date.now().toString());
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <AlertDialog open={showPrompt} onOpenChange={setShowPrompt}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <AlertDialogTitle>Instala MaslaConnect</AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription className="space-y-2">
          <p>
            Instala MaslaConnect en tu dispositivo para acceder más rápidamente y usarlo sin conexión.
          </p>
          <ul className="text-sm list-disc list-inside text-muted-foreground space-y-1">
            <li>Acceso rápido desde tu pantalla de inicio</li>
            <li>Funciona sin conexión a internet</li>
            <li>Experiencia similar a una aplicación nativa</li>
          </ul>
        </AlertDialogDescription>
        <div className="flex gap-2 justify-end pt-2">
          <AlertDialogCancel onClick={handleDismiss}>
            Ahora no
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleInstall} className="bg-primary text-primary-foreground">
            Instalar
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
