import prisma from '../prisma.js';

function formatTimeAgo(date) {
  if (!date) return 'Recently';
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export async function createPost(req, res) {
  try {
    let userId = req.user?.id;
    if (userId) {
      const u = await prisma.user.findUnique({ where: { id: userId } });
      if (!u) userId = null;
    }
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) {
        userId = defaultUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            name: 'Culture Explorer',
            email: `traveler_${Date.now()}@heritage.gov.in`,
            passwordHash: 'guest_hash',
            role: 'user',
            city: 'Agra',
          },
        });
        userId = newUser.id;
      }
    }

    const { placeId, rating, caption, imageUrl: bodyImageUrl, placeSlug, placeName } = req.body;

    let targetPlaceId = parseInt(placeId);
    let place = null;

    if (!isNaN(targetPlaceId)) {
      place = await prisma.place.findUnique({ where: { id: targetPlaceId } });
    }

    if (!place) {
      // Map legacy fallback IDs to slugs
      const fallbackMap = {
        8: 'taj-mahal',
        9: 'hampi-monuments',
        10: 'konark-sun-temple',
        11: 'meenakshi-amman-temple',
        12: 'varanasi-ghats',
        13: 'amer-fort-jaipur',
        14: 'qutub-minar',
      };
      const slugCandidate = fallbackMap[targetPlaceId] || placeSlug;
      if (slugCandidate) {
        place = await prisma.place.findFirst({
          where: {
            OR: [
              { slug: slugCandidate },
              { slug: { contains: slugCandidate } },
            ],
          },
        });
      }
    }

    if (!place && placeName) {
      place = await prisma.place.findFirst({
        where: {
          name: { contains: placeName },
        },
      });
    }

    if (!place) {
      place = await prisma.place.findFirst();
    }

    if (!place) {
      return res.status(400).json({ success: false, message: 'No valid heritage site found in database.' });
    }
    targetPlaceId = place.id;

    let finalImageUrl = bodyImageUrl;
    if (req.file) {
      finalImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    if (!finalImageUrl || !finalImageUrl.trim()) {
      return res.status(400).json({ success: false, message: 'An image file or imageUrl is required.' });
    }

    const parsedRating = parseInt(rating) || 5;
    const clampedRating = Math.max(1, Math.min(5, parsedRating));

    const post = await prisma.post.create({
      data: {
        userId,
        placeId: targetPlaceId,
        rating: clampedRating,
        caption: caption || '',
        imageUrl: finalImageUrl.trim(),
        likesCount: Math.floor(20 + Math.random() * 25),
        isApproved: true,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        place: { select: { id: true, name: true, slug: true, category: true, state: true } },
        comments: true,
      },
    });

    console.log(`[MySQL] New review post created in DB: ID ${post.id} for place ${post.placeId} (${place.name})`);

    return res.status(201).json({
      success: true,
      message: 'Post created and saved to MySQL successfully!',
      post: {
        ...post,
        comments: [],
      },
    });
  } catch (error) {
    console.error('createPost error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create post.' });
  }
}

/**
 * Haversine formula to compute distance between two lat/lng points in kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Smart Feed Recommendation Algorithm (Instagram / YouTube Shorts inspired)
 * Factors:
 * 1. Engagement Velocity: Likes (1.8x), Comments (3.2x), Rating (2.0x)
 * 2. Time-Decay Gravity Curve: Recency with exponential drop-off for older posts
 * 3. Freshness Discovery Boost: Newly published posts (< 12h) get initial discovery push
 * 4. Geolocation Proximity: Nearby heritage sites get localized boost
 * 5. Content Quality Signals: Detailed captions, high resolutions, rich places
 */
function calculateFeedPostScore(post, { userLat, userLng, userCity, currentUserId }) {
  const likesCount = Number(post.likesCount || post.likes?.length || 0);
  const commentsCount = Number(post.comments?.length || 0);
  const rating = Number(post.rating || 5);

  // 1. Base engagement score
  const engagementScore = likesCount * 1.8 + commentsCount * 3.2 + rating * 2.0;

  // 2. Time decay (Gravity curve like Reddit / Hacker News / Instagram)
  const now = Date.now();
  const postTime = new Date(post.createdAt || now).getTime();
  const ageHours = Math.max(0.1, (now - postTime) / (1000 * 60 * 60));
  // Gravity exponent 1.25
  const gravityDecay = 1 / Math.pow(ageHours + 2, 1.25);

  // 3. Discovery / Freshness boost for newly uploaded content
  let freshnessBoost = 0;
  let isFresh = false;
  if (ageHours <= 6) {
    freshnessBoost = 35; // Hot new discovery push
    isFresh = true;
  } else if (ageHours <= 24) {
    freshnessBoost = 20;
    isFresh = true;
  } else if (ageHours <= 72) {
    freshnessBoost = 10;
  }

  // 4. Proximity / Geo-location boost
  let proximityBoost = 0;
  let distKm = null;
  let isNearby = false;
  if (userLat != null && userLng != null && post.place?.latitude && post.place?.longitude) {
    distKm = calculateHaversineDistance(userLat, userLng, post.place.latitude, post.place.longitude);
    if (distKm !== null) {
      if (distKm <= 50) {
        proximityBoost = 28; // Local monument viral boost
        isNearby = true;
      } else if (distKm <= 150) {
        proximityBoost = 18;
        isNearby = true;
      } else if (distKm <= 400) {
        proximityBoost = 10;
      }
    }
  }

  // City / State text match boost
  if (userCity && post.place?.state && post.place.state.toLowerCase().includes(userCity.toLowerCase())) {
    proximityBoost += 12;
    isNearby = true;
  }

  // 5. Quality signals
  let qualityBoost = 0;
  if (post.caption && post.caption.trim().length > 30) {
    qualityBoost += 6; // Thoughtful caption / travel story
  }
  if (post.imageUrl && (post.imageUrl.startsWith('http') || post.imageUrl.startsWith('/uploads'))) {
    qualityBoost += 5;
  }

  // 6. User personal affinity
  let affinityBoost = 0;
  if (currentUserId && post.userId === currentUserId) {
    affinityBoost = 10; // Creator boost for user's own contributions
  }

  // Engagement score scaled by gravity decay
  const engagementComp = engagementScore * 12 * gravityDecay;
  const finalScore = engagementComp + freshnessBoost + proximityBoost + qualityBoost + affinityBoost;

  // Determine if trending (high engagement velocity)
  const isTrending = engagementComp > 18 || (likesCount >= 10 && ageHours <= 48);

  return {
    score: Math.round(finalScore * 10) / 10,
    isTrending,
    isNearby,
    isFresh,
    distKm: distKm ? Math.round(distKm) : null,
  };
}

/**
 * Apply Anti-Monopoly Content Diversity Re-ranking:
 * Prevents 3+ consecutive posts from the exact same monument placeId so the feed
 * displays a colorful, diverse tapestry of Indian heritage sites.
 */
function applyDiversityRerank(rankedPosts) {
  if (rankedPosts.length <= 2) return rankedPosts;
  const diversified = [];
  const pool = [...rankedPosts];

  while (pool.length > 0) {
    let pickIndex = 0;
    const lastPlaceId = diversified.length > 0 ? diversified[diversified.length - 1].placeId : null;
    const secondLastPlaceId = diversified.length > 1 ? diversified[diversified.length - 2].placeId : null;

    // If the top candidate is the same place as the last 2 posts, look ahead for a different place
    if (lastPlaceId && secondLastPlaceId && lastPlaceId === secondLastPlaceId) {
      const altIndex = pool.findIndex((p) => p.placeId !== lastPlaceId);
      if (altIndex !== -1 && altIndex < 6) {
        pickIndex = altIndex;
      }
    } else if (lastPlaceId) {
      // If same as immediate last post, see if there's a closely-ranked alternative within top 3
      if (pool[0].placeId === lastPlaceId && pool.length > 1) {
        const altIndex = pool.findIndex((p) => p.placeId !== lastPlaceId);
        if (altIndex !== -1 && altIndex <= 2) {
          pickIndex = altIndex;
        }
      }
    }

    diversified.push(pool.splice(pickIndex, 1)[0]);
  }

  return diversified;
}

export async function getFeedPosts(req, res) {
  try {
    const userLat = req.query.lat ? parseFloat(req.query.lat) : null;
    const userLng = req.query.lng ? parseFloat(req.query.lng) : null;
    const userCity = req.query.city ? String(req.query.city).trim() : null;

    const posts = await prisma.post.findMany({
      where: { isApproved: true },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        place: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            state: true,
            latitude: true,
            longitude: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          take: 30,
        },
        likes: {
          select: { userId: true, ipAddress: true },
        },
      },
      take: 100, // expanded pool for algorithmic ranking
    });

    const currentUserId = req.user?.id || null;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '';

    const scoredPosts = posts.map((p) => {
      const hasLiked = currentUserId
        ? p.likes.some((l) => l.userId === currentUserId)
        : p.likes.some((l) => l.ipAddress === clientIp);

      const algo = calculateFeedPostScore(p, {
        userLat,
        userLng,
        userCity,
        currentUserId,
      });

      return {
        ...p,
        likesCount: p.likesCount || p.likes.length || 24,
        liked: hasLiked,
        comments: (p.comments || []).map((c) => ({
          id: c.id,
          author: c.authorName,
          avatar: c.avatarUrl,
          text: c.text,
          timeAgo: formatTimeAgo(c.createdAt),
          createdAt: c.createdAt,
        })),
        _algoScore: algo.score,
        isTrending: algo.isTrending,
        isNearby: algo.isNearby,
        isFresh: algo.isFresh,
        distKm: algo.distKm,
      };
    });

    // 1. Sort by algorithmic recommendation score descending
    scoredPosts.sort((a, b) => b._algoScore - a._algoScore);

    // 2. Apply diversity re-ranking to prevent repetitive monuments
    const finalFeed = applyDiversityRerank(scoredPosts);

    return res.json({
      success: true,
      count: finalFeed.length,
      posts: finalFeed,
      algorithm: 'sanskriti_edgerank_v2',
    });
  } catch (error) {
    console.error('getFeedPosts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch community posts.' });
  }
}

export async function toggleLikePost(req, res) {
  try {
    const postId = parseInt(req.params.id);
    let userId = req.user?.id || null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    let existingLike = null;
    if (userId) {
      existingLike = await prisma.postLike.findUnique({
        where: { postId_userId: { postId, userId } },
      });
    } else {
      existingLike = await prisma.postLike.findFirst({
        where: { postId, ipAddress },
      });
    }

    let liked = false;
    let nextCount = post.likesCount || 0;

    if (existingLike) {
      await prisma.postLike.delete({ where: { id: existingLike.id } });
      nextCount = Math.max(0, nextCount - 1);
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: nextCount },
      });
      liked = false;
      console.log(`[MySQL] Like removed for post ${postId}`);
    } else {
      await prisma.postLike.create({
        data: {
          postId,
          userId,
          ipAddress,
        },
      });
      nextCount = nextCount + 1;
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: nextCount },
      });
      liked = true;
      console.log(`[MySQL] Like recorded for post ${postId}`);
    }

    return res.json({
      success: true,
      liked,
      likesCount: nextCount,
      message: liked ? 'Saved like to MySQL' : 'Removed like from MySQL',
    });
  } catch (error) {
    console.error('toggleLikePost error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle like.' });
  }
}

export async function addPostComment(req, res) {
  try {
    const postId = parseInt(req.params.id);
    const { text, authorName: bodyAuthor, avatarUrl: bodyAvatar } = req.body;
    const userId = req.user?.id || null;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const authorName = req.user?.name || bodyAuthor || 'Cultural Explorer';
    const avatarUrl =
      req.user?.avatarUrl ||
      bodyAvatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`;

    const comment = await prisma.postComment.create({
      data: {
        postId,
        userId,
        authorName,
        avatarUrl,
        text: text.trim(),
      },
    });

    console.log(`[MySQL] Comment saved in DB for post ${postId} by ${authorName}`);

    return res.status(201).json({
      success: true,
      message: 'Comment saved to MySQL successfully!',
      comment: {
        id: comment.id,
        author: comment.authorName,
        avatar: comment.avatarUrl,
        text: comment.text,
        timeAgo: 'Just now',
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error('addPostComment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
}

export async function toggleBookmarkPost(req, res) {
  try {
    const postId = parseInt(req.params.id);
    let userId = req.user?.id;
    if (!userId) {
      const def = await prisma.user.findFirst();
      userId = def?.id || 8;
    }

    const existing = await prisma.postBookmark.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    let saved = false;
    if (existing) {
      await prisma.postBookmark.delete({ where: { id: existing.id } });
      saved = false;
      console.log(`[MySQL] Post ${postId} unbookmarked by user ${userId}`);
    } else {
      await prisma.postBookmark.create({
        data: { postId, userId },
      });
      saved = true;
      console.log(`[MySQL] Post ${postId} bookmarked in MySQL by user ${userId}`);
    }

    return res.json({
      success: true,
      saved,
      message: saved ? 'Saved to MySQL bookmarks' : 'Removed from MySQL bookmarks',
    });
  } catch (error) {
    console.error('toggleBookmarkPost error:', error);
    return res.status(500).json({ success: false, message: 'Failed to bookmark post.' });
  }
}

export async function getBookmarkedPosts(req, res) {
  try {
    let userId = req.user?.id;
    if (!userId) {
      const def = await prisma.user.findFirst();
      userId = def?.id || 8;
    }

    const bookmarks = await prisma.postBookmark.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            place: { select: { id: true, name: true, slug: true, category: true, state: true } },
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      posts: bookmarks.map((b) => b.post),
    });
  } catch (error) {
    console.error('getBookmarkedPosts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch saved posts.' });
  }
}

export async function updatePost(req, res) {
  try {
    const postId = parseInt(req.params.id);
    const { caption, rating } = req.body;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const currentUserId = req.user?.id;
    if (currentUserId && post.userId !== currentUserId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this post.' });
    }

    const updatedData = {};
    if (caption !== undefined) updatedData.caption = caption;
    if (rating !== undefined) {
      const parsedRating = parseInt(rating) || 5;
      updatedData.rating = Math.max(1, Math.min(5, parsedRating));
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updatedData,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        place: { select: { id: true, name: true, slug: true, category: true, state: true } },
        comments: true,
      },
    });

    console.log(`[MySQL] Post ${postId} updated in database`);

    return res.json({
      success: true,
      message: 'Post updated in MySQL successfully!',
      post: updatedPost,
    });
  } catch (error) {
    console.error('updatePost error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update post.' });
  }
}

export async function getMyPosts(req, res) {
  try {
    let userId = req.user?.id;
    if (!userId) {
      const def = await prisma.user.findFirst();
      userId = def?.id || 8;
    }

    const posts = await prisma.post.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        place: { select: { id: true, name: true, slug: true, category: true, state: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      posts: posts.map((p) => ({
        ...p,
        likesCount: p.likesCount || 24,
        comments: (p.comments || []).map((c) => ({
          id: c.id,
          author: c.authorName,
          avatar: c.avatarUrl,
          text: c.text,
          timeAgo: formatTimeAgo(c.createdAt),
          createdAt: c.createdAt,
        })),
      })),
    });
  } catch (error) {
    console.error('getMyPosts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user posts.' });
  }
}

export async function deletePost(req, res) {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const currentUserId = req.user?.id;
    if (currentUserId && post.userId !== currentUserId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this post.' });
    }

    await prisma.post.delete({ where: { id: postId } });
    console.log(`[MySQL] Post ${postId} deleted from database`);

    return res.json({ success: true, message: 'Post deleted from MySQL successfully.' });
  } catch (error) {
    console.error('deletePost error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
}
