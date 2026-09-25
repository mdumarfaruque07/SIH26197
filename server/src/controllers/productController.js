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
