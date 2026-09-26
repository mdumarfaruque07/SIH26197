import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ticketsFilePath = path.join(__dirname, '../../uploads/support_tickets.json');

// Ensure directory and tickets storage exist
const ensureStorage = () => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(ticketsFilePath)) {
    fs.writeFileSync(ticketsFilePath, JSON.stringify([], null, 2));
  }
};

const readTickets = () => {
  try {
    ensureStorage();
    const data = fs.readFileSync(ticketsFilePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading support tickets:', err);
    return [];
  }
};

const writeTickets = (tickets) => {
  try {
    ensureStorage();
    fs.writeFileSync(ticketsFilePath, JSON.stringify(tickets, null, 2));
  } catch (err) {
    console.error('Error writing support tickets:', err);
  }
};

export const createSupportTicket = async (req, res) => {
  try {
    const {
      category = 'App Bug',
      subject = 'General Grievance',
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

    const ticketNumber = `ASI-GRV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newTicket = {
      id: ticketNumber,
      category,
      subject,
      description,
      contactEmail: contactEmail || 'tourist@sanskritigo.in',
      contactPhone: contactPhone || '',
      priority,
      referenceId: referenceId || monumentOrOrderRef,
      attachmentUrl,
      status: 'Under Review',
      statusHi: 'समीक्षाधीन',
      createdAt: new Date().toISOString(),
      resolutionEstimate: '24-48 Hours',
    };

    const tickets = readTickets();
    tickets.unshift(newTicket);
    writeTickets(tickets);

    console.log(`[Support] New grievance report filed: ${ticketNumber} [${category}]`);

    return res.status(201).json({
      success: true,
      message: 'Support ticket registered successfully.',
      ticket: newTicket,
    });
  } catch (error) {
    console.error('Error submitting support ticket:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit report. Please try again or call 1363.',
    });
  }
};

export const getSupportTickets = async (req, res) => {
  try {
    const tickets = readTickets();
    return res.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch support tickets.',
    });
  }
};
