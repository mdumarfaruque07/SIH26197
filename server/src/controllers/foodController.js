import prisma from '../prisma.js';

export const INITIAL_FOOD_DATA = [
  {
    placeId: 1, // Taj Mahal
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
    placeId: 1, // Taj Mahal
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
    placeId: 5, // Varanasi / Ghats
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
    placeId: 5, // Varanasi
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
    placeId: 2, // Qutub Minar
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
    placeId: 3, // Konark Sun Temple
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
    placeId: 4, // Amer Fort
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

// GET all foods with filters
export const getAllFoods = async (req, res) => {
  try {
    const { placeId, diet, search } = req.query;

    const where = {};
    if (placeId) {
      where.placeId = parseInt(placeId);
    }
    if (diet && diet !== 'all') {
      where.diet = diet;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameHi: { contains: search } },
        { monumentName: { contains: search } },
        { famousSpots: { contains: search } },
      ];
    }

    const foods = await prisma.food.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        place: {
          select: { id: true, name: true, slug: true, state: true },
        },
      },
    });

    return res.json({
      success: true,
      count: foods.length,
      foods,
      notice: 'Non-deliverable regional culinary heritage. For on-site tourism discovery only.',
    });
  } catch (error) {
    console.error('getAllFoods error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch culinary heritage.' });
  }
};

// GET food by placeId
export const getFoodByPlace = async (req, res) => {
  try {
    const placeId = parseInt(req.params.placeId);
    if (!placeId) {
      return res.status(400).json({ success: false, message: 'Invalid placeId.' });
    }

    const foods = await prisma.food.findMany({
      where: { placeId },
      orderBy: { createdAt: 'desc' },
      include: {
        place: {
          select: { id: true, name: true, slug: true, state: true },
        },
      },
    });

    return res.json({
      success: true,
      count: foods.length,
      foods,
      notice: 'Non-deliverable regional culinary heritage. For on-site tourism discovery only.',
    });
  } catch (error) {
    console.error('getFoodByPlace error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch place foods.' });
  }
};

// POST create food item (ADMIN ONLY)
export const createFoodItem = async (req, res) => {
  try {
    const {
      placeId,
      monumentName,
      name,
      nameHi,
      categoryType = 'Iconic Regional Delicacy',
      categoryTypeHi = 'प्रसिद्ध स्थानीय पकवान',
      diet = 'veg',
      famousSince = 'Traditional Lore',
      shortLore = '',
      shortLoreHi = '',
      famousSpots = '',
      famousSpotsHi = '',
      priceRange = '₹50 - ₹150',
      imageUrl,
    } = req.body;

    if (!name || !placeId) {
      return res.status(400).json({
        success: false,
        message: 'Food name and associated heritage place are required.',
      });
    }

    let finalImageUrl = imageUrl;
    if (req.file) {
      finalImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const newFood = await prisma.food.create({
      data: {
        placeId: parseInt(placeId),
        monumentName: monumentName || 'Heritage Monument',
        name: name.trim(),
        nameHi: nameHi?.trim() || null,
        categoryType,
        categoryTypeHi: categoryTypeHi || null,
        diet: diet === 'non-veg' ? 'non-veg' : 'veg',
        isDeliverable: false, // Never deliverable
        famousSince: famousSince?.trim() || null,
        shortLore: shortLore?.trim() || '',
        shortLoreHi: shortLoreHi?.trim() || null,
        famousSpots: famousSpots?.trim() || '',
        famousSpotsHi: famousSpotsHi?.trim() || null,
        priceRange: priceRange?.trim() || null,
        imageUrl:
          finalImageUrl ||
          'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
        curatedBy: `Government Admin (${req.user?.email || 'admin'})`,
      },
    });

    console.log(`[Food Heritage] Admin created culinary item in MySQL: ${newFood.name} for Place ID ${placeId}`);

    return res.status(201).json({
      success: true,
      message: 'Culinary heritage item added successfully by Admin.',
      food: newFood,
    });
  } catch (error) {
    console.error('createFoodItem error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add food item.' });
  }
};

// DELETE food item (ADMIN ONLY)
export const deleteFoodItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.food.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Food item removed successfully from MySQL.' });
  } catch (error) {
    console.error('deleteFoodItem error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete food item.' });
  }
};
