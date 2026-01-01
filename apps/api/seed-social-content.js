import { v4 as uuidv4 } from 'uuid';
import sequelize from './src/config/database-mysql.js';
import { Post, Reel } from './src/modules/social/social.model.sequelize.js';

async function seedSocialContent() {
  try {
    console.log('🌱 Iniciando seed de contenido social...');

    // Usuario para los posts de ejemplo (usar el primero de la DB)
    const userId = 'a7c2fe86-5d03-46cc-8f54-6b4c5e52e504'; // Edwin Chavez

    // 1. Crear Posts de ejemplo
    console.log('\n📝 Creando posts de ejemplo...');

    const posts = [
      {
        id: uuidv4(),
        userId,
        caption: '¡Explorando las hermosas ruinas de Machu Picchu! 🏔️ Un destino que todo peruano debe visitar al menos una vez. La energía de este lugar es increíble. #MachuPicchu #Peru #Travel',
        location: 'Machu Picchu, Cusco',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
            type: 'image',
            thumbnail: null
          },
          {
            url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
            type: 'image',
            thumbnail: null
          }
        ],
        likesCount: 127,
        commentsCount: 15,
        sharesCount: 8,
        isActive: true,
        createdAt: new Date('2025-01-15 10:30:00'),
        updatedAt: new Date('2025-01-15 10:30:00')
      },
      {
        id: uuidv4(),
        userId,
        caption: 'Amanecer en la Laguna 69 de Huaraz 🌄💙 El esfuerzo de la caminata vale totalmente la pena. El agua es de un azul increíble! #Huaraz #Laguna69 #TrekkingPeru',
        location: 'Laguna 69, Huaraz',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=800',
            type: 'image',
            thumbnail: null
          }
        ],
        likesCount: 89,
        commentsCount: 12,
        sharesCount: 5,
        isActive: true,
        createdAt: new Date('2025-01-10 08:15:00'),
        updatedAt: new Date('2025-01-10 08:15:00')
      },
      {
        id: uuidv4(),
        userId,
        caption: 'Ceviche fresco en el Circuito de Playas 🐟🍋 No hay nada como un buen ceviche mirando el mar. ¿Cuál es tu restaurante favorito en Lima? #Ceviche #FoodPeru #Lima',
        location: 'Miraflores, Lima',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1580554530778-ca36943938b2?w=800',
            type: 'image',
            thumbnail: null
          },
          {
            url: 'https://images.unsplash.com/photo-1559058922-6085e6a9611c?w=800',
            type: 'image',
            thumbnail: null
          },
          {
            url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
            type: 'image',
            thumbnail: null
          }
        ],
        likesCount: 234,
        commentsCount: 43,
        sharesCount: 18,
        isActive: true,
        createdAt: new Date('2025-01-05 13:45:00'),
        updatedAt: new Date('2025-01-05 13:45:00')
      },
      {
        id: uuidv4(),
        userId,
        caption: 'Atardecer en las Islas Ballestas 🌅🦭 Vimos lobos marinos, pingüinos y hasta cóndores. La fauna marina del Perú es espectacular! #IslasBallestas #Paracas #Wildlife',
        location: 'Islas Ballestas, Paracas',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
            type: 'image',
            thumbnail: null
          }
        ],
        likesCount: 156,
        commentsCount: 21,
        sharesCount: 9,
        isActive: true,
        createdAt: new Date('2025-01-02 17:20:00'),
        updatedAt: new Date('2025-01-02 17:20:00')
      },
      {
        id: uuidv4(),
        userId,
        caption: 'Plaza de Armas de Cajamarca iluminada ✨🏛️ Esta ciudad tiene una historia increíble. Cada rincón te cuenta algo diferente. #Cajamarca #PlazaDeArmas #PeruMagico',
        location: 'Plaza de Armas, Cajamarca',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800',
            type: 'image',
            thumbnail: null
          },
          {
            url: 'https://images.unsplash.com/photo-1555899434-94d1526a7852?w=800',
            type: 'image',
            thumbnail: null
          }
        ],
        likesCount: 78,
        commentsCount: 9,
        sharesCount: 4,
        isActive: true,
        createdAt: new Date('2024-12-28 19:00:00'),
        updatedAt: new Date('2024-12-28 19:00:00')
      }
    ];

    for (const postData of posts) {
      await Post.create(postData);
      console.log(`  ✅ Post creado: "${postData.caption.substring(0, 50)}..."`);
    }

    // 2. Crear Reels de ejemplo
    console.log('\n🎬 Creando reels de ejemplo...');

    const reels = [
      {
        id: uuidv4(),
        userId,
        caption: 'Montaña de 7 Colores en 30 segundos 🌈 La caminata más colorida del Perú! #Vinicunca #RainbowMountain #Cusco',
        location: 'Montaña Vinicunca, Cusco',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-snow-covered-mountain-in-the-distance-2847-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b4?w=400',
        duration: 30,
        viewsCount: 1547,
        likesCount: 312,
        commentsCount: 28,
        sharesCount: 45,
        isActive: true,
        createdAt: new Date('2025-01-12 14:30:00'),
        updatedAt: new Date('2025-01-12 14:30:00')
      },
      {
        id: uuidv4(),
        userId,
        caption: 'Así se prepara el auténtico Lomo Saltado 👨‍🍳🔥 Receta familiar directo desde Lima #LomoSaltado #ComidaPeruana #FoodTok',
        location: 'Lima, Perú',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-cooking-in-a-restaurant-kitchen-4256-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400',
        duration: 45,
        viewsCount: 2834,
        likesCount: 567,
        commentsCount: 89,
        sharesCount: 124,
        isActive: true,
        createdAt: new Date('2025-01-08 12:15:00'),
        updatedAt: new Date('2025-01-08 12:15:00')
      },
      {
        id: uuidv4(),
        userId,
        caption: 'Sandboarding en las dunas de Huacachina! 🏂🏜️ Adrenalina pura #Huacachina #Ica #AdventureTravel',
        location: 'Huacachina, Ica',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-person-skiing-down-a-snowy-hill-2389-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1619546952812-520e98064a52?w=400',
        duration: 25,
        viewsCount: 3241,
        likesCount: 689,
        commentsCount: 52,
        sharesCount: 98,
        isActive: true,
        createdAt: new Date('2025-01-03 16:40:00'),
        updatedAt: new Date('2025-01-03 16:40:00')
      },
      {
        id: uuidv4(),
        userId,
        caption: 'Cómo llegar a la Catarata Gocta en Amazonas 💦🌿 Una de las más altas del mundo! #Gocta #Amazonas #Waterfalls',
        location: 'Catarata Gocta, Amazonas',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-a-forest-2213-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400',
        duration: 60,
        viewsCount: 1923,
        likesCount: 421,
        commentsCount: 36,
        sharesCount: 67,
        isActive: true,
        createdAt: new Date('2024-12-30 10:25:00'),
        updatedAt: new Date('2024-12-30 10:25:00')
      }
    ];

    for (const reelData of reels) {
      await Reel.create(reelData);
      console.log(`  ✅ Reel creado: "${reelData.caption.substring(0, 50)}..."`);
    }

    console.log('\n✅ Seed completado exitosamente!');
    console.log(`\n📊 Resumen:`);
    console.log(`   - ${posts.length} posts creados`);
    console.log(`   - ${reels.length} reels creados`);
    console.log(`\n💡 Puedes ver el contenido en:`);
    console.log(`   - Feed: http://localhost:5173/feed`);
    console.log(`   - Reels: http://localhost:5173/reels`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

// Ejecutar seed
seedSocialContent();
