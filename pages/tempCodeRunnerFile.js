import connectDB from '../../lib/db';
import Ticket from '../../models/Ticket';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await connectDB();
    const { ticketId } = req.body;

    // 1. Find the ticket
    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Invalid Ticket" });
    }

    // 2. Check if already used
    if (ticket.scanned) {
      return res.status(400).json({ success: false, message: "ALREADY USED!", name: ticket.name });
    }

    // 3. Mark as used
    ticket.scanned = true;
    await ticket.save();

    res.status(200).json({ success: true, name: ticket.name });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}