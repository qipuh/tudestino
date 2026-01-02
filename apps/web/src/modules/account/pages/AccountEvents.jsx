import UserAccountLayout from '../../../layouts/UserAccountLayout';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

function AccountEvents() {
  return (
    <UserAccountLayout activeMenu="events">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Eventos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona los eventos que has creado y a los que asistirás
            </p>
          </div>
          <Link
            to="/events/create"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>Crear Evento</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button className="pb-3 px-1 border-b-2 border-primary text-primary font-medium">
              Eventos Creados
            </button>
            <button className="pb-3 px-1 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
              Asistencias
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-blue-600" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No has creado eventos aún
            </h3>
            <p className="text-gray-600 mb-6">
              Crea eventos para atraer viajeros y turistas a tus experiencias únicas
            </p>
            <Link
              to="/events/create"
              className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Crear Mi Primer Evento
            </Link>
          </div>
        </div>
      </div>
    </UserAccountLayout>
  );
}

export default AccountEvents;
