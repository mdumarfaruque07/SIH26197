import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  X,
  Volume2,
  MapPin,
  ArrowRight,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scrollLock';

export const HERITAGE_STORIES = [
  {
    id: 'taj-mahal',
    slug: 'taj-mahal',
    name: 'Taj Mahal',
    nameHi: 'ताज महल',
    location: 'Agra, UP',
    previewImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
    fullImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    storyFact: 'Did you know? Makrana marble shifts colors from soft blush rose at dawn to gleaming pearl white under the midday sun, and golden amber under the full moon.',
    storyFactHi: 'क्या आप जानते हैं? मकराना संगमरमर सुबह के समय हल्का गुलाबी, दोपहर में चमकीला श्वेत और पूर्णिमा की रात सुनहरी चमक बिखेरता है।',
    tag: 'Architectural Wonder',
  },
  {
    id: 'varanasi-ghats',
    slug: 'varanasi-ghats',
    name: 'Ganga Aarti',
    nameHi: 'गंगा आरती',
    location: 'Varanasi, UP',
    previewImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80',
    fullImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    storyFact: 'Every evening at Dashashwamedh Ghat, seven young priests perform the choreographed Maha Aarti with massive 108-wick brass lamps weighing over 4.5 kg.',
    storyFactHi: 'दशाश्वमेध घाट पर हर शाम 7 पुजारी 4.5 किलोग्राम भारी 108 ज्योतियों वाले पीतल के दीपकों से भव्य महाआरती संपन्न करते हैं।',
    tag: 'Spiritual Legacy',
  },
  {
    id: 'amer-fort',
    slug: 'amer-fort',
    name: 'Amer Fort',
    nameHi: 'आमेर किला',
    location: 'Jaipur, RJ',
    previewImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    fullImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    storyFact: 'The Sheesh Mahal (Mirror Palace) was designed with convex mirrors from Belgium so a single flickering oil lamp could illuminate the entire royal bedchamber.',
    storyFactHi: 'शीश महल में बेल्जियम से लाए गए उत्तल दर्पण इस तरह लगाए गए थे कि एक दीपक की लौ से पूरा शाही कक्ष तारों की तरह जगमगा उठता था।',
    tag: 'Royal Fortress',
  },
  {
    id: 'konark-sun-temple',
    slug: 'konark-sun-temple',
    name: 'Konark Temple',
    nameHi: 'कोणार्क मंदिर',
    location: 'Puri, Odisha',
    previewImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80',
    fullImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
    storyFact: 'The 24 carved stone wheels are precise astronomical sundials. The shadow cast on the wheel spokes reveals time accurately within 3 minutes.',
    storyFactHi: '24 नक्काशीदार पहिए अचूक धूपघड़ी हैं। पहियों के आरों पर पड़ने वाली छाया से 3 मिनट की शुद्धता से समय का पता चलता है।',
    tag: 'Ancient Science',
  },
  {
    id: 'group-of-monuments-at-hampi',
    slug: 'group-of-monuments-at-hampi',
    name: 'Hampi Ruins',
    nameHi: 'हम्पी अवशेष',
    location: 'Ballari, KA',
    previewImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80',
    fullImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    storyFact: 'The 56 musical pillars of the Vittala Temple emit musical notes corresponding to traditional Indian instruments (Mridangam, Veena) when lightly tapped.',
    storyFactHi: 'विट्ठल मंदिर के 56 संगीतमय स्तंभों पर हल्के से थपकी देने पर वीणा और मृदंग जैसे शास्त्रीय वाद्ययंत्रों की मधुर स्वर लहरियां गूंजती हैं।',
    tag: 'Vijayanagara Empire',
  },
  {
    id: 'meenakshi-amman-temple',
    slug: 'meenakshi-amman-temple',
    name: 'Meenakshi',
    nameHi: 'मीनाक्षी मंदिर',
    location: 'Madurai, TN',
    previewImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    fullImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    storyFact: 'Contains 14 towering Gopurams covered with more than 33,000 colorful mythological stucco figures, ritually repainted every 12 years.',
    storyFactHi: '14 भव्य गोपुरमों पर 33,000 से अधिक रंगीन पौराणिक मूर्तियां उत्कीर्ण हैं, जिन्हें हर 12 वर्ष में कुंभाभिषेकम के दौरान रंगा जाता है।',
    tag: 'Dravidian Marvel',
  },
  {
    id: 'qutub-minar-complex',
    slug: 'qutub-minar-complex',
    name: 'Qutub Minar',
    nameHi: 'कुतुब मीनार',
    location: 'New Delhi',
    previewImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    fullImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    storyFact: 'The 1,600-year-old Iron Pillar standing in the courtyard has baffled metallurgists worldwide because it has completely resisted rusting since the Gupta era.',
    storyFactHi: 'प्रांगण में खड़ा 1600 वर्ष पुराना गुप्तकालीन लौह स्तंभ आज तक जंग-रहित है, जो प्राचीन भारतीय धातु विज्ञान का एक अनुपम रहस्य है।',
    tag: 'Sandstone Minaret',
  },
];

export default function InstagramStoryBar({ onOpenPostModal }) {
  const { lang } = useLanguage();
  const [activeStoryIdx, setActiveStoryIdx] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeStory = activeStoryIdx !== null ? HERITAGE_STORIES[activeStoryIdx] : null;

  // Bulletproof body scroll locking & bottom navigation bar hiding
  useEffect(() => {
    const isStoryOpen = activeStoryIdx !== null;
    if (isStoryOpen) {
      lockBodyScroll();
      window.dispatchEvent(
        new CustomEvent('sanskriti_story_toggle', { detail: { open: true } })
      );
    } else {
      unlockBodyScroll();
      window.dispatchEvent(
        new CustomEvent('sanskriti_story_toggle', { detail: { open: false } })
      );
    }
    return () => {
      if (isStoryOpen) {
        unlockBodyScroll();
        window.dispatchEvent(
          new CustomEvent('sanskriti_story_toggle', { detail: { open: false } })
        );
      }
    };
  }, [activeStoryIdx]);

  // Story progression logic
  const nextStory = () => {
    setProgress(0);
    if (activeStoryIdx !== null && activeStoryIdx < HERITAGE_STORIES.length - 1) {
      setActiveStoryIdx(activeStoryIdx + 1);
    } else {
      setActiveStoryIdx(null);
    }
  };

  const prevStory = () => {
    setProgress(0);
    if (activeStoryIdx !== null && activeStoryIdx > 0) {
      setActiveStoryIdx(activeStoryIdx - 1);
    }
  };

  // Auto-progress stories every 5.5 seconds (paused when user presses or touches screen)
  useEffect(() => {
    if (activeStoryIdx === null || isPaused) return;

    setProgress(0);
    const intervalMs = 50;
    const totalMs = 5500;
    const step = (intervalMs / totalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [activeStoryIdx, isPaused]);

  return (
    <div className="w-full">
      {/* Story Bubbles Row */}
      <div className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-2 px-1">
        {/* "Your Story" / Add Post Trigger */}
        <button
          onClick={onOpenPostModal}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
        >
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2px] bg-stone-200 group-hover:bg-amber-500 transition-colors">
            <div className="w-full h-full rounded-full bg-stone-100 flex items-center justify-center border-2 border-white overflow-hidden">
              <span className="font-serif font-black text-heritage-700 text-lg">सं</span>
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-heritage-600 text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-xs">
              +
            </div>
          </div>
          <span className="text-[11px] font-semibold text-stone-700 max-w-[68px] truncate">
            {lang === 'hi' ? 'मेरी पोस्ट' : 'Your Memory'}
          </span>
        </button>

        {/* Heritage Monument Stories */}
        {HERITAGE_STORIES.map((story, idx) => (
          <button
            key={story.id}
            onClick={() => {
              setProgress(0);
              setActiveStoryIdx(idx);
            }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            {/* Instagram Gradient Ring */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full rounded-full p-[2px] bg-white">
                <img
                  src={story.previewImage}
                  alt={story.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-stone-800 max-w-[72px] truncate group-hover:text-heritage-600 transition-colors">
              {lang === 'hi' ? story.nameHi : story.name}
            </span>
          </button>
        ))}
      </div>

      {/* Full-Screen Instagram Story Viewer Modal (Portaled directly to document.body) */}
      {activeStory &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black sm:bg-black/95 sm:backdrop-blur-md animate-fadeIn overscroll-contain touch-none select-none"
            onTouchMove={(e) => e.preventDefault()}
          >
            {/* Story Phone Canvas (Full screen on mobile, aesthetic phone frame on desktop) */}
            <div
              className="relative w-full h-full sm:h-[92vh] sm:max-w-md sm:rounded-3xl bg-stone-950 overflow-hidden shadow-2xl flex flex-col justify-between border-0 sm:border sm:border-stone-800"
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {/* Top Story Progress Bar */}
              <div className="absolute top-0 inset-x-0 z-30 p-3 pt-3.5 flex items-center gap-1 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
                {HERITAGE_STORIES.map((s, i) => (
                  <div
                    key={s.id}
                    className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"
                  >
                    <div
                      className="h-full bg-white transition-all"
                      style={{
                        width:
                          i < activeStoryIdx
                            ? '100%'
                            : i === activeStoryIdx
                            ? `${progress}%`
                            : '0%',
                        transitionDuration: i === activeStoryIdx ? '50ms' : '200ms',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Header: Monument Name & Close Button */}
              <div className="absolute top-5 inset-x-0 z-30 px-4 pt-2 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStory.previewImage}
                    alt={activeStory.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-amber-400"
                  />
                  <div>
                    <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                      <span>{lang === 'hi' ? activeStory.nameHi : activeStory.name}</span>
                      <span className="text-[10px] bg-amber-500/80 px-1.5 py-0.2 rounded-md font-semibold text-white">
                        Story
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{activeStory.location}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStoryIdx(null)}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer border border-white/20 active:scale-95"
                  aria-label="Close story"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Story Main Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={activeStory.fullImage}
                  alt={activeStory.name}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/40" />

                {/* Left/Right Tap Zones for Story Navigation */}
                <button
                  type="button"
                  onClick={prevStory}
                  disabled={activeStoryIdx === 0}
                  className="absolute left-0 inset-y-0 w-1/3 z-20 focus:outline-none cursor-pointer"
                  aria-label="Previous story"
                />
                <button
                  type="button"
                  onClick={nextStory}
                  className="absolute right-0 inset-y-0 w-2/3 z-20 focus:outline-none cursor-pointer"
                  aria-label="Next story"
                />
              </div>

              {/* Story Bottom Fact Card */}
              <div className="absolute bottom-0 inset-x-0 z-30 p-5 pb-6 sm:pb-5 space-y-3 bg-gradient-to-t from-black via-black/85 to-transparent text-white">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeStory.tag}</span>
                </div>

                <p className="text-sm font-medium leading-relaxed text-stone-200">
                  "{lang === 'hi' ? activeStory.storyFactHi : activeStory.storyFact}"
                </p>

                {/* Action Buttons: View Full Monument Chronicles */}
                <div className="pt-1 flex items-center gap-2">
                  <Link
                    to={`/place/${activeStory.slug}`}
                    onClick={() => setActiveStoryIdx(null)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:opacity-95 text-white rounded-2xl text-xs font-bold shadow-lg transition-all active:scale-95"
                  >
                    <span>
                      {lang === 'hi'
                        ? 'पूरी धरोहर कथा एवं ऑडियो गाइड'
                        : 'Explore Full Lore & Audio'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/map"
                    onClick={() => setActiveStoryIdx(null)}
                    className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors active:scale-95"
                    title="View on Map"
                  >
                    <MapPin className="w-4 h-4 text-amber-300" />
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
