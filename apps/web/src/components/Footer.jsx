function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Asistencia</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:underline">Centro de ayuda</a></li>
              <li><a href="#" className="hover:underline">Opciones de cancelación</a></li>
              <li><a href="#" className="hover:underline">Soporte COVID-19</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Comunidad</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:underline">Blog</a></li>
              <li><a href="#" className="hover:underline">Foro</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Ser anfitrión</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:underline">Aloja tu espacio</a></li>
              <li><a href="#" className="hover:underline">Recursos para anfitriones</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">TuDestino</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:underline">Acerca de</a></li>
              <li><a href="#" className="hover:underline">Términos</a></li>
              <li><a href="#" className="hover:underline">Privacidad</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-600 text-center">
          <p>&copy; {new Date().getFullYear()} TuDestino. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
