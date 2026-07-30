import { InfoCircle } from "@boxicons/react";

interface ErrorFeedbackModalProps {
  title: string;
  subtitle: string;
  infoText: string;
  suggestionText: string;
  onClose: () => void;
}

export function ErrorFeedbackModal({
  title,
  subtitle,
  infoText,
  suggestionText,
  onClose
}: ErrorFeedbackModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-112.5 p-8 animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          {/* Icono circular rosa */}
          <div className="w-16 h-16 rounded-full bg-rose-200 flex items-center justify-center mb-6 shrink-0">
            <div className="w-8 h-8 flex items-center justify-center text-rose-600">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
          </div>

          {/* Título en rojo */}
          <h3 className="text-xl font-bold text-red-600 mb-1">
            {title}
          </h3>

          {/* Subtítulo */}
          <p className="text-md text-gray-900 mb-5">
            {subtitle}
          </p>

          {/* Sección de información */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6 text-left w-full">
            <div className="flex gap-3">
              <div className="shrink-0 pt-0.5">
                <InfoCircle className="w-5 h-5 text-red-600" strokeWidth={2} />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {infoText}
              </p>

            </div>
            <div className="gap-3 mt-4 text-left border-t border-gray-200 pt-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Sugerencia:
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {suggestionText}
              </p>
            </div>
          </div>

          {/* Sección de sugerencia */}
          <div className="text-left w-full mb-6">

          </div>

          {/* Botón de acción - Azul */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:ring-4 focus:ring-blue-100 outline-none"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}