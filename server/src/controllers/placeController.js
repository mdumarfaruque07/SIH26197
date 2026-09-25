import prisma from '../prisma.js';
import { calculateDistanceKm } from '../utils/geoUtils.js';

export async function getAllPlaces(req, res) {
  try {
    const { category, search } = req.query;

    const where = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
        { state: { contains: search } },
      ];
    }

    const places = await prisma.place.findMany({
      where,
      include: {
        mediaLinks: true,
        _count: {
          select: { posts: true },
        },
        posts: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = places.map((p) => {
      const avgRating =
        p.posts.length > 0
          ? Math.round((p.posts.reduce((sum, r) => sum + r.rating, 0) / p.posts.length) * 10) / 10
          : 5.0;
      const { posts, _count, ...rest } = p;
      return {
        ...rest,
        postsCount: _count.posts,
        rating: avgRating,
      };
    });

    return res.json({ success: true, places: formatted });
  } catch (error) {
    console.error('getAllPlaces error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch places.' });
  }
}

export async function getNearbyPlaces(req, res) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const maxRadius = parseFloat(req.query.radius || '1500'); // in km

    const allPlaces = await prisma.place.findMany({
      include: {
        _count: { select: { posts: true } },
        posts: { select: { rating: true } },
      },
    });

    // If valid coordinates provided, compute distance and sort
    let formatted;
    if (!isNaN(lat) && !isNaN(lng)) {
      formatted = allPlaces
        .map((p) => {
          const distanceKm = calculateDistanceKm(lat, lng, p.latitude, p.longitude);
          const avgRating =
            p.posts.length > 0
              ? Math.round((p.posts.reduce((sum, r) => sum + r.rating, 0) / p.posts.length) * 10) / 10
              : 5.0;
          const { posts, _count, ...rest } = p;
          return {
            ...rest,
            distanceKm,
            postsCount: _count.posts,
            rating: avgRating,
          };
        })
        .filter((p) => p.distanceKm <= maxRadius)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      // Default: Return all places without distance
      formatted = allPlaces.map((p) => {
        const avgRating =
          p.posts.length > 0
            ? Math.round((p.posts.reduce((sum, r) => sum + r.rating, 0) / p.posts.length) * 10) / 10
            : 5.0;
        const { posts, _count, ...rest } = p;
        return {
          ...rest,
          distanceKm: null,
          postsCount: _count.posts,
          rating: avgRating,
        };
      });
    }

    return res.json({ success: true, count: formatted.length, places: formatted });
  } catch (error) {
    console.error('getNearbyPlaces error:', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate nearby places.' });
  }
}

export async function getPlaceBySlug(req, res) {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    const place = await prisma.place.findUnique({
      where: { slug },
      include: {
        mediaLinks: true,
        posts: {
          where: { isApproved: true },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!place) {
      return res.status(404).json({ success: false, message: 'Place not found.' });
    }

    let isBookmarked = false;
    if (userId) {
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_placeId: { userId, placeId: place.id },
        },
      });
      isBookmarked = !!bookmark;
    }

    const avgRating =
      place.posts.length > 0
        ? Math.round((place.posts.reduce((sum, r) => sum + r.rating, 0) / place.posts.length) * 10) / 10
        : 5.0;

    return res.json({
      success: true,
      place: {
        ...place,
        rating: avgRating,
        isBookmarked,
      },
    });
  } catch (error) {
    console.error('getPlaceBySlug error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch place details.' });
  }
}

export async function toggleBookmark(req, res) {
  try {
    const { placeId } = req.body;
    const userId = req.user.id;

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_placeId: { userId, placeId: parseInt(placeId) },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return res.json({ success: true, bookmarked: false, message: 'Removed from bookmarks.' });
    } else {
      await prisma.bookmark.create({
        data: { userId, placeId: parseInt(placeId) },
      });
      return res.json({ success: true, bookmarked: true, message: 'Added to bookmarks!' });
    }
  } catch (error) {
    console.error('toggleBookmark error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle bookmark.' });
  }
}

export async function getUserBookmarks(req, res) {
  try {
    const userId = req.user.id;
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        place: {
          include: {
            _count: { select: { posts: true } },
            posts: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = bookmarks.map((b) => {
      const p = b.place;
      const avgRating =
        p.posts && p.posts.length > 0
          ? Math.round((p.posts.reduce((sum, r) => sum + r.rating, 0) / p.posts.length) * 10) / 10
          : 5.0;
      return {
        bookmarkId: b.id,
        visited: b.visited,
        savedAt: b.createdAt,
        place: {
          ...p,
          postsCount: p._count ? p._count.posts : 0,
          rating: avgRating,
        },
      };
    });

    return res.json({ success: true, bookmarks: formatted });
  } catch (error) {
    console.error('getUserBookmarks error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user bookmarks.' });
  }
}

export async function toggleVisitedStatus(req, res) {
  try {
    const userId = req.user.id;
    const placeId = parseInt(req.params.placeId);

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_placeId: { userId, placeId },
      },
    });

    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Place is not bookmarked.' });
    }

    const updated = await prisma.bookmark.update({
      where: { id: bookmark.id },
      data: { visited: !bookmark.visited },
    });

    return res.json({
      success: true,
      visited: updated.visited,
      message: updated.visited ? 'Marked as Visited! 🎉' : 'Marked as Want to Visit.',
    });
  } catch (error) {
    console.error('toggleVisitedStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update visited status.' });
  }
}

