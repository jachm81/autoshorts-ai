import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Laptop, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showInstallInfoModal, setShowInstallInfoModal] = useState(false);

  // If already running as an installed PWA in standalone window
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        App Instalada
      </span>
    );
  }

  // Chromium / Android / Desktop flow when prompt is ready
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        id="btn-pwa-install"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        title="Instalar aplicación en tu ordenador o móvil"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Instalar en iPhone / iPad</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600">1.</span>
                  <span>Toca el botón <strong>Compartir</strong> (ícono con flecha hacia arriba) en la barra inferior de Safari.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600">2.</span>
                  <span>Desplázate hacia abajo y selecciona <strong>"Añadir a la pantalla de inicio"</strong>.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600">3.</span>
                  <span>Pulsa <strong>Añadir</strong>. ¡Tendrás el icono de Herramientas SEO como una app nativa!</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback: Ambient instructions button (useful inside iFrames or preview where beforeinstallprompt doesn't fire natively)
  return (
    <>
      <button
        type="button"
        id="btn-pwa-info"
        onClick={() => setShowInstallInfoModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-all cursor-pointer"
        title="Opciones de instalación PWA y despliegue"
      >
        <Download className="w-3.5 h-3.5 text-emerald-600" />
        <span>Instalar App</span>
      </button>

      {showInstallInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Instalar Herramientas SEO</h3>
                  <p className="text-[11px] text-slate-500">Progressive Web App (PWA)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallInfoModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Esta aplicación está configurada como una <strong>PWA completa</strong> con soporte offline, manifest y service worker. Puedes instalarla en cualquier dispositivo:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Laptop className="w-3.5 h-3.5 text-emerald-600" />
                  <span>En Ordenador (Chrome / Edge / Brave):</span>
                </div>
                <p className="text-slate-600 text-[11px] pl-5">
                  Abre la aplicación en una pestaña directa y haz clic en el icono de <strong>"Instalar"</strong> situado a la derecha de la barra de direcciones de tu navegador, o en los 3 puntos &gt; <em>Instalar Herramientas SEO</em>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>En Teléfono Móvil (Android / iOS):</span>
                </div>
                <p className="text-slate-600 text-[11px] pl-5">
                  En Android: Menú (⋮) &gt; <em>Instalar aplicación</em> o <em>Añadir a pantalla principal</em>.<br />
                  En iPhone/iPad: Safari &gt; Compartir &gt; <em>Añadir a pantalla de inicio</em>.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Abrir en nueva pestaña
              </a>
              <button
                type="button"
                onClick={() => setShowInstallInfoModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
