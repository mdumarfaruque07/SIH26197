import prisma from '../prisma.js';

export async function getDashboardStats(req, res) {
  try {
    const [totalUsers, totalPlaces, totalPosts, totalProducts, totalArtisans, totalFoods, recentPosts] = await Promise.all([
      prisma.user.count(),
      prisma.place.count(),
      prisma.post.count(),
      prisma.product.count(),
      prisma.artisanApplication.count(),
      prisma.food.count(),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          place: { select: { name: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalPlaces,
        totalPosts,
        totalProducts,
        totalArtisans,
        totalFoods,
        recentPosts,
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
}

export async function createPlace(req, res) {
  try {
    const {
      name,
      slug: customSlug,
      category,
      state,
      shortDescription,
      fullStory,
      latitude,
      longitude,
      coverImage: bodyCoverImage,
      youtubeVideoId,
      mediaLinks,
    } = req.body;

    if (!name || !category || !shortDescription || !fullStory || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    const slug =
      customSlug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
        '-' +
        Date.now();

    let coverImage = bodyCoverImage;
    if (req.file) {
      coverImage = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    if (!coverImage) {
      coverImage = 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80';
    }

    const parsedMediaLinks = typeof mediaLinks === 'string' ? JSON.parse(mediaLinks) : mediaLinks;

    const place = await prisma.place.create({
      data: {
        name,
        slug,
        category,
        state,
        shortDescription,
        fullStory,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        coverImage,
        youtubeVideoId: youtubeVideoId || null,
        mediaLinks: parsedMediaLinks?.length
          ? {
              create: parsedMediaLinks.map((m) => ({
                type: m.type,
                title: m.title,
                youtubeUrl: m.youtubeUrl,
                thumbnailUrl: m.thumbnailUrl || null,
              })),
            }
          : undefined,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Heritage place created successfully!',
      place,
    });
  } catch (error) {
    console.error('createPlace error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create place.' });
  }
}

export async function updatePlace(req, res) {
  try {
    const placeId = parseInt(req.params.id);
    const {
      name,
      category,
      state,
      shortDescription,
      fullStory,
      latitude,
      longitude,
      coverImage: bodyCoverImage,
      youtubeVideoId,
      mediaLinks: rawMediaLinks,
    } = req.body;

    const data = {};
    if (name) data.name = name;
    if (category) data.category = category;
    if (state) data.state = state;
    if (shortDescription) data.shortDescription = shortDescription;
    if (fullStory) data.fullStory = fullStory;
    if (latitude) data.latitude = parseFloat(latitude);
    if (longitude) data.longitude = parseFloat(longitude);
    if (youtubeVideoId !== undefined) data.youtubeVideoId = youtubeVideoId;

    if (req.file) {
      data.coverImage = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (bodyCoverImage) {
      data.coverImage = bodyCoverImage;
    }

    await prisma.place.update({
      where: { id: placeId },
      data,
    });

    // Handle updating Folklore, Cinema & Melodies (mediaLinks)
    if (rawMediaLinks !== undefined) {
      let parsedMediaLinks = [];
      try {
        parsedMediaLinks = typeof rawMediaLinks === 'string' ? JSON.parse(rawMediaLinks) : rawMediaLinks;
      } catch (err) {
        console.warn('Failed to parse mediaLinks in updatePlace:', err);
      }

      if (Array.isArray(parsedMediaLinks)) {
        await prisma.mediaLink.deleteMany({ where: { placeId } });
        if (parsedMediaLinks.length > 0) {
          await prisma.mediaLink.createMany({
            data: parsedMediaLinks.map((m) => ({
              placeId,
              type: m.type || 'documentary',
              title: m.title || 'Cultural Media',
              youtubeUrl: m.youtubeUrl || '',
              thumbnailUrl: m.thumbnailUrl || null,
            })),
          });
        }
      }
    }

    const updated = await prisma.place.findUnique({
      where: { id: placeId },
      include: { mediaLinks: true },
    });

    return res.json({ success: true, message: 'Place updated successfully!', place: updated });
  } catch (error) {
    console.error('updatePlace error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update place.' });
  }
}

export async function deletePlace(req, res) {
  try {
    const placeId = parseInt(req.params.id);
    await prisma.place.delete({ where: { id: placeId } });
    return res.json({ success: true, message: 'Place deleted successfully!' });
  } catch (error) {
    console.error('deletePlace error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete place.' });
  }
}

export async function aiDiscoverCulturalLinks(req, res) {
  try {
    const { placeName, state, category } = req.body;
    if (!placeName) {
      return res.status(400).json({ success: false, message: 'placeName is required' });
    }

    const cleanName = placeName.trim();
    const cleanState = state ? state.trim() : 'India';
    const cleanCategory = category || 'heritage';

    const groqApiKey = process.env.GROQ_API_KEY;
    const requestedModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    if (groqApiKey) {
      // Prioritize requested model (openai/gpt-oss-120b), followed by account-supported fallbacks
      const candidateModels = Array.from(
        new Set([
          requestedModel,
          'openai/gpt-oss-120b',
          'openai/gpt-oss-20b',
          'qwen/qwen3.8-27b',
          'allam-2-7b',
        ])
      );

      for (const model of candidateModels) {
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: 'system',
                  content:
                    'You are an Indian cultural historian and ethnomusicologist. Return ONLY a valid JSON object matching the requested schema without markdown fences or preamble.',
                },
                {
                  role: 'user',
                  content: `Provide authentic cultural associations for the heritage place "${cleanName}" located in "${cleanState}" (Category: "${cleanCategory}").
Return a JSON object with this exact structure:
{
  "shortDescription": "A compelling 2-line summary of the place.",
  "fullStory": "A detailed 3-paragraph historical narrative covering founding history, architectural style, and sacred/cultural folklore.",
  "youtubeVideoId": "11-character YouTube video ID of a popular documentary or virtual tour if known, or 'i9E_Bl4E6nE'",
  "mediaLinks": [
    {
      "type": "movie",
      "title": "Movie title shot here or inspired by this place",
      "youtubeUrl": "https://www.youtube.com/results?search_query=${encodeURIComponent(cleanName + ' movie')}",
      "thumbnailUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80"
    },
    {
      "type": "song",
      "title": "Iconic traditional song or melody associated with this site",
      "youtubeUrl": "https://www.youtube.com/results?search_query=${encodeURIComponent(cleanName + ' song')}",
      "thumbnailUrl": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80"
    },
    {
      "type": "documentary",
      "title": "Documentary or architectural tour",
      "youtubeUrl": "https://www.youtube.com/results?search_query=${encodeURIComponent(cleanName + ' documentary')}",
      "thumbnailUrl": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80"
    }
  ]
}`,
                },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.3,
            }),
          });

          if (groqRes.ok) {
            const groqData = await groqRes.json();
            const rawContent = groqData.choices?.[0]?.message?.content;
            if (rawContent) {
              const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleanJson);
              return res.json({ success: true, source: `groq-ai (${model})`, data: parsed });
            }
          } else {
            const errBody = await groqRes.text();
            console.warn(`Groq model ${model} unavailable (${errBody}), trying next model...`);
          }
        } catch (modelErr) {
          console.warn(`Error querying model ${model}:`, modelErr.message);
        }
      }
    }

    // Curated Cultural Discovery Heuristic Engine
    const encoded = encodeURIComponent(`${cleanName} ${cleanState}`);

    const heuristicData = {
      shortDescription: `${cleanName} is an iconic ${category || 'heritage'} site in ${cleanState}, revered for its historical grandeur and timeless cultural folklore.`,
      fullStory: `${cleanName}, situated in ${cleanState}, stands as an awe-inspiring testament to India's deep spiritual and architectural heritage. Commissioned and preserved across multiple dynasties, this celebrated landmark embodies centuries of devotional traditions, royal patronage, and exquisite stone craftsmanship.\n\nThe site features distinctive traditional architectural idioms, intricate sculptural motifs, and sacred geometry designed to harmonize with cosmic alignments. Travelers and scholars through the centuries have documented the captivating atmosphere that pervades every courtyard and sanctum.\n\nIn contemporary culture, ${cleanName} remains an enduring beacon of cultural pride, celebrated in local songs, cinema, and living folklore that connects generations of visitors to India's living past.`,
      youtubeVideoId: 'i9E_Bl4E6nE',
      mediaLinks: [
        {
          type: 'documentary',
          title: `${cleanName} - Historical Documentary & Architectural Tour`,
          youtubeUrl: `https://www.youtube.com/results?search_query=${encoded}+documentary`,
          thumbnailUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80',
        },
        {
          type: 'song',
          title: `Traditional Folk Melodies & Devotional Anthems of ${cleanState}`,
          youtubeUrl: `https://www.youtube.com/results?search_query=${encoded}+folk+songs`,
          thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
        },
        {
          type: 'movie',
          title: `Cinematic Legends & Stories Inspired by ${cleanName}`,
          youtubeUrl: `https://www.youtube.com/results?search_query=${encoded}+movie+scenes`,
          thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
        },
      ],
    };

    return res.json({ success: true, source: 'ai-heritage-engine', data: heuristicData });
  } catch (error) {
    console.error('aiDiscoverCulturalLinks error:', error);
    return res.status(500).json({ success: false, message: 'AI discovery failed.' });
  }
}

