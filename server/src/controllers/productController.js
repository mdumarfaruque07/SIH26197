import prisma from '../prisma.js';

export async function getAllProducts(req, res) {
  try {
    const { category, search, placeId } = req.query;

    const where = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (placeId) {
      where.placeId = parseInt(placeId);
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { artisanName: { contains: search } },
        { odopTag: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        place: {
          select: {
            id: true,
            name: true,
            state: true,
            slug: true,
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = products.map((p) => {
      const revs = p.reviews || [];
      const avgRating = revs.length > 0
        ? parseFloat((revs.reduce((acc, r) => acc + r.rating, 0) / revs.length).toFixed(1))
        : (p.rating || 4.8);
      return {
        ...p,
        rating: avgRating,
        reviewCount: revs.length,
      };
    });

    return res.json({ success: true, count: enriched.length, products: enriched });
  } catch (error) {
    console.error('getAllProducts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
}

export async function getProductsByPlace(req, res) {
  try {
    const placeId = parseInt(req.params.placeId);
    const products = await prisma.product.findMany({
      where: { placeId },
      include: {
        place: {
          select: { id: true, name: true, state: true },
        },
      },
      orderBy: { price: 'asc' },
    });

    return res.json({ success: true, products });
  } catch (error) {
    console.error('getProductsByPlace error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch place products' });
  }
}

export async function getProductById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        place: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return res.status(400).json({ success: false, message: 'Product not found' });
    }

    const revs = product.reviews || [];
    const avgRating = revs.length > 0
      ? parseFloat((revs.reduce((acc, r) => acc + r.rating, 0) / revs.length).toFixed(1))
      : (product.rating || 4.8);

    return res.json({
      success: true,
      product: {
        ...product,
        rating: avgRating,
        reviewCount: revs.length,
      },
    });
  } catch (error) {
    console.error('getProductById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
}

export async function createProduct(req, res) {
  try {
    const {
      name,
      nameHi,
      description,
      descriptionHi,
      price,
      imageUrl,
      artisanName,
      odopTag,
      category,
      placeId,
      shopName,
      shopAddress,
      shopLandmark,
      shopTiming,
      phone,
      whatsapp,
    } = req.body;

    if (!name || !price || !artisanName || !placeId) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, artisan name, and heritage site are required',
      });
    }

    if (category === 'food') {
      return res.status(403).json({
        success: false,
        message: 'Food & Culinary Heritage can only be curated by Government Admins as non-deliverable tourist cultural lore.',
      });
    }

    const combinedName = nameHi && nameHi.trim() ? `${name} (${nameHi.trim()})` : name;
    const combinedDesc = descriptionHi && descriptionHi.trim()
      ? `${description ? description.trim() + '\n\n' : ''}${descriptionHi.trim()}`
      : (description || '');

    let finalImageUrl = imageUrl;
    if (req.file) {
      finalImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const product = await prisma.product.create({
      data: {
        name: combinedName,
        description: combinedDesc,
        price: parseFloat(price),
        imageUrl:
          finalImageUrl ||
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        artisanName,
        odopTag: odopTag || 'ODOP Verified Heritage Craft',
        category: category || 'handicraft',
        placeId: parseInt(placeId),
        rating: 5.0,
        shopName: shopName || null,
        shopAddress: shopAddress || null,
        shopLandmark: shopLandmark || null,
        shopTiming: shopTiming || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
      },
      include: {
        place: {
          select: {
            id: true,
            name: true,
            state: true,
            slug: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product listed successfully in Artisan Bazaar',
      product,
    });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
}

export async function createProductReview(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const { userName, userCity, rating, comment } = req.body;

    if (!userName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Name, rating, and review text are required.',
      });
    }

    const review = await prisma.productReview.create({
      data: {
        productId,
        userName,
        userCity: userCity || 'Verified Heritage Traveler',
        rating: parseInt(rating),
        comment,
        verifiedBuy: true,
      },
    });

    // Recompute product rating
    const allReviews = await prisma.productReview.findMany({ where: { productId } });
    const avg = parseFloat((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1));
    await prisma.product.update({
      where: { id: productId },
      data: { rating: avg },
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review,
      newRating: avg,
      reviewCount: allReviews.length,
    });
  } catch (error) {
    console.error('createProductReview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
}

export async function getProductReviews(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const reviews = await prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.error('getProductReviews error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
}
