import prisma from '../prisma.js';

export async function createPost(req, res) {
  try {
    const userId = req.user.id;
    const { placeId, rating, caption, imageUrl: bodyImageUrl } = req.body;

    if (!placeId) {
      return res.status(400).json({ success: false, message: 'placeId is required.' });
    }

    let finalImageUrl = bodyImageUrl;
    if (req.file) {
      // If image uploaded via multer
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
        isApproved: true,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        place: { select: { id: true, name: true, slug: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Post created successfully!',
      post,
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
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ success: true, posts });
  } catch (error) {
    console.error('getFeedPosts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch community posts.' });
  }
}

export async function deletePost(req, res) {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Only owner or admin can delete
    if (post.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this post.' });
    }

    await prisma.post.delete({ where: { id: postId } });

    return res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('deletePost error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
}
