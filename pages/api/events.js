import connectDB from '../../lib/db';
import Event from '../../models/Event';
import Ticket from '../../models/Ticket'; // <--- Import Ticket model

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    // Get all events
    const events = await Event.find({}).sort({ createdAt: -1 });
    res.status(200).json(events);
  } 
  else if (req.method === 'POST') {
    // Create an event
    const { title, date, location, description } = req.body;
    const newEvent = await Event.create({ title, date, location, description });
    res.status(201).json({ success: true, event: newEvent });
  } 
  else if (req.method === 'DELETE') {
    const { id } = req.body;

    // 1. Find the event first (so we know its title)
    const eventToDelete = await Event.findById(id);

    if (eventToDelete) {
      // 2. Delete ALL tickets associated with this event
      await Ticket.deleteMany({ eventName: eventToDelete.title });

      // 3. Now delete the event itself
      await Event.findByIdAndDelete(id);
    }

    res.status(200).json({ success: true });
  }
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}