import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const foodFilePath = path.join(__dirname, '../../uploads/culinary_heritage.json');

const INITIAL_FOOD_DATA = [
  {
    id: 1,
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
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 2,
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
    createdAt: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 3,
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
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 4,
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
    createdAt: '2026-01-18T10:00:00.000Z',
  },
  {
    id: 5,
    placeId: 2, // Qutub Minar / Delhi
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
    createdAt: '2026-01-20T10:00:00.000Z',
  },
  {
    id: 6,
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
    createdAt: '2026-01-22T10:00:00.000Z',
  },
  {
    id: 7,
    placeId: 4, // Amer Fort / Jaipur
    alternatePlaceIds: [4, 13],
    monumentSlug: 'amer-fort-jaipur',
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
    createdAt: '2026-01-25T10:00:00.000Z',
  },
  {
    id: 8,
    placeId: 6, // Madurai
    alternatePlaceIds: [6, 11],
    monumentSlug: 'meenakshi-amman-temple',
    monumentName: 'Meenakshi Amman Temple',
    name: 'Royal Madurai Jigarthanda & Bun Parotta',
    nameHi: 'मदुरै प्रसिद्ध शाही जिगरठंडा व बन परोटा',
    categoryType: 'Royal Cooling Elixir & Temple Delicacy',
    categoryTypeHi: 'शाही पेय व मदुरै व्यंजन',
    diet: 'veg',
    isDeliverable: false,
    famousSince: 'Nayaka Dynasty Era',
    shortLore: 'A soothing dessert drink prepared with almond gum, reduced caramelized milk and sarsaparilla root syrup, followed by multi-layered buttery Bun Parotta.',
    shortLoreHi: 'बादाम गोंद और नन्नारी की जड़ों से धीमी आंच पर तैयार मदुरै का प्रसिद्ध शाही पेय और खस्ता बन परोटा।',
    famousSpots: 'Famous Jigarthanda (East Marret Street), Murugan Idli Shop, West Tower Bazaar, Madurai',
    famousSpotsHi: 'फेमस जिगरठंडा (ईस्ट मैरेट स्ट्रीट), मुरुगन इडली शॉप, वेस्ट टावर बाज़ार',
    priceRange: '₹60 - ₹120 per glass',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    curatedBy: 'Ministry of Tourism & Cultural Heritage Cell',
    createdAt: '2026-01-28T10:00:00.000Z',
  },
  {
    id: 9,
    placeId: 7, // Hampi
    alternatePlaceIds: [7, 9],
    monumentSlug: 'hampi-monuments',
    monumentName: 'Group of Monuments at Hampi',
    name: 'Karnataka Bisi Bele Bath & Filter Kaapi',
    nameHi: 'कर्नाटक पारंपरिक बिसी बेले बाथ व फ़िल्टर कॉफ़ी',
    categoryType: 'Vijayanagara Empire Thali Food',
    categoryTypeHi: 'पारंपरिक दक्षिण भारतीय व्यंजन',
    diet: 'veg',
    isDeliverable: false,
    famousSince: 'Vijayanagara Era (14th Century)',
    shortLore: 'A rich, spicy rice-lentil blend simmered with local tamarind, nutmeg, ghee and country vegetables, concluded with frothy chicory-infused brass tumbler filter coffee.',
    shortLoreHi: 'इमली, दाल, देशी घी और मसालों के साथ धीमी आंच पर पकाया जाने वाला स्वादिष्ट चावल और पीतल के लोटे में परोसी जाने वाली झागदार फ़िल्टर कॉफ़ी।',
    famousSpots: 'Mango Tree Restaurant (Hampi Bazaar), Kamath Hotel, Kamalapura Heritage Road',
    famousSpotsHi: 'मैंगो ट्री रेस्टोरेंट (हम्पी बाज़ार), कामत होटल, कमलापुरा हेरिटेज रोड',
    priceRange: '₹70 - ₹150 per plate',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    curatedBy: 'Ministry of Tourism & Cultural Heritage Cell',
    createdAt: '2026-02-01T10:00:00.000Z',
  }
];

const ensureStorage = () => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(foodFilePath)) {
    fs.writeFileSync(foodFilePath, JSON.stringify(INITIAL_FOOD_DATA, null, 2));
  }
};

const readFoodItems = () => {
  try {
    ensureStorage();
    const data = fs.readFileSync(foodFilePath, 'utf-8');
    const parsed = JSON.parse(data || '[]');
    return parsed.length > 0 ? parsed : INITIAL_FOOD_DATA;
  } catch (err) {
    console.error('Error reading culinary items:', err);
    return INITIAL_FOOD_DATA;
  }
};

const writeFoodItems = (items) => {
  try {
    ensureStorage();
    fs.writeFileSync(foodFilePath, JSON.stringify(items, null, 2));
  } catch (err) {
    console.error('Error writing culinary items:', err);
  }
};

// GET all food items (with optional filters)
export const getAllFood = async (req, res) => {
  try {
    const { placeId, search, diet } = req.query;
    let items = readFoodItems();

    if (placeId) {
      items = items.filter((f) => String(f.placeId) === String(placeId));
    }
    if (diet && diet !== 'all') {
      items = items.filter((f) => f.diet === diet);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.nameHi && f.nameHi.includes(q)) ||
          f.monumentName.toLowerCase().includes(q) ||
          f.shortLore.toLowerCase().includes(q) ||
          f.famousSpots.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      count: items.length,
      foods: items,
      notice: 'Non-deliverable regional culinary heritage. For on-site tourism discovery only.',
    });
  } catch (error) {
    console.error('getAllFood error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch food heritage items.' });
  }
};

// GET food by place ID
export const getFoodByPlace = async (req, res) => {
  try {
    const rawPlaceId = req.params.placeId;
    const { slug, name } = req.query;
    const pid = parseInt(rawPlaceId, 10);
    const items = readFoodItems();

    let matches = items.filter((f) => {
      if (f.placeId === pid || (f.alternatePlaceIds && f.alternatePlaceIds.includes(pid))) {
        return true;
      }
      if (slug && f.monumentSlug && f.monumentSlug.includes(slug)) {
        return true;
      }
      if (name && f.monumentName && f.monumentName.toLowerCase().includes(name.toLowerCase())) {
        return true;
      }
      return false;
    });

    if (matches.length === 0) {
      if (slug?.includes('taj') || name?.toLowerCase().includes('taj') || pid === 1 || pid === 8) {
        matches = items.filter((f) => f.monumentName?.toLowerCase().includes('taj'));
      } else if (slug?.includes('varanasi') || name?.toLowerCase().includes('varanasi') || slug?.includes('kashi') || pid === 5 || pid === 12) {
        matches = items.filter((f) => f.monumentName?.toLowerCase().includes('kashi') || f.monumentName?.toLowerCase().includes('varanasi'));
      } else if (slug?.includes('qutub') || name?.toLowerCase().includes('qutub') || pid === 2 || pid === 14) {
        matches = items.filter((f) => f.monumentName?.toLowerCase().includes('qutub') || f.monumentName?.toLowerCase().includes('delhi'));
      } else if (slug?.includes('konark') || name?.toLowerCase().includes('konark') || pid === 3 || pid === 10) {
        matches = items.filter((f) => f.monumentName?.toLowerCase().includes('konark') || f.monumentName?.toLowerCase().includes('puri'));
      }
    }

    return res.json({
      success: true,
      count: matches.length,
      foods: matches,
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

    const items = readFoodItems();
    const newId = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;

    const newFood = {
      id: newId,
      placeId: parseInt(placeId),
      monumentName: monumentName || 'Heritage Monument',
      name: name.trim(),
      nameHi: nameHi?.trim() || '',
      categoryType,
      categoryTypeHi,
      diet: diet === 'non-veg' ? 'non-veg' : 'veg',
      isDeliverable: false, // EXPLICIT SECURITY: Never deliverable
      famousSince: famousSince.trim(),
      shortLore: shortLore.trim(),
      shortLoreHi: shortLoreHi.trim(),
      famousSpots: famousSpots.trim(),
      famousSpotsHi: famousSpotsHi.trim(),
      priceRange: priceRange.trim(),
      imageUrl:
        finalImageUrl ||
        'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
      curatedBy: `Government Admin (${req.user?.email || 'admin'})`,
      createdAt: new Date().toISOString(),
    };

    items.unshift(newFood);
    writeFoodItems(items);

    console.log(`[Food Heritage] Admin created culinary item: ${newFood.name} for Place ID ${placeId}`);

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
    let items = readFoodItems();
    const existingIndex = items.findIndex((f) => f.id === id);

    if (existingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    items.splice(existingIndex, 1);
    writeFoodItems(items);

    return res.json({ success: true, message: 'Food item removed successfully.' });
  } catch (error) {
    console.error('deleteFoodItem error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete food item.' });
  }
};
