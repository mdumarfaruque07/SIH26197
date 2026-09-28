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
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      userId = defaultUser ? defaultUser.id : 8;
    }

    const { placeId, rating, caption, imageUrl: bodyImageUrl } = req.body;

    if (!placeId) {
      return res.status(400).json({ success: false, message: 'placeId is required.' });
    }

    let finalImageUrl = bodyImageUrl;
    if (req.file) {
      finalImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    if (!finalImageUrl) {
      return res.status(400).json({ success: false, message: 'An image file or imageUrl is required.' });
    }

    const parsedRating = parseInt(rating) || 5;
    const clampedRating = Math.max(1, Math.min(5, parsedRating));

    const post = await prisma.post.create({
      data: {
        userId,
        placeId: parseInt(placeId),
        rating: clampedRating,
        caption: caption || '',
        imageUrl: finalImageUrl,
        likesCount: Math.floor(20 + Math.random() * 25),
        isApproved: true,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        place: { select: { id: true, name: true, slug: true } },
        comments: true,
      },
    });

    console.log(`[MySQL] New review post created in DB: ID ${post.id} for place ${post.placeId}`);

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
    return res.status(500).json({ success: false, message: 'Failed to create post.' });
  }
}

export async function getFeedPosts(req, res) {
  try {
    const posts = await prisma.post.findMany({
      where: { isApproved: true },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        place: { select: { id: true, name: true, slug: true, category: true, state: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          take: 30,
        },
        likes: {
          select: { userId: true, ipAddress: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const currentUserId = req.user?.id || null;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '';

    const formatted = posts.map((p) => {
      const hasLiked = currentUserId
        ? p.likes.some((l) => l.userId === currentUserId)
        : p.likes.some((l) => l.ipAddress === clientIp);

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
      };
    });

    return res.json({ success: true, posts: formatted });
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
