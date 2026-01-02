import BusinessLayout from '../components/BusinessLayout';

function BusinessAnalytics() {
  return (
    <BusinessLayout activeMenu="analytics">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Estadísticas y Análisis</h2>
        <p className="text-gray-600 mb-4">
          Visualiza el rendimiento de tu negocio con gráficos y métricas detalladas
        </p>
        <p className="text-sm text-gray-500">Próximamente disponible</p>
      </div>
    </BusinessLayout>
  );
}

export default BusinessAnalytics;
