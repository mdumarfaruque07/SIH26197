import prisma from '../prisma.js';

export const createSupportTicket = async (req, res) => {
  try {
    const {
      category = 'App Bug',
      subject = 'General Feedback & Support',
      description = '',
      contactEmail = '',
      contactPhone = '',
      priority = 'normal',
      referenceId = '',
      monumentOrOrderRef = '',
    } = req.body;

    if (!description && !subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required to file a report.',
      });
    }

    const ticketNumber = `SK-TKT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newTicket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        category,
        subject,
        description,
        contactEmail: contactEmail || 'user@sanskritikhoj.in',
        contactPhone: contactPhone || null,
        priority,
        referenceId: referenceId || monumentOrOrderRef || null,
        monumentOrOrderRef: monumentOrOrderRef || null,
        status: 'OPEN',
      },
    });

    console.log(`[Support] New ticket registered in MySQL: ${ticketNumber} [${category}]`);

    return res.status(201).json({
      success: true,
      message: 'Support ticket registered successfully.',
      ticket: {
        ...newTicket,
        id: newTicket.ticketNumber,
        status: 'Under Review',
        statusHi: 'समीक्षाधीन',
        resolutionEstimate: '24-48 Hours',
      },
    });
  } catch (error) {
    console.error('Error submitting support ticket:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit report. Please try again.',
    });
  }
};

export const getSupportTickets = async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = tickets.map((t) => ({
      ...t,
      statusHi: t.status === 'RESOLVED' ? 'निस्तारित' : 'समीक्षाधीन',
      resolutionEstimate: t.status === 'RESOLVED' ? 'Closed' : '24-48 Hours',
    }));

    return res.json({
      success: true,
      tickets: formatted,
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch support tickets.',
    });
  }
};
