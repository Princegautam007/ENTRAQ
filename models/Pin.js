import mongoose from 'mongoose';

const PinSchema = new mongoose.Schema({
  email: { type: String, required: true },
  pin: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-deletes after 10 minutes
});

export default mongoose.models.Pin || mongoose.model('Pin', PinSchema);