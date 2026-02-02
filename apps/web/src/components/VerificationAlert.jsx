import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

/**
 * Componente de alerta que se muestra cuando un usuario no verificado
 * intenta realizar una acción restringida (reservar, enviar mensajes, etc.)
 */
function VerificationAlert({ action = 'realizar esta acción' }) {
  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
      <div className="flex items-start">
        <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Verificación de identidad requerida
          </h3>
          <p className="text-yellow-800 mb-4">
            Para {action}, debes verificar tu identidad. Este proceso es rápido y solo lo haces una vez.
          </p>
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">¿Qué necesitas?</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Un documento de identidad válido (DNI, Pasaporte, Carné de Extranjería o Licencia de Conducir)</li>
              <li>• Una selfie sosteniendo tu documento</li>
              <li>• El proceso toma menos de 5 minutos</li>
            </ul>
          </div>
          <Link
            to="/verify-identity"
            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Verificar mi identidad ahora
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VerificationAlert;
