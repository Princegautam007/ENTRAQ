import connectDB from '../../lib/db';
import Ticket from '../../models/Ticket';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    // Get the list
    const attendees = await Ticket.find({ scanned: true }).sort({ updatedAt: -1 });
    res.status(200).json(attendees);
  } 
  else if (req.method === 'DELETE') {
    // --- NEW: Delete ALL tickets (Reset) ---
    await Ticket.deleteMany({}); 
    res.status(200).json({ success: true });
  }
}