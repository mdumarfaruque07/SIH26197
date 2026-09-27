import prisma from '../src/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting comprehensive database seed for SanskritiKhoj...');

  // 1. Clean existing records in relation-safe order
  await prisma.bookmark.deleteMany();
  await prisma.post.deleteMany();
  await prisma.mediaLink.deleteMany();
  await prisma.product.deleteMany();
  await prisma.food.deleteMany();
  await prisma.artisanApplication.deleteMany();
  await prisma.place.deleteMany();
  await prisma.user.deleteMany();
  await prisma.supportTicket.deleteMany();

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

  const createdPlacesMap = {};

  for (const place of placesData) {
    const { mediaLinks, posts, ...placeFields } = place;
    const createdPlace = await prisma.place.create({
      data: placeFields,
    });
    createdPlacesMap[createdPlace.slug] = createdPlace;

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

  console.log(`✅ Seeded ${placesData.length} iconic heritage places with media and posts!`);

  // 4. Seed ODOP Handicrafts & Souvenir Products
  const tajPlace = createdPlacesMap['taj-mahal'];
  const hampiPlace = createdPlacesMap['hampi-monuments'];
  const konarkPlace = createdPlacesMap['konark-sun-temple'];
  const meenakshiPlace = createdPlacesMap['meenakshi-amman-temple'];
  const varanasiPlace = createdPlacesMap['varanasi-ghats'];
  const amerPlace = createdPlacesMap['amer-fort-jaipur'];
  const qutubPlace = createdPlacesMap['qutub-minar'];

  const productsData = [
    {
      placeId: tajPlace.id,
      name: 'Makrana Marble Inlay Floral Coasters (Parchin Kari)',
      description: 'Handcrafted by 6th generation marble artisans using authentic Makrana marble with semi-precious lapis and malachite stone inlay.',
      price: 1450,
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      artisanName: 'Ustad Rashid & Sons',
      odopTag: 'ODOP: Agra Marble Inlay',
      category: 'handicraft',
      rating: 4.9,
      shopName: 'Rashid Makrana Marble & Pietra Dura Workshop',
      shopAddress: 'Shop 14, Near Taj West Gate, Tajganj, Agra, UP - 282001',
      shopLandmark: 'Opposite Royal Gate Heritage Entry (350m from Taj Mahal)',
      shopTiming: '09:00 AM - 08:30 PM (Daily)',
      phone: '+91 98370 12345',
      whatsapp: '919837012345',
    },
    {
      placeId: varanasiPlace.id,
      name: 'Pure Katan Handloom Banarasi Silk Brocade Scarf',
      description: 'Handwoven on traditional pit looms in Varanasi with real zari floral bootis, representing centuries of sacred weaving.',
      price: 2199,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      artisanName: 'Kashi Bunkar Weavers Society',
      odopTag: 'ODOP: Banarasi Brocade & Silk',
      category: 'attire',
      rating: 4.9,
      shopName: 'Kashi Silk Weavers Heritage Emporium',
      shopAddress: 'K-22/41, Madanpura Silk Lane, Near Godowlia Chowk, Varanasi, UP - 221001',
      shopLandmark: 'Adjacent to Silk Heritage Walk (850m from Dashashwamedh Ghat)',
      shopTiming: '10:00 AM - 09:00 PM',
      phone: '+91 94152 67890',
      whatsapp: '919415267890',
    },
    {
      placeId: varanasiPlace.id,
      name: 'Brass Ganga Aarti Panchmukhi Diya (Sacred 5-Tier Lamp)',
      description: 'Solid brass ceremonial lamp identical to those used during the evening Dashashwamedh Ghat Aarti ceremonies.',
      price: 849,
      imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
      artisanName: 'Kashi Thathera Metal Guild',
      odopTag: 'ODOP: Varanasi Metal Craft',
      category: 'souvenir',
      rating: 4.8,
      shopName: 'Kashi Vishwanath Brass & Bell Metal Store',
      shopAddress: 'D-32/14, Dashashwamedh Ghat Road, Godowlia, Varanasi, Uttar Pradesh - 221001',
      shopLandmark: '70m before Dashashwamedh Ghat Main Steps',
      shopTiming: '08:00 AM - 10:00 PM (Open Every Day)',
      phone: '+91 98391 55672',
      whatsapp: '919839155672',
    },
    {
      placeId: amerPlace.id,
      name: 'Hand-Painted Blue Pottery Floral Vase',
      description: 'Traditional Jaipur blue pottery made using Egyptian paste technique, quartz powder, and natural cobalt oxide dyes.',
      price: 1250,
      imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      artisanName: 'Master Kripal Blue Art Studio',
      odopTag: 'ODOP: Jaipur Blue Pottery',
      category: 'pottery',
      rating: 4.8,
      shopName: 'Master Kripal Blue Pottery Art Emporium',
      shopAddress: 'B-18, Shiv Marg, Near Amer Road Heritage Walk, Jaipur, Rajasthan - 302002',
      shopLandmark: 'On Amer-Jaipur Heritage Boulevard, near Jal Mahal view point',
      shopTiming: '10:00 AM - 08:00 PM (Daily)',
      phone: '+91 98290 54321',
      whatsapp: '919829054321',
    },
    {
      placeId: hampiPlace.id,
      name: 'Channapatna Lacquered Stone Chariot Miniature',
      description: 'Made from ivory wood and colored with non-toxic natural turmeric, indigo and kumkum dyes by GI-certified artisans.',
      price: 650,
      imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      artisanName: 'Venkatesh Toy Crafts (Channapatna)',
      odopTag: 'GI Tagged: Channapatna Toys & Crafts',
      category: 'souvenir',
      rating: 4.8,
      shopName: 'Vijayanagara Heritage Crafts & Channapatna Studio',
      shopAddress: 'Hampi Bazaar Street, Near Virupaksha Temple Complex, Hampi, Karnataka - 583239',
      shopLandmark: '120m from Virupaksha Temple Main Entrance',
      shopTiming: '09:00 AM - 08:00 PM (Daily)',
      phone: '+91 97410 33219',
      whatsapp: '919741033219',
    },
    {
      placeId: meenakshiPlace.id,
      name: 'Handcrafted Dravidian Brass Nandi Statue',
      description: 'Lost-wax cast brass sculpture with intricate temple jewel engravings crafted in Madurai.',
      price: 1199,
      imageUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
      artisanName: 'Madurai Sthapathi Metalworks',
      odopTag: 'ODOP: Madurai Brassware',
      category: 'handicraft',
      rating: 4.9,
      shopName: 'Madurai Sthapathi Bronze & Brass Emporium',
      shopAddress: 'No. 24, South Tower Street, Near Temple Amman Sannathi, Madurai, Tamil Nadu - 625001',
      shopLandmark: '80m from Meenakshi Amman Temple South Gopuram',
      shopTiming: '08:30 AM - 09:00 PM (Open 7 Days)',
      phone: '+91 94431 87654',
      whatsapp: '919443187654',
    },
    {
      placeId: qutubPlace.id,
      name: 'Terracotta Ancient Brickwork Garden Windchime',
      description: 'Earthy hand-turned clay bells inspired by the fluted columns and Arabic inscriptions of the Qutub Minar.',
      price: 450,
      imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
      artisanName: 'Kumhar Gram Potter Collective (Delhi)',
      odopTag: 'Delhi Heritage Craft Circle',
      category: 'pottery',
      rating: 4.7,
      shopName: 'Kumhar Gram Heritage Pottery Studio',
      shopAddress: 'Gali 4, Kumhar Gram Village, Mehrauli Heritage Cluster, New Delhi - 110059',
      shopLandmark: '15 mins from Qutub Minar Complex Gate 2',
      shopTiming: '10:00 AM - 07:30 PM (Open 7 Days)',
      phone: '+91 98112 45890',
      whatsapp: '919811245890',
    },
  ];

  await prisma.product.createMany({
    data: productsData,
  });
  console.log(`✅ Seeded ${productsData.length} ODOP handicraft products in Artisan Bazaar!`);

  // 5. Seed Culinary Heritage (Foods)
  const foodsData = [
    {
      placeId: tajPlace.id,
      monumentName: 'Taj Mahal',
      name: 'Agra Petha (Kesar & Angoori)',
      nameHi: 'आगरा का पेठा (केसर व अंगूरी)',
      categoryType: 'Iconic Royal Sweet',
      categoryTypeHi: 'शाही मिष्ठान',
      diet: 'veg',
      isDeliverable: false,
      famousSince: 'Mughal Era (1632 AD)',
      shortLore: 'Created over 370 years ago in the royal kitchens of Emperor Shah Jahan to provide quick hydration and vitality to the 20,000 master stone-carvers building the Taj Mahal.',
      shortLoreHi: 'ताजमहल का निर्माण करने वाले 20,000 शिल्पकारों को ऊर्जा और स्फूर्ति प्रदान करने के लिए मुगल बादशाह शाहजहाँ की शाही रसोई में इसका आविष्कार हुआ था।',
      famousSpots: 'Panchhi Petha (Sadar Bazaar & Hari Parbat), Noori Gate Petha Bazaar, Agra',
      famousSpotsHi: 'पंछी पेठा (सदर बाज़ार व हरी पर्वत), नूरी गेट पेठा बाज़ार, आगरा',
      priceRange: '₹60 - ₹180 / 500g',
      imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
      curatedBy: 'Ministry of Tourism & Cultural Heritage Cell',
    },
    {
      placeId: tajPlace.id,
      monumentName: 'Taj Mahal',
      name: 'Agra Bedai & Crispy Jalebi with Dalmoth',
      nameHi: 'आगरा की बेड़ई-जलेबी व हींग दालमोठ',
      categoryType: 'Traditional Breakfast & Savory',
      categoryTypeHi: 'पारंपरिक नाश्ता व नमकीन',
      diet: 'veg',
      isDeliverable: false,
      famousSince: 'Colonial & Princely Agra (1880s)',
      shortLore: 'Crisp urad dal stuffed poori served with spicy potato dubki jalebi and sev dalmoth, a morning ritual for Agra locals for over a century.',
      shortLoreHi: 'उड़द दाल की खस्ता कचौरी, तीखी डुबकी आलू की सब्ज़ी और शुद्ध देसी घी की जलेबी—यह पिछले 150 वर्षों से आगरा का सबसे पसंदीदा नाश्ता है।',
      famousSpots: 'Deviram Sweets (Pratap Pura), Chimmanlal Poori Wale, Belanganj, Agra',
      famousSpotsHi: 'देवीराम स्वीट्स (प्रताप पुरा), चिम्मनलाल पूरी वाले, बेलनगंज, आगरा',
      priceRange: '₹40 - ₹80 per plate',
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      curatedBy: 'Ministry of Tourism & Cultural Heritage Cell',
    },
    {
      placeId: varanasiPlace.id,
      monumentName: 'Kashi Vishwanath & Ganga Ghats',
      name: 'Banarasi Meetha Paan',
      nameHi: 'शाही बनारसी मीठा पान',
      categoryType: 'Iconic Aromatic Digestive',
      categoryTypeHi: 'शाही सुगंधित मुखवास',
      diet: 'veg',
      isDeliverable: false,
      famousSince: 'Ancient Kashi (Mentioned in Skanda Purana)',
      shortLore: 'Prepared with fresh Maghai betel leaf, fragrant gulkand, churned fennel, menthol, and edible gold leaf—a hallmark of Kashi hospitality and cultural lore.',
      shortLoreHi: 'मघई के नर्म पत्तों, सुगन्धित गुलकंद, केसर और बनारसी मसालों से तैयार यह पान काशी की आतिथ्य सत्कार परंपरा का जीवंत प्रतीक है।',
      famousSpots: 'Keshav Tambool Bhandar (Lanka Chowk), Pehalwan Paan (Godowlia Crossing), Varanasi',
      famousSpotsHi: 'केशव तांबूल भंडार (लंका चौराहा), पहलवान पान भंडार (गोदौलिया), वाराणसी',
      priceRange: '₹30 - ₹70 per paan',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      curatedBy: 'Ministry of Tourism & Cultural Heritage Cell',
    },
    {
      placeId: varanasiPlace.id,
      monumentName: 'Kashi Vishwanath & Ganga Ghats',
      name: 'Banarasi Malaiyyo (Winter Dew Nectar)',
      nameHi: 'बनारसी मलइयो (शीतकालीन ओस मिष्ठान)',
      categoryType: 'Celestial Heritage Dessert',
      categoryTypeHi: 'पारंपरिक मौसमी मिष्ठान',
      diet: 'veg',
      isDeliverable: false,
      famousSince: '18th Century Kashi Guilds',
      shortLore: 'A delicate winter froth created by boiling milk and leaving it under the open winter night dew, then vigorously churned and garnished with saffron and pistachios.',
      shortLoreHi: 'सर्दियों की रात में खुली ओस के नीचे रखे गाढ़े दूध को मथकर बनाया जाने वाला बादलों जैसा हल्का और केसरिया मिष्ठान।',
      famousSpots: 'Thatheri Bazaar, Chowk, Chaukhamba, Varanasi',
      famousSpotsHi: 'ठठेरी बाज़ार, चौक व चौखंभा की संकरी गलियां, वाराणसी',
      priceRange: '₹50 - ₹100 per kulhad',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      curatedBy: 'Ministry of Tourism & Cultural Heritage Cell',
    },
    {
      placeId: qutubPlace.id,
      monumentName: 'Qutub Minar & Mehrauli',
      name: 'Old Delhi Nihari & Tandoori Sheermal',
      nameHi: 'पुरानी दिल्ली की निहारी व शीरमाल',
      categoryType: 'Mughal Era Slow-Cooked Stew',
      categoryTypeHi: 'मुग़लकालीन शाही पकवान',
      diet: 'non-veg',
      isDeliverable: false,
      famousSince: 'Late Mughal Era (17th Century)',
      shortLore: 'Slow-cooked overnight in sealed copper cauldrons with 40 rare spices, traditionally relished at dawn near Delhi historic minarets.',
      shortLoreHi: 'रातभर तांबे की देग में 40 दुर्लभ मसालों के साथ धीमी आंच पर पकाई जाने वाली निहारी, जिसे मीठी केसरिया शीरमाल के साथ परोसा जाता है।',
      famousSpots: 'Karim Hotel (Gali Kababian, Jama Masjid), Al Jawahar, Mehrauli Dargah Bazaar',
      famousSpotsHi: 'करीम होटल (जामा मस्जिद), अल जवाहर, महरौली दरगाह बाज़ार',
      priceRange: '₹150 - ₹350 per bowl',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      curatedBy: 'Ministry of Tourism & Cultural Heritage Cell',
    },
    {
      placeId: konarkPlace.id,
      monumentName: 'Konark Sun Temple & Puri',
      name: 'Odisha Chhena Poda & Khaja',
      nameHi: 'ओडिशा का प्रसिद्ध छेना पोड़ व खाजा',
      categoryType: 'Ancient Temple Confection',
      categoryTypeHi: 'प्राचीन मंदिर महाप्रसाद',
      diet: 'veg',
      isDeliverable: false,
      famousSince: '12th Century Ganga Dynasty',
      shortLore: 'Slow-baked caramelized cottage cheese wrapped in sal leaves, known as the cheesecake of the gods, served alongside crispy golden Jagannath Khaja.',
      shortLoreHi: 'साल के पत्तों में लपेटकर घंटों तक धीमी आंच पर बेक किया हुआ कैरेमेलाइज़्ड छेना पोड़ और पुरी का कुरकुरा खाजा।',
      famousSpots: 'Konark Temple Gate Stalls, Nayagarh Sweet Guild, Puri Bada Danda',
      famousSpotsHi: 'कोणार्क सूर्य मंदिर गेट, नयागढ़ स्वीट गिल्ड, पुरी बड़ा दांड',
      priceRange: '₹80 - ₹200 / box',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      curatedBy: 'Ministry of Tourism & Cultural Heritage Cell',
    },
    {
      placeId: amerPlace.id,
      monumentName: 'Amer Fort & Jaipur',
      name: 'Jaipuri Pyaaz Kachori & Saffron Ghewar',
      nameHi: 'जयपुर की प्याज़ कचौरी व केसरिया घेवर',
      categoryType: 'Royal Rajasthani Savory & Sweet',
      categoryTypeHi: 'शाही राजस्थानी मिष्ठान व नमकीन',
      diet: 'veg',
      isDeliverable: false,
      famousSince: '18th Century Kachwaha Kingdom',
      shortLore: 'Flaky crisp kachoris infused with spicy caramelized onions, paired with honeycombed royal Malai Ghewar prepared by royal halwais of the Pink City.',
      shortLoreHi: 'मसालेदार भुनी प्याज़ से भरी खस्ता कचौरी और केसर रबड़ी से सजा पारंपरिक राजस्थानी जालीदार घेवर।',
      famousSpots: 'Rawat Mishthan Bhandar (Station Road), LMB Sweets (Johari Bazaar), Amer Town Gate',
      famousSpotsHi: 'रावत मिष्ठान भंडार, एलएमबी स्वीट्स (जौहरी बाज़ार), आमेर टाउन गेट',
      priceRange: '₹50 - ₹160 per piece',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      curatedBy: 'Ministry of Tourism & Cultural Heritage Cell',
    },
  ];

  await prisma.food.createMany({
    data: foodsData,
  });
  console.log(`✅ Seeded ${foodsData.length} culinary heritage lore items in MySQL!`);

  // 6. Seed Artisan Applications
  const artisanAppsData = [
    {
      id: 'APP-AGR-44910',
      artisanName: 'Ustad Rashid & Sons',
      shopName: 'Rashid Makrana Marble & Pietra Dura Workshop',
      shopAddress: 'Shop 14, Near Taj West Gate, Tajganj, Agra, UP - 282001',
      shopLandmark: 'Opposite Royal Gate Heritage Entry (350m from Taj Mahal)',
      shopTiming: '09:00 AM - 08:30 PM (Daily)',
      placeId: tajPlace.id,
      monumentName: 'Taj Mahal (Agra)',
      monumentDistance: '350m',
      phone: '+91 98370 12345',
      whatsapp: '919837012345',
      pehchanId: 'UP-AGR-44910',
      cooperativeName: 'Agra Marble Artisans Guild',
      clusterLocation: 'Tajganj Heritage Cluster, Agra',
      craftType: 'Makrana Marble Inlay / Pietra Dura (पच्चीकारी)',
      status: 'APPROVED',
      activePlan: 'gold',
      submittedAt: new Date('2026-01-10T10:30:00.000Z'),
      approvedAt: new Date('2026-01-11T14:15:00.000Z'),
      verifiedBy: 'ASI Heritage Directorate (Dr. V. Sharma)',
      adminNotes: 'Physical workshop verified by Regional Tourism Officer. 100% authentic Makrana marble with semi-precious stone inlay.',
    },
    {
      id: 'APP-VAR-10842',
      artisanName: 'Kashi Bunkar Weavers Society',
      shopName: 'Kashi Silk Weavers Heritage Emporium',
      shopAddress: 'K-22/41, Madanpura Silk Lane, Near Godowlia Chowk, Varanasi, UP - 221001',
      shopLandmark: 'Adjacent to Silk Heritage Walk (850m from Dashashwamedh Ghat)',
      shopTiming: '10:00 AM - 09:00 PM',
      placeId: varanasiPlace.id,
      monumentName: 'Kashi Vishwanath & Ganga Ghats',
      monumentDistance: '850m',
      phone: '+91 94152 67890',
      whatsapp: '919415267890',
      pehchanId: 'UP-VAR-10842',
      cooperativeName: 'Varanasi Handloom Silk Weavers Samiti',
      clusterLocation: 'Madanpura & Lohta Weaving Cluster, Varanasi',
      craftType: 'Handloom Pure Silk Banarasi Saree & Brocades (बनारसी ज़री)',
      status: 'PENDING',
      activePlan: null,
      submittedAt: new Date('2026-02-01T11:00:00.000Z'),
      approvedAt: null,
      verifiedBy: 'Pending District Handicrafts Review',
      adminNotes: 'Awaiting physically signed verification deed from Varanasi District Industries Centre (DIC).',
    },
    {
      id: 'APP-JPR-20419',
      artisanName: 'Master Kripal Blue Art Studio',
      shopName: 'Master Kripal Blue Pottery Art Emporium',
      shopAddress: 'B-18, Shiv Marg, Near Amer Road Heritage Walk, Jaipur, Rajasthan - 302002',
      shopLandmark: 'On Amer-Jaipur Heritage Boulevard, near Jal Mahal view point',
      shopTiming: '10:00 AM - 08:00 PM (Daily)',
      placeId: amerPlace.id,
      monumentName: 'Amer Fort & Jaipur Heritage',
      monumentDistance: '1.2km',
      phone: '+91 98290 54321',
      whatsapp: '919829054321',
      pehchanId: 'RJ-JPR-20419',
      cooperativeName: 'Jaipur Blue Pottery Heritage Trust',
      clusterLocation: 'Kot Jewar & Amer Craft Hub, Jaipur',
      craftType: 'Traditional Jaipur Blue Pottery (क्वार्ट्ज़ व मुल्तानी मिट्टी हस्तकला)',
      status: 'PENDING',
      activePlan: null,
      submittedAt: new Date('2026-02-05T14:00:00.000Z'),
      approvedAt: null,
      verifiedBy: 'Pending District Handicrafts Review',
      adminNotes: 'Workshop photos uploaded. Pending field inspection by Rajasthan Handicrafts Development Officer.',
    },
  ];

  await prisma.artisanApplication.createMany({
    data: artisanAppsData,
  });
  console.log(`✅ Seeded ${artisanAppsData.length} artisan workshop verification applications in MySQL!`);

  // 7. Seed Sample Support Ticket
  await prisma.supportTicket.create({
    data: {
      ticketNumber: 'SK-TKT-948102-318',
      category: 'Monument Guide Audio',
      subject: 'Audio narration buffering inquiry for Amer Fort',
      description: 'Audio narration worked great at Taj Mahal, testing offline caching for Amer Fort.',
      contactEmail: 'rahul@example.com',
      contactPhone: '+91 98765 43210',
      priority: 'normal',
      status: 'OPEN',
    },
  });
  console.log('✅ Seeded sample support ticket in MySQL!');

  console.log('🎉 Comprehensive database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
