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
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, count: products.length, products });
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
      },
    });

    if (!product) {
      return res.status(400).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, product });
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
    } = req.body;

    if (!name || !price || !artisanName || !placeId) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, artisan name, and heritage site are required',
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        nameHi: nameHi || null,
        description: description || '',
        descriptionHi: descriptionHi || null,
        price: parseFloat(price),
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        artisanName,
        odopTag: odopTag || 'ODOP Verified Heritage Craft',
        category: category || 'handicraft',
        placeId: parseInt(placeId),
        rating: 5.0,
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
