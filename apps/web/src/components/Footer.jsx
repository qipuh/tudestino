import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Asistencia</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/help" className="hover:underline">Centro de ayuda</Link></li>
              <li><Link to="/cancellation" className="hover:underline">Política de cancelación</Link></li>
              <li><Link to="/contact" className="hover:underline">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Comunidad</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/tudestino" className="hover:underline">Red social</Link></li>
              <li><Link to="/events" className="hover:underline">Eventos</Link></li>
              <li><Link to="/blog" className="hover:underline">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Para negocios</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/host" className="hover:underline">Publica tu negocio</Link></li>
              <li><Link to="/business-resources" className="hover:underline">Recursos para empresarios</Link></li>
              <li><Link to="/pricing" className="hover:underline">Precios y comisiones</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">TuDestino.pe</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/about" className="hover:underline">Acerca de</Link></li>
              <li><Link to="/terms" className="hover:underline">Términos y condiciones</Link></li>
              <li><Link to="/privacy" className="hover:underline">Política de privacidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-600 text-center">
          <p>&copy; {new Date().getFullYear()} TuDestino.pe - Plataforma de turismo en Perú. Todos los derechos reservados.</p>
          <p>tudestino.pe es un producto de Adaptika S.A.C.S</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
