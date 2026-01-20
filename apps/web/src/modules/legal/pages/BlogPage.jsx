import { Calendar, User, ArrowRight } from 'lucide-react';

function BlogPage() {
  const blogPosts = [
    {
      title: 'Cómo optimizar tu perfil de hotel para más reservas',
      category: 'Hoteles',
      date: '15 Enero 2026',
      author: 'Equipo TuDestino',
      excerpt: 'Descubre las mejores prácticas para crear un perfil atractivo que convierta visitantes en huéspedes.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'
    },
    {
      title: '10 tendencias del turismo en Perú para 2026',
      category: 'Industria',
      date: '10 Enero 2026',
      author: 'Ana García',
      excerpt: 'Conoce las tendencias que están transformando el turismo peruano y cómo aprovechlas.',
      image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=600&q=80'
    },
    {
      title: 'Guía completa: Gestionar reseñas de clientes',
      category: 'Atención al cliente',
      date: '5 Enero 2026',
      author: 'Carlos Mendoza',
      excerpt: 'Aprende a responder reseñas positivas y negativas de manera profesional.',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80'
    },
    {
      title: 'Marketing digital para restaurantes turísticos',
      category: 'Restaurantes',
      date: '28 Diciembre 2025',
      author: 'María Flores',
      excerpt: 'Estrategias efectivas para atraer turistas a tu restaurante usando redes sociales.',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80'
    },
    {
      title: 'Cómo crear tours inolvidables en Cusco',
      category: 'Tours',
      date: '20 Diciembre 2025',
      author: 'Jorge Palacios',
      excerpt: 'Consejos de expertos para diseñar experiencias turísticas memorables.',
      image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80'
    },
    {
      title: 'Precios dinámicos: Maximiza tus ingresos',
      category: 'Estrategia',
      date: '15 Diciembre 2025',
      author: 'Equipo TuDestino',
      excerpt: 'Aprende a ajustar tus precios según la demanda y temporada para aumentar rentabilidad.',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80'
    },
  ];

  const categories = ['Todos', 'Hoteles', 'Restaurantes', 'Tours', 'Industria', 'Estrategia', 'Atención al cliente'];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog de TuDestino.pe</h1>
          <p className="text-xl text-gray-600">
            Guías, consejos y tendencias para hacer crecer tu negocio turístico en Perú
          </p>
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full border ${
                category === 'Todos'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
              } transition`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured post */}
        <div className="mb-12">
          <div className="relative h-96 rounded-2xl overflow-hidden mb-6">
            <img
              src={blogPosts[0].image}
              alt={blogPosts[0].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <span className="inline-block bg-primary px-3 py-1 rounded-full text-sm mb-3">
                {blogPosts[0].category}
              </span>
              <h2 className="text-3xl font-bold mb-3">{blogPosts[0].title}</h2>
              <p className="text-lg mb-4 opacity-90">{blogPosts[0].excerpt}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{blogPosts[0].date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{blogPosts[0].author}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog posts grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.slice(1).map((post, index) => (
            <article key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition group cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-sm">
                  {post.category}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all">
                    Leer más
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Suscríbete a nuestro newsletter</h2>
          <p className="mb-6 opacity-90">
            Recibe consejos, guías y novedades para hacer crecer tu negocio turístico
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Suscribirme
            </button>
          </div>
        </div>

        {/* Recursos adicionales */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-2">Centro de Ayuda</h3>
            <p className="text-gray-600 mb-4">
              Documentación completa y tutoriales
            </p>
            <a href="/help" className="text-primary font-semibold hover:underline">
              Visitar →
            </a>
          </div>
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-2">Recursos para Empresarios</h3>
            <p className="text-gray-600 mb-4">
              Guías, plantillas y herramientas
            </p>
            <a href="/business-resources" className="text-primary font-semibold hover:underline">
              Explorar →
            </a>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-2">Comunidad</h3>
            <p className="text-gray-600 mb-4">
              Conéctate con otros empresarios
            </p>
            <a href="/contact" className="text-primary font-semibold hover:underline">
              Unirme →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogPage;
