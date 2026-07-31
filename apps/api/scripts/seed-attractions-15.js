import sequelize from '../src/config/database-mysql.js';
import Attraction from '../src/modules/attractions/attraction.model.js';
import AttractionImage from '../src/modules/attractions/attraction-image.model.js';

const attractions = [
  {
    title: "Cerro Santa Apolonia",
    metaTitle: "Cerro Santa Apolonia Cajamarca 2026: la Silla del Inca y el mejor mirador",
    metaDescription: "Descubre el Cerro Santa Apolonia y la Silla del Inca en Cajamarca: mirador, historia milenaria y vistas increíbles. ¡Planifica tu visita 2026 ya!",
    category: "cultura",
    city: "Cajamarca",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.16024,
    longitude: -78.51932,
    slug: "cerro-santa-apolonia",
    description: "Imagina subir apenas dos cuadras y media desde la Plaza de Armas de Cajamarca y encontrarte, de pronto, con toda la ciudad desplegada a tus pies, rodeada de montañas verdes y un cielo andino que cambia de color con el atardecer. Eso es el Cerro Santa Apolonia: el mirador natural más querido de Cajamarca y guardián de uno de los enigmas arqueológicos más fascinantes del norte del Perú, la legendaria Silla del Inca.",
    whatToDo: "Fotografiarte en la Silla del Inca. Recorrer el mirador principal. Visitar la capilla de Nuestra Señora de Fátima. Subir por las escalinatas de piedra. Comprar artesanía local.",
    recommendations: "Gastronomía: cuy frito, caldo verde, humitas. Alojamiento: centro histórico cerca de Plaza de Armas. Presupuesto: 100-180 soles diarios.",
    howToGetThere: "Avión: LATAM/Sky Airline Lima-Cajamarca, 1h15min aprox. Taxi al centro: 10-15 min. A pie: 5-10 min desde Plaza de Armas por Jirón Dos de Mayo.",
    videoUrl: "https://www.youtube.com/embed/P6XlL99JWEI",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/1/17/Cerro_de_Santa_Apolonia_de_Cajamarca.jpg", caption: "Vista del Cerro Santa Apolonia", credit: "Pitxiquin", sourceUrl: "https://commons.wikimedia.org/wiki/File:Cerro_de_Santa_Apolonia_de_Cajamarca.jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Est%C3%A0tua_d%27Atahualpa_i_cadira_al_Cerro_de_Santa_Apolonia_de_Cajamarca.jpg", caption: "Estatua de Atahualpa y la Silla del Inca", credit: "Pitxiquin", sourceUrl: "https://commons.wikimedia.org/wiki/File:Est%C3%A0tua_d%27Atahualpa_i_cadira_al_Cerro_de_Santa_Apolonia_de_Cajamarca.jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Escales_que_pugen_al_cerro_de_Santa_Apolonia_amb_la_capella_de_Nuestra_Se%C3%B1ora_de_F%C3%A1tima_a_dalt.jpg", caption: "Escalinatas al cerro", credit: "Pitxiquin", sourceUrl: "https://commons.wikimedia.org/wiki/File:Escales_que_pugen_al_cerro_de_Santa_Apolonia_amb_la_capella_de_Nuestra_Se%C3%B1ora_de_F%C3%A1tima_a_dalt.jpg" }
    ]
  },
  {
    title: "Baños del Inca",
    metaTitle: "Baños del Inca Cajamarca 2026: aguas termales incas que debes vivir",
    metaDescription: "Sumérgete en los Baños del Inca de Cajamarca: pozas termales, historia de Atahualpa y relax total. Reserva tu visita 2026 y vive la experiencia.",
    category: "naturaleza",
    city: "Baños del Inca",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.16379,
    longitude: -78.46478,
    slug: "banos-del-inca",
    description: "Hay un lugar a las afueras de Cajamarca donde el agua sale hirviendo directamente de la tierra, tal como lo hacía hace más de dos mil años, cuando el propio inca Atahualpa se sumergía en sus pozas para recuperar fuerzas antes de sus campañas de conquista.",
    whatToDo: "Conocer la Poza del Inca. Darte un baño termal. Complementar con masaje o sauna. Pasear por áreas verdes. Visitar el malecón turístico.",
    recommendations: "Gastronomía: cuy frito, chicharrón con mote, caldo de gallina. Alojamiento: centro de Cajamarca o Baños del Inca. Presupuesto: 40-100 soles por persona.",
    howToGetThere: "Avión: vuelos LATAM/Sky a Cajamarca, 1h15min. Auto: 6 km desde centro, 15-20 min en taxi. Combis frecuentes desde el centro.",
    videoUrl: "https://www.youtube.com/embed/os5CyD6FWws",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Anterior_posa_del_inca.JPG", caption: "Poza del Inca", credit: "John PC", sourceUrl: "https://commons.wikimedia.org/wiki/File:Anterior_posa_del_inca.JPG" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/2/21/Ba%C3%B1os_del_Inca-1_Cajamarca.JPG", caption: "Complejo termal Baños del Inca", credit: "Catatine", sourceUrl: "https://commons.wikimedia.org/wiki/File:Ba%C3%B1os_del_Inca-1_Cajamarca.JPG" }
    ]
  },
  {
    title: "Cumbe Mayo",
    metaTitle: "Cumbe Mayo Cajamarca 2026: canal preincaico y bosque de piedras mágico",
    metaDescription: "Explora Cumbe Mayo en Cajamarca: acueducto preincaico, petroglifos y el asombroso bosque de piedras Los Frailones. Planifica tu aventura 2026.",
    category: "aventura",
    city: "Cajamarca",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.18972,
    longitude: -78.57389,
    slug: "cumbe-mayo",
    description: "A más de 3,500 metros de altura, entre un silencio que solo rompe el viento de la puna, se levanta un paisaje que parece sacado de otro planeta: siluetas de piedra volcánica que a lo lejos se confunden con procesiones de monjes petrificados, y a sus pies, un canal tallado en roca viva hace miles de años.",
    whatToDo: "Caminar junto al acueducto preincaico. Explorar Los Frailones. Buscar petroglifos. Visitar el Santuario. Disfrutar del paisaje.",
    recommendations: "Gastronomía: caldo verde, cuy frito, chicharrón. Alojamiento: centro de Cajamarca. Presupuesto: 40-90 soles incluyendo tour.",
    howToGetThere: "Avión: LATAM/Sky Lima-Cajamarca. Auto: 20 km suroeste, 40-60 min. Tour desde agencias de Cajamarca.",
    videoUrl: "https://www.youtube.com/embed/ayahes7bRH8",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/3/37/Cumbe_Mayo_Archaeological_site_-_aqueduct.jpg", caption: "Acueducto preincaico", credit: "AgainErick", sourceUrl: "https://commons.wikimedia.org/wiki/File:Cumbe_Mayo_Archaeological_site_-_aqueduct.jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/3/39/Bosque_de_piedras_de_Cumbemayo.jpg", caption: "Bosque de piedras", credit: "Bianlu", sourceUrl: "https://commons.wikimedia.org/wiki/File:Bosque_de_piedras_de_Cumbemayo.jpg" }
    ]
  },
  {
    title: "Cuarto del Rescate",
    metaTitle: "Cuarto del Rescate Cajamarca 2026: la sala donde cayó un imperio",
    metaDescription: "Descubre el Cuarto del Rescate en Cajamarca, único vestigio inca de la ciudad. Conoce su historia, horarios y precios 2026. ¡Planifica tu visita ya!",
    category: "cultura",
    city: "Cajamarca",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.15778,
    longitude: -78.51667,
    slug: "cuarto-del-rescate",
    description: "En el corazón del centro histórico de Cajamarca, a apenas 50 metros de la Plaza de Armas, se alza una construcción de piedra que cambió el curso de la historia de América. El Cuarto del Rescate es el único vestigio arquitectónico inca que sobrevive en pie dentro de la ciudad, y entrar en él es literalmente pisar el lugar donde el Inca Atahualpa pasó sus últimos meses de vida.",
    whatToDo: "Observar la línea roja del muro. Examinar la cantería inca. Leer paneles informativos. Contratar guía local. Fotografiar la fachada.",
    recommendations: "Gastronomía: cuy frito, caldo verde, humitas. Alojamiento: centro histórico. Presupuesto: 100-180 soles diarios.",
    howToGetThere: "Avión: LATAM/Sky Lima-Cajamarca, 1h15min. A pie: 50 metros de Plaza de Armas. Taxi desde aeropuerto: 10-15 min.",
    videoUrl: "https://www.youtube.com/embed/H-ka4DhfOsE",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/El_cuarto_del_Rescate%2C_Cajamarca%2C_Peru.jpg", caption: "Interior del Cuarto del Rescate", credit: "Miguel Francisco Rueda Ñañez", sourceUrl: "https://commons.wikimedia.org/wiki/File:El_cuarto_del_Rescate,_Cajamarca,_Peru.jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Cajamarca_-_el_cuarto_del_rescate.jpg", caption: "Sala de piedra", credit: "Hellcome", sourceUrl: "https://commons.wikimedia.org/wiki/File:Cajamarca_-_el_cuarto_del_rescate.jpg" }
    ]
  },
  {
    title: "Ventanillas de Otuzco",
    metaTitle: "Ventanillas de Otuzco 2026: la necrópolis preinca que desafía el tiempo",
    metaDescription: "Explora las Ventanillas de Otuzco, necrópolis preinca cerca de Cajamarca. Horarios, precios y cómo llegar en 2026. ¡Vive la historia in situ!",
    category: "cultura",
    city: "Cajamarca",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.1259,
    longitude: -78.4577,
    slug: "ventanillas-de-otuzco",
    description: "A solo 8 kilómetros de la ciudad de Cajamarca, tallado en un farallón de roca volcánica, se esconde uno de los cementerios más enigmáticos y antiguos del norte del Perú. Las Ventanillas de Otuzco son cientos de nichos funerarios excavados en la roca.",
    whatToDo: "Caminar por sendero del farallón. Subir al mirador. Conversar con guías locales. Visitar circuito de artesanía. Fotografiar paisaje.",
    recommendations: "Gastronomía: cuy chactado, caldo de gallina, productos lácteos. Alojamiento: centro Cajamarca o Baños Inca. Presupuesto: 80-150 soles.",
    howToGetThere: "Avión: LATAM/Sky Lima-Cajamarca. Auto: 8 km, 15-20 min desde centro. Combis desde Cajamarca o tour combinado con Baños Inca.",
    videoUrl: "https://www.youtube.com/embed/bC4Jmb2G3OM",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/5/59/Las_Ventanillas_de_Otuzco.jpg", caption: "Farallón con nichos", credit: "Elisolidum", sourceUrl: "https://commons.wikimedia.org/wiki/File:Las_Ventanillas_de_Otuzco.jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Otuzco_ventanillas.jpg", caption: "Panorámica necrópolis", credit: "Velvet", sourceUrl: "https://commons.wikimedia.org/wiki/File:Otuzco_ventanillas.jpg" }
    ]
  },
  {
    title: "Complejo Belén",
    metaTitle: "Complejo Belén Cajamarca 2026: arte barroco, historia y misterio",
    metaDescription: "Visita el Complejo Belén en Cajamarca: iglesia barroca, museo médico y arqueológico. Horarios y precios 2026. ¡Descubre su historia hoy!",
    category: "cultura",
    city: "Cajamarca",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.159149,
    longitude: -78.516948,
    slug: "complejo-belen",
    description: "A solo una cuadra de la Plaza de Armas de Cajamarca, un conjunto de piedra labrada guarda tres siglos de historia, arte y medicina colonial. El Complejo Belén reúne la Iglesia de Belén, el antiguo Hospital de Hombres y el antiguo Hospital de Mujeres con sus museos.",
    whatToDo: "Detenerse ante fachada tallada. Visitar interior iglesia. Recorrer Museo Médico. Cruzar a Hospital de Mujeres. Ver tallas simbólicas.",
    recommendations: "Gastronomía: cuy frito, chicharrón, manjar blanco. Alojamiento: centro histórico, jirón Belén. Presupuesto: 100-180 soles.",
    howToGetThere: "Avión: vuelos directos LATAM/Sky a Cajamarca. A pie: 1 cuadra desde Plaza de Armas, 2-3 min caminando.",
    videoUrl: "https://www.youtube.com/embed/03eY3OOuxk8",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/c/c4/IGLESIA_DE_BELEN_-_CAJAMARCA.jpg", caption: "Fachada barroca", credit: "Carlos jc", sourceUrl: "https://commons.wikimedia.org/wiki/File:IGLESIA_DE_BELEN_-_CAJAMARCA.jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/3/31/Iglesia_Bel%C3%A9n_-_Cajamarca.jpg", caption: "Iglesia dentro conjunto", credit: "Ronaldofqc", sourceUrl: "https://commons.wikimedia.org/wiki/File:Iglesia_Bel%C3%A9n_-_Cajamarca.jpg" }
    ]
  },
  {
    title: "Llacanora",
    metaTitle: "Llacanora Cajamarca 2026: Cataratas y Paz Rural a Solo Minutos",
    metaDescription: "Descubre las cataratas de Llacanora, cuevas milenarias y paisajes verdes cerca de Cajamarca. Planifica tu escapada de naturaleza en 2026.",
    category: "naturaleza",
    city: "Llacanora",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.19444,
    longitude: -78.42361,
    slug: "llacanora",
    description: "A menos de media hora del bullicio de la Plaza de Armas de Cajamarca, el distrito de Llacanora guarda uno de esos secretos que enamoran a quien los descubre: un valle verde salpicado de eucaliptos, chacras de maíz y dos cataratas gemelas que caen entre rocas cubiertas de musgo.",
    whatToDo: "Ver cataratas Paccha Macho y Paccha Hembra. Visitar cuevas de Callacpuma. Subir cerro Callac Puma. Pasear por pueblo. Tomar fotos.",
    recommendations: "Gastronomía: cuy frito, caldo verde, quesos. Alojamiento: Cajamarca, Baños Inca. Presupuesto: 40-80 soles.",
    howToGetThere: "Avión: LATAM/Sky Lima-Cajamarca. Auto: 12.5 km, 20-30 min. Combi desde Recoleta en Cajamarca.",
    videoUrl: "https://www.youtube.com/embed/mMJI-5CdblQ",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Hacia_La_Luz_%2837780460%29.jpeg", caption: "Salida luz cueva Callacpuma", credit: "Martin Nureña", sourceUrl: "https://commons.wikimedia.org/wiki/File:Hacia_La_Luz_(37780460).jpeg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/0/02/Cueva_callacpuma.jpg", caption: "Entrada cueva Callacpuma", credit: "Jycamposh", sourceUrl: "https://commons.wikimedia.org/wiki/File:Cueva_callacpuma.jpg" }
    ]
  },
  {
    title: "Deportes de Aventura en Cajamarca",
    metaTitle: "Deportes de Aventura en Cajamarca 2026: Adrenalina Andina Real",
    metaDescription: "Parapente, downhill, trekking y cabalgatas en Cajamarca: la guía 2026 de turismo de aventura en los Andes peruanos. Vive la adrenalina.",
    category: "aventura",
    city: "Cajamarca",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.1638,
    longitude: -78.5003,
    slug: "deportes-aventura-cajamarca",
    description: "Cajamarca no solo es la ciudad del rescate de Atahualpa: sus montañas, quebradas y vientos andinos la han convertido en uno de los escenarios de turismo de aventura más completos del norte peruano.",
    whatToDo: "Parapente en cerros. Downhill desde Cumbemayo. Trekking en rutas altas. Cabalgatas en Granja Porcón. Canopy y tirolesa.",
    recommendations: "Gastronomía: cuy frito, chicharrón, comida campestre. Alojamiento: centro o Baños Inca. Presupuesto: 100-300 soles.",
    howToGetThere: "Avión: vuelos a Cajamarca. Cumbemayo: 20 km suroeste. Granja Porcón: 20 km norte. Tours desde agencias.",
    videoUrl: "https://www.youtube.com/embed/WlxK8EniMxQ",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Cumbemayo_aqueduct.JPG", caption: "Canal Cumbemayo", credit: "Gsd97jks", sourceUrl: "https://commons.wikimedia.org/wiki/File:Cumbemayo_aqueduct.JPG" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/3/39/Bosque_de_piedras_de_Cumbemayo.jpg", caption: "Bosque piedras Cumbemayo", credit: "Bianlu", sourceUrl: "https://commons.wikimedia.org/wiki/File:Bosque_de_piedras_de_Cumbemayo.jpg" }
    ]
  },
  {
    title: "Namora",
    metaTitle: "Namora Cajamarca 2026: Lagunas Andinas que Enamoran",
    metaDescription: "Descubre la laguna San Nicolás, Sulluscocha y Los Sapitos en Namora, Cajamarca. Guía 2026 para tu escapada a las lagunas andinas.",
    category: "naturaleza",
    city: "Namora",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.20278,
    longitude: -78.32583,
    slug: "namora",
    description: "A poco menos de una hora de Cajamarca, el distrito de Namora esconde un espejo de agua que parece pintado a mano: la laguna San Nicolás, de un azul intenso que contrasta con el verde de los cerros andinos que la rodean.",
    whatToDo: "Paseo en bote en laguna San Nicolás. Visita laguna Sulluscocha. Bosque piedras Los Sapitos. Talleres guitarra namorina. Complejo Qhapaq Ñan.",
    recommendations: "Gastronomía: trucha frita, caldo verde, quesos. Alojamiento: Cajamarca. Presupuesto: 50-100 soles.",
    howToGetThere: "Avión: vuelos a Cajamarca. Auto: 25-30 km, 45-50 min. Combis desde Cajamarca o tour de día completo.",
    videoUrl: "https://www.youtube.com/embed/5d_wXNC7rKg",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/1/14/Laguna_San_Nicol%C3%A1s_-_panoramio.jpg", caption: "Laguna San Nicolás panorámica", credit: "cesquisa", sourceUrl: "https://commons.wikimedia.org/wiki/File:Laguna_San_Nicol%C3%A1s_-_panoramio.jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/1/10/Laguna_San_Nicol%C3%A1s_-_panoramio_%281%29.jpg", caption: "Aguas azules San Nicolás", credit: "cesquisa", sourceUrl: "https://commons.wikimedia.org/wiki/File:Laguna_San_Nicol%C3%A1s_-_panoramio_(1).jpg" }
    ]
  },
  {
    title: "Catarata La Novia",
    metaTitle: "Catarata La Novia Cajamarca 2026: la cascada que enamoró al Perú",
    metaDescription: "Descubre cómo llegar a la Catarata La Novia en Celendín, Cajamarca: mejor época, trekking y consejos 2026. Prepara tus botas y vive la aventura.",
    category: "naturaleza",
    city: "Celendín",
    region: "Cajamarca",
    country: "Perú",
    latitude: -6.9800,
    longitude: -78.1550,
    slug: "catarata-la-novia",
    description: "Imagina caminar durante horas por senderos andinos, envuelto en neblina y quebradas verdes, hasta escuchar primero y ver después una cortina de agua blanca que cae sobre la roca como el velo de una novia el día de su boda. Así es la Catarata La Novia.",
    whatToDo: "Trekking a la catarata, 1-2 horas. Fotografía de paisaje. Observación flora fauna andina. Baño en pozas naturales. Turismo vivencial.",
    recommendations: "Gastronomía: caldo gallina, cuy frito, humitas. Alojamiento: Celendín. Presupuesto: 100-180 soles.",
    howToGetThere: "Avión: a Cajamarca, luego auto 2.5h a Celendín. Auto/taxi desde Celendín 1-2h a zona Sucre/Oxamarca. Guía local recomendado.",
    videoUrl: "https://www.youtube.com/embed/4-qRSij6d5Y",
    images: [
      { url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh7SbonYWbvh9wBnimPJ4x9qn_e4p6csoHC3aTbF4t5G9-TNF8cy73outCiDEKEd8gGYSdbIX_C08__9B81TDaL7p2Sg4KJmpLc0HpgNg3YNRC0tKFsw11WNJrKBOyOUmmJfAbfdy3BVKOA/s1600/2a.jpg", caption: "Catarata La Novia", credit: "Franz Sánchez", sourceUrl: "https://sucremus.blogspot.com/2019/06/catarata-la-novia-celendina.html" },
      { url: "https://cajamarcaturisticacom.wordpress.com/wp-content/uploads/2021/07/cascada-la-novia-en-cajamarca-1-2.jpg", caption: "Velo de la Novia", credit: "Cajamarca Turística", sourceUrl: "https://cajamarcaturisticacom.wordpress.com/velo-de-la-novia/" }
    ]
  },
  {
    title: "Celendín: historia y sombreros",
    metaTitle: "Celendín 2026: historia, sombreros de paja y su casco colonial",
    metaDescription: "Conoce Celendín, Cajamarca: su historia, la feria dominical de sombreros de paja toquilla y su centro colonial. Planifica tu viaje 2026 ya.",
    category: "cultura",
    city: "Celendín",
    region: "Cajamarca",
    country: "Perú",
    latitude: -6.8668,
    longitude: -78.1444,
    slug: "celendin",
    description: "Al nororiente de la ciudad de Cajamarca, envuelta por montañas y valles verdes, se levanta Celendín, una de las ciudades coloniales más singulares y bellas del norte del Perú. Apodada la tierra del sombrero y el chocolate.",
    whatToDo: "Recorrer Plaza de Armas. Feria dominical sombreros La Alameda. Visitar taller tejido paja. Mirador Cristo Redentor. Paseo casco histórico.",
    recommendations: "Gastronomía: chocolate artesanal, menestras, cuy frito. Alojamiento: centro Celendín. Presupuesto: 80-150 soles.",
    howToGetThere: "Avión: a Cajamarca. Auto: 89 km noreste, 2.5h desde Cajamarca. Bus desde Cajamarca con salidas frecuentes.",
    videoUrl: "https://www.youtube.com/embed/9j5Q_PWuib4",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/9/98/CelendinPlus.jpg", caption: "Vista general Celendín", credit: "Flechav", sourceUrl: "https://commons.wikimedia.org/wiki/File:CelendinPlus.jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/3/39/Catedral_celendin.jpg", caption: "Iglesia matriz Celendín", credit: "Mrdoctorwil", sourceUrl: "https://commons.wikimedia.org/wiki/File:Catedral_celendin.jpg" }
    ]
  },
  {
    title: "Gastronomía en Cajamarca",
    metaTitle: "Gastronomía de Cajamarca 2026: quesos, cuy y sabores que enamoran",
    metaDescription: "Descubre los platos típicos de Cajamarca: queso, cuy, humitas y chicharrón. Guía completa 2026 de la gastronomía cajamarquina. Ven a probarla.",
    category: "gastronomia",
    city: "Cajamarca",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.1638,
    longitude: -78.5003,
    slug: "gastronomia-cajamarca",
    description: "Cajamarca no solo es la ciudad del rescate de Atahualpa: es también una de las despensas gastronómicas más generosas del Perú, cuna de una cuenca lechera y de una cocina de altura que combina ingredientes andinos.",
    whatToDo: "Recorrer mercado central. Comer en picantería tradicional. Visitar quesería o granja lechera. Probar dulces caseros. Combinar gastro e historia.",
    recommendations: "Cuy frito, chicharrón mote, caldo verde, humitas. Manjar blanco, quesillo miel. Presupuesto: 60-120 soles.",
    howToGetThere: "Avión: LATAM/Sky Lima-Cajamarca, 1h15min. Centro de Cajamarca: todos restaurantes a pocas cuadras Plaza Armas.",
    videoUrl: "https://www.youtube.com/embed/fHF8o03Rhaw",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Plaza_de_Armas_de_Cajamarca.jpg", caption: "Plaza Armas Cajamarca", credit: "Pitxiquin", sourceUrl: "https://commons.wikimedia.org/wiki/File:Plaza_de_Armas_de_Cajamarca.jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Caldo_verde%2C_Cajamarca_02.jpg", caption: "Caldo verde tradicional", credit: "Carlo Brescia", sourceUrl: "https://commons.wikimedia.org/wiki/File:Caldo_verde,_Cajamarca_02.jpg" }
    ]
  },
  {
    title: "La Recoleta",
    metaTitle: "La Recoleta Cajamarca 2026: historia, iglesia y plazuela que enamoran",
    metaDescription: "Descubre La Recoleta, la iglesia franciscana más fotografiada de Cajamarca. Historia, horarios y cómo llegar en 2026. Planifica tu visita ahora.",
    category: "cultura",
    city: "Cajamarca",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.16102,
    longitude: -78.51274,
    slug: "la-recoleta",
    description: "En el corazón del centro histórico de Cajamarca, a pocos minutos a pie de la Plaza de Armas, se alza uno de los templos coloniales más fotografiados de la ciudad: la Iglesia y Convento de La Recoleta.",
    whatToDo: "Contemplar fachada piedra tallada. Sentarse en Plazuela. Ingresar templo. Caminar avenida Los Héroes. Fotografiar.",
    recommendations: "Gastronomía: cuy frito, caldo verde, tamales, quesos. Alojamiento: centro histórico. Presupuesto: 120-200 soles.",
    howToGetThere: "Avión: vuelos LATAM/Sky a Cajamarca. A pie: 5 cuadras desde Plaza Armas, 10-15 min. Taxi: 3-5 min.",
    videoUrl: "https://www.youtube.com/embed/SoMwPPSYpcg",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/C%C3%BApula_i_altar_de_la_Iglesia_y_Convento_de_La_Recoleta_de_Cajamarca.jpg", caption: "Cúpula altar La Recoleta", credit: "Pitxiquin", sourceUrl: "https://commons.wikimedia.org/wiki/File:C%C3%BApula_i_altar_de_la_Iglesia_y_Convento_de_La_Recoleta_de_Cajamarca.jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Iglesia_y_Convento_de_La_Recoleta02.jpg", caption: "Fachada La Recoleta", credit: "Pitxiquin", sourceUrl: "https://commons.wikimedia.org/wiki/File:Iglesia_y_Convento_de_La_Recoleta02.jpg" }
    ]
  },
  {
    title: "UTC y la historia de la Universidad Nacional de Cajamarca",
    metaTitle: "UTC y la Universidad Nacional de Cajamarca 2026: la historia real",
    metaDescription: "Descubre la verdadera historia de UTC, hoy Universidad Nacional de Cajamarca. Campus, museos y curiosidades para tu visita en 2026.",
    category: "cultura",
    city: "Cajamarca",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.1669,
    longitude: -78.4954,
    slug: "utc-universidad-cajamarca",
    description: "Si preguntas a un cajamarquino por la UTC, es muy probable que primero piense en el equipo de fútbol que juega en el estadio Héroes de San Ramón. Pero detrás de esas tres letras hay una historia mucho más profunda: la de la actual Universidad Nacional de Cajamarca.",
    whatToDo: "Recorrer Ciudad Universitaria avenida Atahualpa. Visitar museos especializados. Conocer coliseo universitario. Estadio Héroes San Ramón.",
    recommendations: "Gastronomía: caldo gallina, cuy, tamales, quesos. Alojamiento: centro histórico. Presupuesto: 120-200 soles.",
    howToGetThere: "Avión: LATAM/Sky Lima-Cajamarca. A pie: 2 km desde Plaza Armas, 20-30 min. Taxi: 5-10 min.",
    videoUrl: "https://www.youtube.com/embed/59NlpFDBAH8",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Coliseum_of_National_University_of_Cajamarca.jpg", caption: "Coliseo UNC", credit: "Omarch1405", sourceUrl: "https://commons.wikimedia.org/wiki/File:Coliseum_of_National_University_of_Cajamarca.jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Edificio_de_Geol%C3%B3gica_-_UNC.JPG", caption: "Facultad Ingeniería Geológica", credit: "John PC", sourceUrl: "https://commons.wikimedia.org/wiki/File:Edificio_de_Geol%C3%B3gica_-_UNC.JPG" }
    ]
  },
  {
    title: "Historia del frito con ceviche cajamarquino",
    metaTitle: "Frito con Ceviche Cajamarquino 2026: la historia del plato que enamora",
    metaDescription: "Conoce el origen del frito con ceviche cajamarquino, nacido en un estadio de fútbol. Dónde probarlo en Cajamarca en 2026. Ven y saboréalo.",
    category: "gastronomia",
    city: "Cajamarca",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.1638,
    longitude: -78.5003,
    slug: "frito-ceviche-cajamarca",
    description: "El frito con ceviche cajamarquino es una combinación inesperada entre el crocante frito de cerdo y el fresco ceviche de pescado que se convirtió en plato representativo de la gastronomía regional.",
    whatToDo: "Sentarse picantería tradicional. Visitar mercado central. Conocer estadio Héroes San Ramón. Coincidir Carnaval febrero. Comparar versiones.",
    recommendations: "Frito cajamarquino + ceviche. Presupuesto: 25-45 soles por persona. Alojamiento: centro histórico.",
    howToGetThere: "Avión: LATAM/Sky Lima-Cajamarca. A pie: picanterías pocas cuadras Plaza Armas. Estadio: 1.5 km centro, 15-20 min.",
    videoUrl: "https://www.youtube.com/embed/gmMUjy_E-TI",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/6/68/Ceviche_peruano.jpg", caption: "Ceviche peruano", credit: "MiguelAlanCS", sourceUrl: "https://commons.wikimedia.org/wiki/File:Ceviche_peruano.jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/7/76/Chicharron_Cerdo_Cusco.jpg", caption: "Chicharrón cerdo", credit: "Soncco", sourceUrl: "https://commons.wikimedia.org/wiki/File:Chicharron_Cerdo_Cusco.jpg" }
    ]
  },
  {
    title: "Iglesia de Belén",
    metaTitle: "Iglesia de Belén Cajamarca 2026: arquitectura colonial y museo religioso",
    metaDescription: "Descubre la Iglesia de Belén, joya del barroco colonial cajamarquino. Fachada tallada, retablo dorado y museo. Cómo llegar en 2026.",
    category: "cultura",
    city: "Cajamarca",
    region: "Cajamarca",
    country: "Perú",
    latitude: -7.1598,
    longitude: -78.5025,
    slug: "iglesia-belen",
    description: "A apenas dos cuadras de la Plaza de Armas de Cajamarca se alza una de las iglesias más espectaculares del barroco andino colonial: la Iglesia de Belén.",
    whatToDo: "Admirar fachada piedra tallada. Entrar templo retablo dorado. Visitar museo anexo. Fotografiar desde ángulos. Caminar jirón Belén.",
    recommendations: "Gastronomía: platos típicos cajamarquinos. Alojamiento: Plaza de Armas cercana. Presupuesto: 120-200 soles.",
    howToGetThere: "Avión: vuelos a Cajamarca. A pie: 2 cuadras desde Plaza Armas, 5-10 min. Taxi/moto: menos 5 min.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Belen_Church_%28Cajamarca%29.jpg", caption: "Fachada Iglesia Belén", credit: "Wikimedia Commons", sourceUrl: "https://commons.wikimedia.org/wiki/File:Belen_Church_(Cajamarca).jpg" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Interior_Iglesia_Belen.jpg", caption: "Interior retablo dorado", credit: "Wikimedia Commons", sourceUrl: "https://commons.wikimedia.org/wiki/File:Interior_Iglesia_Belen.jpg" }
    ]
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('DB conectada');

    for (const data of attractions) {
      const images = data.images || [];
      delete data.images;

      const [attraction, created] = await Attraction.findOrCreate({
        where: { slug: data.slug },
        defaults: data
      });

      if (created) {
        console.log(`✓ Creado: ${attraction.title}`);
      } else {
        console.log(`~ Existía: ${attraction.title}`);
      }

      for (const img of images) {
        await AttractionImage.findOrCreate({
          where: { url: img.url, attractionId: attraction.id },
          defaults: {
            attractionId: attraction.id,
            url: img.url,
            caption: img.caption,
            credit: img.credit,
            sourceUrl: img.sourceUrl
          }
        });
      }
    }

    console.log('\n✓ Seeder completado. 15 atractivos.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seed();
