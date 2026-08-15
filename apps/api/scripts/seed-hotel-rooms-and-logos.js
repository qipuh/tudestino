import sequelize from '../src/config/database-mysql.js';
import Business from '../src/modules/businesses/business.model.js';

const hotelData = [
  { name: "Gran Kuntur Wasi Hotel Casa y Campo", logo: "https://www.booking.com/hotel/pe/gran-kuntur-wasi-casa-y-campo-cajamarca.es.html", cover: "https://www.booking.com/hotel/pe/gran-kuntur-wasi-casa-y-campo-cajamarca.es.html" },
  { name: "Costa del Sol Wyndham Cajamarca", logo: "https://www.wyndham.com/hotels/peru/cajamarca/wyndham-costa-del-sol-cajamarca/hotel-overview", cover: "https://www.booking.com/hotel/pe/costa-del-sol-wyndham-cajamarca.html" },
  { name: "Hotel & Spa Laguna Seca", logo: "https://www.booking.com/hotel/pe/amp-spa-laguna-seca.html", cover: "https://www.booking.com/hotel/pe/amp-spa-laguna-seca.html" },
  { name: "Casa Hacienda Hotel Boutique", logo: "https://www.booking.com/hotel/pe/casa-hacienda-boutique.html", cover: "https://www.booking.com/hotel/pe/casa-hacienda-boutique.html" },
  { name: "La Ensenada Hotel Cajamarca", logo: "https://www.laensenadahoteles.com/laensenadahotelcajamarca/", cover: "https://www.booking.com/hotel/pe/ensenada-y-campo.html" },
  { name: "Gran Hotel Continental", logo: "https://www.booking.com/hotel/pe/gran-continental.html", cover: "https://www.booking.com/hotel/pe/gran-continental.html" },
  { name: "Posada del Puruay", logo: "https://posadapuruay.com.pe/", cover: "https://www.booking.com/hotel/pe/posada-del-puruay.html" },
  { name: "Hacienda Hotel San Antonio", logo: "https://www.booking.com/hotel/pe/hacienda-san-antonio-cajamarca1.html", cover: "https://www.booking.com/hotel/pe/hacienda-san-antonio-cajamarca1.html" },
  { name: "Hotel Campestre Hacienda Yanamarca", logo: "https://www.tripadvisor.com/Hotel_Review-g319821-d1893385", cover: "https://www.tripadvisor.com/Hotel_Review-g319821-d1893385" },
  { name: "Qasamarca Hotel Boutique", logo: "https://www.booking.com/hotel/pe/qasamarca-boutique.html", cover: "https://www.booking.com/hotel/pe/qasamarca-boutique.html" },
  { name: "Hotel Continental", logo: "https://www.booking.com/hotel/pe/continental-cajamarca.html", cover: "https://www.booking.com/hotel/pe/continental-cajamarca.html" },
  { name: "Hotel Tartar", logo: "https://www.booking.com/hotel/pe/tartar-cajamarca1.html", cover: "https://www.booking.com/hotel/pe/tartar-cajamarca1.html" },
  { name: "Serra Nova", logo: "https://www.booking.com/hotel/pe/hostal-serra-nova.html", cover: "https://www.booking.com/hotel/pe/hostal-serra-nova.html" },
  { name: "El Cumbe Inn", logo: "https://www.booking.com/hotel/pe/el-cumbe-inn.html", cover: "https://www.booking.com/hotel/pe/el-cumbe-inn.html" },
  { name: "Hotel Sol de Belén", logo: "https://www.booking.com/hotel/pe/sol-de-belen.html", cover: "https://www.booking.com/hotel/pe/sol-de-belen.html" },
  { name: "Hotel Aural", logo: "https://www.booking.com/hotel/pe/aural.html", cover: "https://www.booking.com/hotel/pe/aural.html" },
  { name: "Hotel Cajamarca", logo: "https://www.booking.com/hotel/pe/cajamarca.html", cover: "https://www.booking.com/hotel/pe/cajamarca.html" },
  { name: "Casona del Inca", logo: "https://www.booking.com/hotel/pe/casona-del-inca-cajamarca.html", cover: "https://www.booking.com/hotel/pe/casona-del-inca-cajamarca.html" },
  { name: "Yuraq Hotel", logo: "https://www.tripadvisor.com/Hotel_Review-g319821-d6575483", cover: "https://www.tripadvisor.com/Hotel_Review-g319821-d6575483" },
  { name: "Qhapac Nan Hotel", logo: "https://www.tripadvisor.com/Hotel_Review-g319821-d6394781", cover: "https://www.tripadvisor.com/Hotel_Review-g319821-d6394781" },
  { name: "La Ensenada Hoteles", logo: "https://www.booking.com/hotel/pe/ensenada-y-campo.html", cover: "https://www.booking.com/hotel/pe/ensenada-y-campo.html" },
  { name: "Las Americas Hotel", logo: "https://www.tripadvisor.com/Hotel_Review-g319821-d1472369", cover: "https://www.tripadvisor.com/Hotel_Review-g319821-d1472369" },
  { name: "El Portal del Marqués", logo: "https://www.booking.com/hotel/pe/consorcio-el-portal-del-marques.html", cover: "https://www.booking.com/hotel/pe/consorcio-el-portal-del-marques.html" },
  { name: "Valle del Inca", logo: "https://www.tripadvisor.com/Hotel_Review-g319821-d1872356", cover: "https://www.tripadvisor.com/Hotel_Review-g319821-d1872356" },
  { name: "Hotel Casablanca", logo: "https://www.booking.com/hotel/pe/casablanca-cajamarca.html", cover: "https://www.booking.com/hotel/pe/casablanca-cajamarca.html" },
  { name: "Hospedaje Encantada", logo: "https://www.booking.com/hotel/pe/hospedaje-la-encantada-cajamarca1.html", cover: "https://www.booking.com/hotel/pe/hospedaje-la-encantada-cajamarca1.html" },
  { name: "Hostal Gladiolos", logo: "https://www.booking.com/hotel/pe/hostal-gladiolos.html", cover: "https://www.booking.com/hotel/pe/hostal-gladiolos.html" },
  { name: "Hotel El Ingenio", logo: "https://www.tripadvisor.com/Hotel_Review-g319821-d1153756", cover: "https://www.tripadvisor.com/Hotel_Review-g319821-d1153756" },
  { name: "Hostal Los Jazmines", logo: "https://www.tripadvisor.com/Hotel_Review-g319821-d2330095", cover: "https://www.tripadvisor.com/Hotel_Review-g319821-d2330095" },
  { name: "Hostal Monumental", logo: "https://www.booking.com/hotel/pe/hostal-monumental-a-media-cuadra-de-la-plaza-mayor.html", cover: "https://www.booking.com/hotel/pe/hostal-monumental-a-media-cuadra-de-la-plaza-mayor.html" },
  { name: "La Chinita Hospedaje", logo: "https://www.booking.com/hotel/pe/la-chinita-hospedaje-cajamarca.html", cover: "https://www.booking.com/hotel/pe/la-chinita-hospedaje-cajamarca.html" },
  { name: "El Cabildo Hostal", logo: "https://www.tripadvisor.com/Hotel_Review-g319821-d1948537", cover: "https://www.tripadvisor.com/Hotel_Review-g319821-d1948537" },
  { name: "Chakra Runa Backpackers", logo: "https://www.tripadvisor.com/Hotel_Review-g319821-d11702416", cover: "https://www.tripadvisor.com/Hotel_Review-g319821-d11702416" },
  { name: "Sauna Spa Yaku Hostal", logo: "https://www.tripadvisor.com/Hotel_Review-g319821-d7306687", cover: "https://www.tripadvisor.com/Hotel_Review-g319821-d7306687" },
  { name: "Hostal Kristal", logo: "https://www.tripadvisor.com/Hotel_Review-g319821-d8655559", cover: "https://www.tripadvisor.com/Hotel_Review-g319821-d8655559" },
  { name: "Casa Mirita", logo: "https://www.booking.com/hotel/pe/casa-mirita.html", cover: "https://www.booking.com/hotel/pe/casa-mirita.html" }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('DB conectada');

    let updated = 0;
    for (const data of hotelData) {
      const updated_count = await Business.update(
        { logo: data.logo, coverImage: data.cover },
        { where: { name: data.name } }
      );
      if (updated_count[0] > 0) {
        console.log(`✓ Logos actualizado: ${data.name}`);
        updated++;
      } else {
        console.log(`~ No encontrado: ${data.name}`);
      }
    }

    console.log(`\n✓ Seeder completado. ${updated} hoteles con logos actualizados.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seed();
