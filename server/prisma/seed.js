import prisma from '../src/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing records (optional, in correct order of relations)
  await prisma.bookmark.deleteMany();
  await prisma.post.deleteMany();
  await prisma.mediaLink.deleteMany();
  await prisma.place.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users (1 Admin, 2 Regular Users)
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Heritage',
      email: 'admin@heritage.gov.in',
      passwordHash,
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
  });

  const userRahul = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      passwordHash,
      role: 'user',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    },
  });

  const userPriya = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'priya@example.com',
      passwordHash,
      role: 'user',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    },
  });

  console.log('✅ Users seeded: admin@heritage.gov.in, rahul@example.com, priya@example.com (Password: password123)');

  // 3. Heritage Places Data
  const placesData = [
    {
      name: 'Taj Mahal',
      slug: 'taj-mahal',
      category: 'monument',
      state: 'Uttar Pradesh',
      shortDescription: 'An ivory-white marble mausoleum on the south bank of the Yamuna river, a UNESCO World Heritage site and symbol of eternal love.',
      fullStory: `Commissioned in 1631 by Mughal Emperor Shah Jahan to house the tomb of his favorite wife, Mumtaz Mahal, the Taj Mahal is widely considered one of the most stunning achievements in Indo-Islamic architecture. 

It combines elements from Islamic, Persian, Ottoman Turkish, and Indian architectural styles. Over 20,000 artisans and craftsmen were brought together from across northern India and Central Asia. The white marble was quarried from Makrana in Rajasthan, while 28 types of precious and semi-precious stones were inlaid into the marble using the intricate pietra dura (parchin kari) technique.

The monument stands on a raised marble plinth surrounded by 4 free-standing minarets, framed by symmetrical Charbagh gardens representing the paradise described in Islamic texts. The play of light on the white marble changes dramatically from dawn pink to dazzling white at noon, and golden at sunset.`,
      latitude: 27.1751,
      longitude: 78.0421,
      coverImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      youtubeVideoId: 'i9E_Bl4E6nE',
      mediaLinks: [
        {
          type: 'documentary',
          title: 'The Secrets of Taj Mahal - National Geographic',
          youtubeUrl: 'https://www.youtube.com/watch?v=i9E_Bl4E6nE',
          thumbnailUrl: 'https://img.youtube.com/vi/i9E_Bl4E6nE/hqdefault.jpg',
        },
        {
          type: 'song',
          title: 'Suno Na Sangemarmar (Youngistaan)',
          youtubeUrl: 'https://www.youtube.com/watch?v=iYQjC7G8Y_w',
          thumbnailUrl: 'https://img.youtube.com/vi/iYQjC7G8Y_w/hqdefault.jpg',
        },
      ],
      posts: [
        {
          userId: userRahul.id,
          rating: 5,
          caption: 'Sunrise view was truly magical! Words and pictures cannot do justice to the symmetrical perfection of this monument.',
          imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Group of Monuments at Hampi',
      slug: 'hampi-monuments',
      category: 'monument',
      state: 'Karnataka',
      shortDescription: 'The magnificent capital of the Vijayanagara Empire situated on the banks of Tungabhadra River, dotted with stone chariots and monoliths.',
      fullStory: `Hampi was the majestic capital of the Vijayanagara Empire in the 14th to 16th century. Chronicles left by Persian and European travelers (such as Domingo Paes and Abdur Razzaq) state that Hampi was one of the largest and wealthiest cities in the world during its zenith.

Set against a surreal landscape of giant granite boulders, lush banana plantations, and the holy Tungabhadra river, Hampi contains over 1,600 surviving monuments spread across 41 square kilometers. 

Notable monuments include the Vijaya Vittala Temple with its world-famous Stone Chariot and musical pillars, the Virupaksha Temple which has been an active pilgrimage centre for uninterrupted centuries, the Lotus Mahal, and the royal Elephant Stables. It was sacked and burned in 1565 after the Battle of Talikota, leaving behind hauntingly beautiful ruins.`,
      latitude: 15.3350,
      longitude: 76.4600,
      coverImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
      youtubeVideoId: 'yv52FkL1n_M',
      mediaLinks: [
        {
          type: 'documentary',
          title: 'Hampi: The Ruined Empire - Archaeological Survey of India',
          youtubeUrl: 'https://www.youtube.com/watch?v=yv52FkL1n_M',
          thumbnailUrl: 'https://img.youtube.com/vi/yv52FkL1n_M/hqdefault.jpg',
        },
        {
          type: 'movie',
          title: 'Vijayanagara Legends in Cinema',
          youtubeUrl: 'https://www.youtube.com/watch?v=g9z48v0dJ1w',
          thumbnailUrl: 'https://img.youtube.com/vi/g9z48v0dJ1w/hqdefault.jpg',
        },
      ],
      posts: [
        {
          userId: userPriya.id,
          rating: 5,
          caption: 'Standing beside the Stone Chariot at sunrise gave me goosebumps. Renting a moped to explore the ruins across the river is a must!',
          imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Konark Sun Temple',
      slug: 'konark-sun-temple',
      category: 'temple',
      state: 'Odisha',
      shortDescription: 'A 13th-century monumental chariot of the Sun God Surya, with 24 elaborately carved stone wheels pulled by seven horses.',
      fullStory: `Built around 1250 CE by King Narasimhadeva I of the Eastern Ganga Dynasty, the Sun Temple at Konark is conceived as a cosmic chariot for Surya, the Hindu Sun God. 

The chariot has 24 intricately carved stone wheels (approx. 10 feet in diameter), symbolizing the 24 hours of the day or the fortnights in a year, steered by seven stone horses representing the seven days of the week or the seven colors of visible sunlight. The spokes of the sundial wheels function as accurate clocks that can tell time down to minutes by observing shadow directions.

Famous for its exquisite Kalinga architectural style, the walls depict every facet of 13th-century life: musicians, dancers, mythical creatures, royal processions, and intricate geometric patterns. The poet Rabindranath Tagore remarked of Konark: "Here the language of stone surpasses the language of human."`,
      latitude: 19.8876,
      longitude: 86.0945,
      coverImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
      youtubeVideoId: 'UeQxP4k7d5Q',
      mediaLinks: [
        {
          type: 'documentary',
          title: 'Engineering Wonders of Konark Sun Temple',
          youtubeUrl: 'https://www.youtube.com/watch?v=UeQxP4k7d5Q',
          thumbnailUrl: 'https://img.youtube.com/vi/UeQxP4k7d5Q/hqdefault.jpg',
        },
      ],
      posts: [
        {
          userId: userRahul.id,
          rating: 5,
          caption: 'The sundial wheel actually tells the exact time! Incredible ancient Indian engineering.',
          imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Meenakshi Amman Temple',
      slug: 'meenakshi-amman-temple',
      category: 'temple',
      state: 'Tamil Nadu',
      shortDescription: 'An ancient Dravidian temple in Madurai renowned for its towering multi-tiered Gopurams adorned with thousands of vibrant sculptures.',
      fullStory: `Located on the southern bank of the Vaigai River in the historic city of Madurai, the Meenakshi Sundareswarar Temple is dedicated to Goddess Meenakshi (an avatar of Parvati) and her consort Sundareswarar (Shiva).

Though mentioned in Tamil Sangam literature dating back over two millennia, the present complex was extensively rebuilt and expanded during the Nayak dynasty in the 16th and 17th centuries. The temple complex is enclosed by massive high stone walls and entered through 14 majestic Gopurams (gateway towers), the tallest rising to 52 meters.

The towers are adorned with thousands of colorful mythological stucco figures, gods, demons, and celestial beings restored every 12 years during the sacred Kumbhabhishekam festival. Inside lies the Hall of Thousand Pillars (Aayiram Kaal Mandapam), famed for carved pillars that emit musical notes when struck.`,
      latitude: 9.9195,
      longitude: 78.1193,
      coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      youtubeVideoId: 'c2eW4Y8lE6Y',
      mediaLinks: [
        {
          type: 'documentary',
          title: 'Madurai Meenakshi Amman Temple Architecture',
          youtubeUrl: 'https://www.youtube.com/watch?v=c2eW4Y8lE6Y',
          thumbnailUrl: 'https://img.youtube.com/vi/c2eW4Y8lE6Y/hqdefault.jpg',
        },
      ],
      posts: [
        {
          userId: userPriya.id,
          rating: 5,
          caption: 'The evening Aarti and procession is divine. The gopurams are bursting with color and detail.',
          imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Varanasi Ghats & Ganga Aarti',
      slug: 'varanasi-ghats',
      category: 'festival',
      state: 'Uttar Pradesh',
      shortDescription: 'One of the oldest continuously inhabited cities in the world, famous for sacred riverfront ghats and mesmerizing evening Ganga Aarti ceremonies.',
      fullStory: `Mark Twain wrote of Varanasi: "Benares is older than history, older than tradition, older even than legend, and looks twice as old as all of them put together."

The sacred city lines the western bank of the holy Ganges with 88 ghats, steps leading down to the water used for bathing, prayer ceremonies, and cremation rituals. Dashashwamedh Ghat hosts the world-renowned evening Ganga Aarti ceremony, where young priests hold multi-tiered brass oil lamps in synchronized devotion accompanied by conch shells, bells, and Vedic chants.

Other significant ghats include Assi Ghat, Manikarnika Ghat (the principal cremation ghat representing liberation/Moksha), and Harishchandra Ghat. Taking an early morning wooden boat ride reveals the mystical spiritual rhythm that has endured unchanged for thousands of years.`,
      latitude: 25.3076,
      longitude: 83.0089,
      coverImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      youtubeVideoId: 'm4X3e27r2L4',
      mediaLinks: [
        {
          type: 'song',
          title: 'Ganga Aarti Theme - Live from Dashashwamedh',
          youtubeUrl: 'https://www.youtube.com/watch?v=m4X3e27r2L4',
          thumbnailUrl: 'https://img.youtube.com/vi/m4X3e27r2L4/hqdefault.jpg',
        },
      ],
      posts: [
        {
          userId: userRahul.id,
          rating: 5,
          caption: 'Evening Ganga Aarti at Dashashwamedh Ghat will leave you spellbound. Unforgettable spiritual atmosphere.',
          imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Amer Fort',
      slug: 'amer-fort-jaipur',
      category: 'fort',
      state: 'Rajasthan',
      shortDescription: 'A majestic hilltop fort in Jaipur combining Rajput and Mughal artistry, famed for the sparkling Sheesh Mahal (Mirror Palace).',
      fullStory: `Perched high on Cheel ka Teela (Hill of Eagles) overlooking Maota Lake, Amer Fort was built in 1592 by Raja Man Singh I, one of Emperor Akbar's Navratnas (nine jewels). Constructed of red sandstone and marble, the fort displays opulent royal lifestyles.

The fort features four main courtyards: the Diwan-e-Aam (Hall of Public Audience), the Diwan-e-Khas (Private Audience), and the breathtaking Sheesh Mahal (Mirror Palace). The Sheesh Mahal was engineered so that even a single candle reflection would illuminate the entire chamber like starry night skies.

An underground secret tunnel connects Amer Fort to Jaigarh Fort, built as an escape route in times of siege. The panoramic view of the Aravalli hills and the reflection of the fort walls in Maota Lake are iconic symbols of Rajasthani pride.`,
      latitude: 26.9855,
      longitude: 75.8513,
      coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
      youtubeVideoId: 'rZcO5jWp_f0',
      mediaLinks: [
        {
          type: 'movie',
          title: 'Jodhaa Akbar - Shot at Amer Fort',
          youtubeUrl: 'https://www.youtube.com/watch?v=rZcO5jWp_f0',
          thumbnailUrl: 'https://img.youtube.com/vi/rZcO5jWp_f0/hqdefault.jpg',
        },
      ],
      posts: [
        {
          userId: userPriya.id,
          rating: 5,
          caption: 'The Sheesh Mahal mirrors are mind-blowing! Be sure to take an audio guide or local storyteller.',
          imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Qutub Minar Complex',
      slug: 'qutub-minar',
      category: 'monument',
      state: 'Delhi',
      shortDescription: 'A 72.5-meter soaring victory tower of red sandstone, the world’s tallest brick minaret alongside the 1600-year-old rust-resistant Iron Pillar.',
      fullStory: `Founded in 1192 by Qutb-ud-din Aibak after the defeat of Delhi's last Hindu kingdom and finished by his successor Iltutmish, Qutub Minar is a towering 72.5-meter minaret consisting of five distinct fluted storeys, each marked by a projecting balcony.

The lower three storeys are constructed of pale red sandstone, while the fourth and fifth storeys incorporate white marble and sandstone. The complex also houses the legendary Iron Pillar of Chandragupta II (dating to the 4th century CE), a 7-meter high metallurgical marvel that has resisted corrosion for over 1,600 years in open air.

Also in the complex are the Quwwat-ul-Islam Mosque, the Alai Darwaza gateway built by Alauddin Khalji, and the unfinished Alai Minar, which was intended to stand twice as high as the Qutub Minar.`,
      latitude: 28.5245,
      longitude: 77.1855,
      coverImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      youtubeVideoId: 'P_j5z2M3gE8',
      mediaLinks: [
        {
          type: 'documentary',
          title: 'Mystery of the Rustless Iron Pillar - Delhi',
          youtubeUrl: 'https://www.youtube.com/watch?v=P_j5z2M3gE8',
          thumbnailUrl: 'https://img.youtube.com/vi/P_j5z2M3gE8/hqdefault.jpg',
        },
      ],
      posts: [
        {
          userId: userRahul.id,
          rating: 4,
          caption: 'Beautiful green lawns surrounding the ancient sandstone tower. Great picnic and photography spot in Delhi.',
          imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
  ];

  for (const place of placesData) {
    const { mediaLinks, posts, ...placeFields } = place;
    const createdPlace = await prisma.place.create({
      data: placeFields,
    });

    if (mediaLinks && mediaLinks.length > 0) {
      await prisma.mediaLink.createMany({
        data: mediaLinks.map((m) => ({ ...m, placeId: createdPlace.id })),
      });
    }

    if (posts && posts.length > 0) {
      for (const post of posts) {
        await prisma.post.create({
          data: {
            ...post,
            placeId: createdPlace.id,
          },
        });
      }
    }
  }

  console.log(`✅ Seeded ${placesData.length} iconic heritage places with media and reviews!`);
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
