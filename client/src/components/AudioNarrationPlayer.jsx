import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, Loader2, Radio } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getApiBaseUrl } from '../services/api';

export default function AudioNarrationPlayer({ text, title, textHi, titleHi }) {
  const { lang, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(null);

  const audioRef = useRef(null);
  const speechUtteranceRef = useRef(null);

  // Clean and prepare the text to speak based on active language
  const textToSpeak = (lang === 'hi' && textHi ? textHi : text || '').trim();
  const displayTitle =
    lang === 'hi' && titleHi
      ? titleHi
      : title || (lang === 'hi' ? 'ऐतिहासिक कथा का वाचन सुनें' : 'Listen to Story narration');

  // Cancel any active speech when unmounting or text changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Update playback rate when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, [rate]);

  // Construct reliable stream URLs
  const getAudioUrl = () => {
    const baseUrl = getApiBaseUrl();
    const cleanText = textToSpeak.slice(0, 1000); // Safety limit for audio stream
    return `${baseUrl}/tts?text=${encodeURIComponent(cleanText)}&lang=${lang === 'hi' ? 'hi' : 'en'}`;
  };

  const getDirectFallbackUrl = () => {
    const cleanText = textToSpeak.slice(0, 180);
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${
      lang === 'hi' ? 'hi' : 'en'
    }&client=tw-ob`;
  };

  const handlePlay = async () => {
    setAudioError(null);

    // If currently paused in audio element, resume
    if (isPaused && audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPaused(false);
        setIsPlaying(true);
        return;
      } catch (err) {
        console.warn('Resume audio failed, restarting:', err);
      }
    }

    // Try HTML5 Audio Stream (Server Proxy or Direct Google TTS)
    setIsLoading(true);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio();
    audioRef.current = audio;
    audio.playbackRate = rate;

    // First try the local backend TTS proxy
    const primaryUrl = getAudioUrl();
    audio.src = primaryUrl;

    audio.oncanplay = () => {
      setIsLoading(false);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(0);
    };

    audio.onerror = () => {
      console.warn('Backend TTS failed, trying direct Google TTS stream fallback...');
      // Fallback 1: Direct Google Translate TTS endpoint
      const directUrl = getDirectFallbackUrl();
      audio.src = directUrl;
      audio
        .play()
        .then(() => {
          setIsLoading(false);
          setIsPlaying(true);
          setIsPaused(false);
        })
        .catch(() => {
          // Fallback 2: Browser native Web Speech API if supported
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            playViaBrowserSpeech();
          } else {
            setIsLoading(false);
            setIsPlaying(false);
            setAudioError(
              lang === 'hi'
                ? 'ऑडियो स्ट्रीम लोड नहीं हो सका। कृपया इंटरनेट जांचें।'
                : 'Could not load audio narration. Please check connection.'
            );
          }
        });
    };

    try {
      await audio.play();
      setIsLoading(false);
      setIsPlaying(true);
      setIsPaused(false);
    } catch (playErr) {
      console.warn('Audio element play blocked or failed:', playErr.message);
      // Fallback to browser SpeechSynthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        playViaBrowserSpeech();
      } else {
        setIsLoading(false);
        setIsPlaying(false);
      }
    }
  };

  const playViaBrowserSpeech = () => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      speechUtteranceRef.current = utterance;
      utterance.rate = rate;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (lang === 'hi') {
        utterance.lang = 'hi-IN';
        const hindiVoice =
          voices.find((v) => v.lang.includes('hi-IN')) ||
          voices.find((v) => v.lang.startsWith('hi')) ||
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

      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsLoading(false);
      setIsPlaying(false);
      setAudioError(
        lang === 'hi' ? 'ऑडियो प्ले करने में असमर्थ' : 'Unable to play audio narration'
      );
    }
  };

  const handlePause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border border-amber-200/80 rounded-3xl p-4 sm:p-5 shadow-sm transition-all relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        {/* Title and Wave animation */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                : 'bg-white text-amber-700 border border-amber-200 shadow-2xs'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            ) : isPlaying ? (
              <Volume2 className="w-6 h-6 animate-pulse" />
            ) : (
              <Radio className="w-6 h-6 text-amber-600" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black tracking-wider uppercase text-amber-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {lang === 'hi' ? 'सांस्कृतिक ऑडियो गाइड' : 'Heritage Audio Guide'}
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-amber-200 text-amber-800 font-bold shadow-2xs">
                {lang === 'hi' ? '🇮🇳 हिंदी वाणी' : 'Studio Voice'}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-stone-900 mt-0.5 line-clamp-1">
              {displayTitle}
            </h4>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2.5 sm:self-center flex-wrap">
          {/* Rate Selector */}
          <select
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="text-xs font-bold bg-white border border-stone-200 hover:border-amber-300 rounded-xl px-2.5 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
            title="Narration Speed"
          >
            <option value="0.8">0.8x</option>
            <option value="1">1.0x</option>
            <option value="1.2">1.2x</option>
            <option value="1.5">1.5x</option>
          </select>

          {/* Play / Pause Button */}
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'hi' ? 'लोड हो रहा है...' : 'Loading audio...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {isPaused
                      ? lang === 'hi'
                        ? 'पुनः चलाएं'
                        : 'Resume'
                      : lang === 'hi'
                      ? 'ऑडियो गाइड सुनें'
                      : 'Listen Audio'}
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>{lang === 'hi' ? 'रोकें' : 'Pause'}</span>
            </button>
          )}

          {/* Stop Button */}
          {(isPlaying || isPaused) && (
            <button
              onClick={handleStop}
              title="Stop Narration"
              className="p-2.5 text-stone-500 hover:text-rose-600 hover:bg-white rounded-2xl border border-stone-200 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Audio Error message if any */}
      {audioError && (
        <div className="mt-3 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
          <VolumeX className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{audioError}</span>
        </div>
      )}

      {/* Visual Sound Waves & Progress Bar when Active */}
      {isPlaying && (
        <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between gap-3 animate-fadeIn">
          {/* Animated sound bars */}
          <div className="flex items-center gap-1">
            <div className="w-1 h-3 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1 h-5 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.45s]" />
            <div className="w-1 h-6 bg-rose-600 rounded-full animate-bounce" />
            <div className="w-1 h-4 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.2s]" />
            <span className="text-[11px] text-stone-700 font-semibold ml-2">
              {lang === 'hi' ? 'धरोहर कथा का वाचन जारी है...' : 'Narrating heritage story out loud...'}
            </span>
          </div>

          {/* Timestamp if duration available */}
          {duration > 0 && (
            <span className="text-[10px] text-stone-500 font-bold bg-white px-2 py-0.5 rounded-md border border-amber-200">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
