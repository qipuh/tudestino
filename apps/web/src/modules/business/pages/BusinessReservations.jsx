import BusinessLayout from '../components/BusinessLayout';

function BusinessReservations() {
  return (
    <BusinessLayout activeMenu="reservations">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Reservas</h2>
        <p className="text-gray-600 mb-4">
          Aquí podrás ver y gestionar todas las reservas de tu negocio
        </p>
        <p className="text-sm text-gray-500">Próximamente disponible</p>
      </div>
    </BusinessLayout>
  );
}

export default BusinessReservations;
