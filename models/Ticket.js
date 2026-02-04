import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true }, // The unique QR code data
  name: { type: String, required: true },
  email: { type: String, required: true },
  scanned: { type: Boolean, default: false }, // Has this ticket been used?
  createdAt: { type: Date, default: Date.now }
});

// This checks if the model exists before creating it (prevents errors during hot-reloads)
export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);