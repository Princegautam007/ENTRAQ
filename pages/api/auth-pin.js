import connectDB from '../../lib/db';
import Pin from '../../models/Pin';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  await connectDB();

  // 1. GENERATE & SEND PIN
  if (req.method === 'POST') {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    // Generate a random 4-digit PIN
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString(); 

    // Save to DB (Update if exists, create if not)
    await Pin.findOneAndUpdate(
      { email }, 
      { pin: generatedPin, createdAt: Date.now() }, 
      { upsert: true, new: true }
    );

    // Send the Email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Your TicketOrder Scanner PIN 🔒",
        html: `
          <div style="text-align:center; padding: 20px; font-family: sans-serif;">
            <h2>Your Security PIN</h2>
            <h1 style="font-size: 40px; color: #0070f3; letter-spacing: 5px;">${generatedPin}</h1>
            <p>Enter this code to unlock the scanner. It will expire in 10 minutes.</p>
          </div>
        `
      });
      res.status(200).json({ success: true, message: "PIN sent" });
    } catch (error) {
      console.error("Email Error:", error);
      res.status(500).json({ error: "Failed to send email. Check your .env.local passwords." });
    }
  } 
  
  // 2. VERIFY PIN
  else if (req.method === 'PUT') {
    const { email, pin } = req.body;
    const record = await Pin.findOne({ email, pin });
    
    if (record) {
      await Pin.deleteOne({ email }); // Delete the PIN so it can't be reused
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid PIN" });
    }
  }
}