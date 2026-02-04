import connectDB from '../../lib/db';
import Ticket from '../../models/Ticket';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await connectDB();
      
      const { name, email, eventName } = req.body; // <--- Added eventName

      // 1. Generate a unique ID for the QR code
      const ticketId = uuidv4();

      // 2. Create the QR Code image (Data URL)
      const qrCodeData = await QRCode.toDataURL(JSON.stringify({ ticketId, name }));

      // 3. Save the ticket to MongoDB
      const newTicket = await Ticket.create({
        ticketId,
        name,
        email,
        eventName // <--- Save the event name to the ticket
      });

      // 4. Configure the Email Sender
      // NOTE: You must use an App Password for Gmail, not your login password!
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS, 
        },
      });

      // 5. Send the Email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Your Ticket for the Event, ${name}!`,
        html: `
          <div style="text-align: center; font-family: sans-serif;">
            <h1>You are registered!</h1>
            <p>Show this QR code at the entrance.</p>
            <img src="cid:unique@qr" alt="Your Ticket QR" style="width: 250px;"/>
          </div>
        `,
        attachments: [
          {
            filename: 'ticket.png',
            content: qrCodeData.split("base64,")[1],
            encoding: 'base64',
            cid: 'unique@qr' // This connects the image to the HTML above
          }
        ]
      });

      res.status(200).json({ success: true, message: 'Ticket sent to email!' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}