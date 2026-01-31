import { useState } from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    {
      id: 'help',
      title: 'Asistencia',
      links: [
        { to: '/help', label: 'Centro de ayuda' },
        { to: '/cancellation', label: 'Política de cancelación' },
        { to: '/contact', label: 'Contacto' },
      ]
    },
    {
      id: 'community',
      title: 'Comunidad',
      links: [
        { to: '/tudestino', label: 'Red social' },
        { to: '/events', label: 'Eventos' },
        { to: '/blog', label: 'Blog' },
      ]
    },
    {
      id: 'business',
      title: 'Para negocios',
      links: [
        { to: '/host', label: 'Publica tu negocio' },
        { to: '/business-resources', label: 'Recursos' },
        { to: '/pricing', label: 'Precios' },
      ]
    },
    {
      id: 'about',
      title: 'TuDestino.pe',
      links: [
        { to: '/about', label: 'Acerca de' },
        { to: '/terms', label: 'Términos' },
        { to: '/privacy', label: 'Privacidad' },
      ]
    }
  ];

  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop - Grid normal */}
        <div className="hidden md:grid md:grid-cols-4 gap-6">
          {sections.map(section => (
            <div key={section.id}>
              <h3 className="font-semibold mb-3 text-sm">{section.title}</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                {section.links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="hover:underline hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile - Collapsible */}
        <div className="md:hidden space-y-3">
          {sections.map(section => (
            <div key={section.id} className="border-b border-gray-200 pb-3">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="font-semibold text-sm">{section.title}</h3>
                <ion-icon
                  name={expandedSections[section.id] ? 'chevron-up-outline' : 'chevron-down-outline'}
                  className="text-lg"
                ></ion-icon>
              </button>
              {expandedSections[section.id] && (
                <ul className="mt-3 space-y-2 text-xs text-gray-600">
                  {section.links.map(link => (
                    <li key={link.to}>
                      <Link to={link.to} className="hover:underline hover:text-primary">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Copyright - Compacto */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-600 text-center">
          <p>&copy; {new Date().getFullYear()} TuDestino.pe - Adaptika S.A.C.S</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
