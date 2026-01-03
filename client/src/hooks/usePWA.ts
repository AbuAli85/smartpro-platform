import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  promptInstall: () => Promise<void>;
  dismissInstallPrompt: (permanent?: boolean) => void;
}

export function usePWA(): PWAState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if running in standalone mode (installed as PWA)
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  useEffect(() => {
    // Check if already installed
    if (isStandalone) {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No install prompt available');
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] User choice:', outcome);

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }

      // Clear the prompt
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
    }
  };

  const dismissInstallPrompt = (permanent = false) => {
    setIsInstallable(false);
    setDeferredPrompt(null);
    // Store dismissal in localStorage
    if (permanent) {
      localStorage.setItem('pwa-install-dismissed-permanent', 'true');
    } else {
      // Temporary dismissal for current session only
      sessionStorage.setItem('pwa-install-dismissed-session', 'true');
    }
  };

  // Check if user previously dismissed the prompt
  useEffect(() => {
    // Check for permanent dismissal
    const permanentDismiss = localStorage.getItem('pwa-install-dismissed-permanent');
    if (permanentDismiss === 'true') {
      setIsInstallable(false);
      return;
    }

    // Check for session dismissal
    const sessionDismiss = sessionStorage.getItem('pwa-install-dismissed-session');
    if (sessionDismiss === 'true') {
      setIsInstallable(false);
      return;
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    promptInstall,
    dismissInstallPrompt,
  };
}
