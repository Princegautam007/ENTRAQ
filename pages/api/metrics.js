import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(); 

    const tickets = await db.collection("tickets").find({}).toArray();
    
    const totalTickets = tickets.length;
    const scannedTickets = tickets.filter(t => t.scanned).length;
    const attendanceRate = totalTickets ? ((scannedTickets / totalTickets) * 100).toFixed(1) : 0;
    
    const eventStats = {};
    tickets.forEach(t => {
       const name = t.eventName || "Unknown Event";
       if (!eventStats[name]) eventStats[name] = { sold: 0, scanned: 0 };
       eventStats[name].sold += 1;
       if (t.scanned) eventStats[name].scanned += 1;
    });

    const sortedEvents = Object.entries(eventStats)
      .sort((a, b) => b[1].sold - a[1].sold)
      .slice(0, 5);

    await client.close();
    res.status(200).json({ totalTickets, scannedTickets, attendanceRate, topEvents: sortedEvents });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
}