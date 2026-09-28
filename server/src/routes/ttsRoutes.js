import express from 'express';

const router = express.Router();

// In-memory cache for synthesized audio chunks to save bandwidth and make repeat plays instant
const audioCache = new Map();
const MAX_CACHE_ENTRIES = 100;

/**
 * Split long text into natural sentence / phrase chunks (< 180 characters each)
 * suitable for Google Translate TTS.
 */
function splitTextIntoChunks(text, maxLen = 180) {
  if (!text) return [];

  // Clean markdown, multiple spaces, and special formatting
  const clean = text
    .replace(/[#*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Split on sentence boundaries (. ! ? । \n)
  const sentences = clean.split(/([।!?.\n]+)/);
  const chunks = [];
  let current = '';

  for (let i = 0; i < sentences.length; i++) {
    const part = sentences[i];
    if (!part) continue;

    if ((current + part).length <= maxLen) {
      current += part;
    } else {
      if (current.trim()) {
        chunks.push(current.trim());
      }
      // If a single part is larger than maxLen, split on comma or words
      if (part.length > maxLen) {
        const words = part.split(' ');
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).length <= maxLen) {
            sub = sub ? `${sub} ${w}` : w;
          } else {
            if (sub.trim()) chunks.push(sub.trim());
            sub = w;
          }
        }
        current = sub;
      } else {
        current = part;
      }
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * GET /api/tts
 * Query parameters:
 *  - text: text to synthesize (Hindi or English)
 *  - lang: 'hi' or 'en' (optional, auto-detected if omitted)
 */
router.get('/', async (req, res) => {
  try {
    const rawText = req.query.text;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, message: 'Text query parameter is required.' });
    }

    // Auto-detect language if not explicitly provided
    let lang = req.query.lang;
    if (!lang) {
      // Check if text contains Devanagari Unicode range
      const hasDevanagari = /[\u0900-\u097F]/.test(rawText);
      lang = hasDevanagari ? 'hi' : 'en';
    } else {
      lang = lang.toLowerCase().startsWith('hi') ? 'hi' : 'en';
    }

    const cacheKey = `${lang}:${rawText.trim()}`;
    if (audioCache.has(cacheKey)) {
      const cachedBuffer = audioCache.get(cacheKey);
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': cachedBuffer.length,
        'Cache-Control': 'public, max-age=86400',
        'X-TTS-Source': 'Cache',
      });
      return res.send(cachedBuffer);
    }

    const chunks = splitTextIntoChunks(rawText);
    if (chunks.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid text to speak.' });
    }

    // Fetch audio chunks from Google TTS
    const buffers = [];
    for (const chunk of chunks) {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        chunk
      )}&tl=${lang}&client=tw-ob`;

      const response = await fetch(ttsUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      });

      if (!response.ok) {
        throw new Error(`Google TTS returned HTTP status ${response.status}`);
      }

      const arrayBuf = await response.arrayBuffer();
      buffers.push(Buffer.from(arrayBuf));
    }

    const combinedBuffer = Buffer.concat(buffers);

    // Cache the result
    if (audioCache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = audioCache.keys().next().value;
      audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, combinedBuffer);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': combinedBuffer.length,
      'Cache-Control': 'public, max-age=86400',
      'X-TTS-Source': 'Google-Synthesis',
    });

    return res.send(combinedBuffer);
  } catch (error) {
    console.error('[TTS Error]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to synthesize speech audio.',
      error: error.message,
    });
  }
});

export default router;
