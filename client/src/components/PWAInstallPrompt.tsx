import { X, Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useLanguage } from '@/contexts/LanguageContext';

export function PWAInstallPrompt() {
  const { isInstallable, promptInstall, dismissInstallPrompt } = usePWA();
  const { t } = useLanguage();

  if (!isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-slide-up">
      <button
        onClick={dismissInstallPrompt}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-[#003366] rounded-lg flex items-center justify-center">
          <Download className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {t('pwa.installTitle')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {t('pwa.installDescription')}
          </p>

          <div className="flex gap-2">
            <button
              onClick={promptInstall}
              className="flex-1 bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              {t('pwa.installButton')}
            </button>
            <button
              onClick={dismissInstallPrompt}
              className="px-4 py-2 rounded-lg font-medium transition-colors text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {t('common.notNow')}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            {t('pwa.benefit1')}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            {t('pwa.benefit2')}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            {t('pwa.benefit3')}
          </li>
        </ul>
      </div>
    </div>
  );
}
