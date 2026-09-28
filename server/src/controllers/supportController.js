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
      statusHi: t.status === 'RESOLVED' ? 'निस्तारित' : t.status === 'IN_REVIEW' ? 'समीक्षाधीन' : 'खुला (नया)',
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

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticketId = parseInt(id);
    let ticket = null;
    if (!isNaN(ticketId)) {
      ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    }
    if (!ticket) {
      ticket = await prisma.supportTicket.findUnique({ where: { ticketNumber: id } });
    }

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: status || ticket.status,
      },
    });

    console.log(`[Support] Ticket ${ticket.ticketNumber} status updated to: ${status}`);

    return res.json({
      success: true,
      message: `Ticket status updated to ${status}`,
      ticket: {
        ...updated,
        statusHi: updated.status === 'RESOLVED' ? 'निस्तारित' : updated.status === 'IN_REVIEW' ? 'समीक्षाधीन' : 'खुला',
        resolutionEstimate: updated.status === 'RESOLVED' ? 'Closed' : '24-48 Hours',
      },
    });
  } catch (error) {
    console.error('Error updating support ticket status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update ticket status.' });
  }
};

export const deleteSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticketId = parseInt(id);
    let ticket = null;
    if (!isNaN(ticketId)) {
      ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    }
    if (!ticket) {
      ticket = await prisma.supportTicket.findUnique({ where: { ticketNumber: id } });
    }

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    await prisma.supportTicket.delete({ where: { id: ticket.id } });
    console.log(`[Support] Ticket ${ticket.ticketNumber} deleted from MySQL`);

    return res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete ticket.' });
  }
};

