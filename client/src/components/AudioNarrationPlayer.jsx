import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AudioNarrationPlayer({ text, title, textHi, titleHi }) {
  const { lang, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!speechSupported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel(); // cancel any active narration

    const textToSpeak = lang === 'hi' && textHi ? textHi : text;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();

    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
      const hindiVoice =
        voices.find((v) => v.lang.includes('hi-IN')) ||
        voices.find((v) => v.lang.startsWith('hi')) ||
        voices.find((v) => v.lang.includes('en-IN')) ||
        voices[0];
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      utterance.lang = 'en-IN';
      const englishVoice =
        voices.find((v) => v.lang.includes('en-IN')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];
      if (englishVoice) utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if ('speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  if (!speechSupported) {
    return (
      <div className="p-3 bg-stone-100 rounded-xl text-stone-500 text-xs flex items-center gap-2">
        <VolumeX className="w-4 h-4" />
        <span>Audio narration is not supported on this browser.</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-heritage-50 via-amber-50 to-orange-50 border border-heritage-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title and Wave animation */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              isPlaying ? 'bg-heritage-500 text-white shadow-md shadow-heritage-500/30' : 'bg-heritage-100 text-heritage-700'
            }`}
          >
            <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase text-heritage-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {lang === 'hi' ? 'सांस्कृतिक ऑडियो गाइड' : 'Heritage Audio Guide'}
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-heritage-200 text-stone-600 font-medium">
                {lang === 'hi' ? 'हिंदी वाणी' : 'Native TTS'}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-stone-900 mt-0.5">
              {lang === 'hi' && titleHi ? titleHi : title || (lang === 'hi' ? 'ऐतिहासिक कथा का वाचन सुनें' : 'Listen to Story narration')}
            </h4>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 sm:self-center">
          {/* Rate Selector */}
          <select
            value={rate}
            onChange={(e) => {
              const newRate = parseFloat(e.target.value);
              setRate(newRate);
              if (isPlaying) {
                handleStop();
              }
            }}
            className="text-xs font-medium bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-stone-700 focus:outline-none focus:ring-1 focus:ring-heritage-500"
            title="Narration Speed"
          >
            <option value="0.8">0.8x</option>
            <option value="1">1.0x</option>
            <option value="1.2">1.2x</option>
          </select>

          {/* Play / Pause Button */}
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="flex items-center gap-1.5 px-4 py-2 bg-heritage-600 hover:bg-heritage-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {isPaused
                  ? (lang === 'hi' ? 'पुनः चलाएं' : 'Resume')
                  : (lang === 'hi' ? 'ऑडियो सुनें' : 'Play Audio')}
              </span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>{lang === 'hi' ? 'रोकें' : 'Pause'}</span>
            </button>
          )}

          {/* Stop Button */}
          {(isPlaying || isPaused) && (
            <button
              onClick={handleStop}
              title="Stop Narration"
              className="p-2 text-stone-500 hover:text-red-600 hover:bg-white rounded-xl border border-stone-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Visual sound bars when active */}
      {isPlaying && (
        <div className="mt-3 pt-3 border-t border-heritage-200/60 flex items-center justify-center gap-1">
          <div className="w-1 h-3 bg-heritage-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-5 bg-heritage-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-2 bg-heritage-400 rounded-full animate-bounce [animation-delay:-0.45s]"></div>
          <div className="w-1 h-6 bg-heritage-700 rounded-full animate-bounce"></div>
          <div className="w-1 h-4 bg-heritage-500 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <span className="text-[11px] text-stone-600 ml-2 font-medium">Narrating story out loud...</span>
        </div>
      )}
    </div>
  );
}
