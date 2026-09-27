import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Brand & Header
    portalTitle: 'संस्कृति Khoj',
    portalSubtitle: 'National Heritage & Culture Portal',
    cultureFeed: 'Culture Feed',
    heritageMap: 'Heritage Map',
    odopBazaar: 'ODOP Bazaar',
    savedBucketList: 'Saved Bucket List',
    postVisit: 'Post Visit',
    login: 'Login',
    join: 'Join',
    guest: 'Guest Tourist',
    searchPlaceholder: 'Search monuments, forts, temples, states...',
    
    // Radar & Location
    radarNearest: 'Nearest Cultural Heritage Detected',
    radarDistance: 'away from your location',
    radarCalculated: 'Calculated using real-time GPS & Haversine model',
    radarExploreNow: 'Explore Monument',
    scanMonumentQR: 'Scan Monument QR',
    heritagePassport: 'Heritage Passport',
    
    // Categories & Filters
    allCategories: 'All Categories',
    monuments: 'Monuments',
    temples: 'Temples',
    forts: 'Forts & Palaces',
    culture: 'Living Culture & Ghats',
    curatedPlaces: 'curated cultural heritage destinations across India',
    
    // Feed & Details
    listenAudio: 'AI Audio Guide',
    playingAudio: 'Playing Narration...',
    pauseAudio: 'Pause Audio',
    verifiedVisitors: 'Verified Tourist Photos',
    craftsUnderMonument: 'Local ODOP Handicrafts from this Region',
    buyFromArtisan: 'Support Artisan',
    viewDetails: 'Read Full Lore & Media',
    addToBucketList: 'Bookmark',
    saved: 'Saved',
    
    // Audio Player
    audioVoice: 'English (Indian Accent)',
    
    // Camera & Upload
    takeLivePhoto: 'Take Live Photo (Camera)',
    chooseGallery: 'Choose from Gallery',
    shareExperience: 'Share your visit & rate the monument',
    
    // Bottom Nav
    navFeed: 'Feed',
    navMap: 'Radar',
    navSearch: 'Search',
    navBazaar: 'ODOP',
    navAccount: 'Account',
  },
  hi: {
    // Brand & Header
    portalTitle: 'संस्कृति खोज',
    portalSubtitle: 'राष्ट्रीय सांस्कृतिक धरोहर एवं शिल्प पोर्टल',
    cultureFeed: 'धरोहर फ़ीड',
    heritageMap: 'धरोहर मानचित्र',
    odopBazaar: 'ओडीओपी बाज़ार',
    savedBucketList: 'सहेजे गए स्थल',
    postVisit: 'फोटो साझा करें',
    login: 'लॉग इन',
    join: 'शामिल हों',
    guest: 'अतिथि पर्यटक',
    searchPlaceholder: 'स्मारक, किले, मंदिर, राज्य खोजें...',
    
    // Radar & Location
    radarNearest: 'निकटतम सांस्कृतिक धरोहर पहचानी गई',
    radarDistance: 'आपकी वर्तमान लोकेशन से दूर',
    radarCalculated: 'लाइव जीपीएस एवं दूरी मॉडल द्वारा सटीक गणना',
    radarExploreNow: 'स्मारक देखें',
    scanMonumentQR: 'स्मारक क्यूआर स्कैन करें',
    heritagePassport: 'धरोहर पासपोर्ट',
    
    // Categories & Filters
    allCategories: 'सभी श्रेणियां',
    monuments: 'ऐतिहासिक स्मारक',
    temples: 'पवित्र मंदिर',
    forts: 'किले एवं महल',
    culture: 'जीवंत संस्कृति एवं घाट',
    curatedPlaces: 'पूरे भारत के प्रमुख सांस्कृतिक और ऐतिहासिक धरोहर स्थल',
    
    // Feed & Details
    listenAudio: 'ऑडियो गाइड सुनें',
    playingAudio: 'गाइड चल रहा है...',
    pauseAudio: 'गाइड रोकें',
    verifiedVisitors: 'सत्यापित पर्यटकों की तस्वीरें',
    craftsUnderMonument: 'इस क्षेत्र के प्रसिद्ध ओडीओपी पारंपरिक हस्तशिल्प',
    buyFromArtisan: 'शिल्पकार से खरीदें',
    viewDetails: 'विस्तृत कथा एवं वीडियो',
    addToBucketList: 'सहेजें',
    saved: 'सहेजा गया',
    
    // Audio Player
    audioVoice: 'हिंदी (भारतीय वाणी)',
    
    // Camera & Upload
    takeLivePhoto: 'कैमरा से लाइव फोटो लें',
    chooseGallery: 'गैलरी से चुनें',
    shareExperience: 'अपनी यात्रा का अनुभव साझा करें और रेटिंग दें',
    
    // Bottom Nav
    navFeed: 'होम',
    navMap: 'रडार',
    navSearch: 'खोजें',
    navBazaar: 'बाज़ार',
    navAccount: 'खाता',
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('sanskriti_lang') || localStorage.getItem('sih_app_lang') || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    localStorage.setItem('sanskriti_lang', nextLang);
  };

  const setSpecificLanguage = (newLang) => {
    if (newLang === 'en' || newLang === 'hi') {
      setLang(newLang);
      localStorage.setItem('sanskriti_lang', newLang);
    }
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setSpecificLanguage, setLang: setSpecificLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
