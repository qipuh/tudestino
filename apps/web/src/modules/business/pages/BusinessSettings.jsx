import BusinessLayout from '../components/BusinessLayout';

function BusinessSettings() {
  return (
    <BusinessLayout activeMenu="settings">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuración del Negocio</h2>
        <p className="text-gray-600 mb-4">
          Ajusta la configuración avanzada de tu negocio
        </p>
        <p className="text-sm text-gray-500">Próximamente disponible</p>
      </div>
    </BusinessLayout>
  );
}

export default BusinessSettings;
