import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  // Only allow GET requests so we can trigger it from the browser
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const uri = process.env.MONGODB_URI;
  if (!uri) return res.status(500).json({ error: 'Missing MONGODB_URI in .env.local' });

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(); // This automatically uses the database from your URI

    console.log("⏳ Clearing old data...");
    await db.collection("events").deleteMany({});
    await db.collection("tickets").deleteMany({});

    console.log("⏳ Generating 20 Events...");
    const eventsData = [];
    const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Pune", "Hyderabad"];
    const types = ["Summit", "Fest", "Conference", "Meetup", "Hackathon"];
    const prefixes = ["Tech", "Future", "Global", "Startup", "AI", "Data"];

    for (let i = 0; i < 20; i++) {
      const title = `${prefixes[Math.floor(Math.random()*prefixes.length)]} ${types[Math.floor(Math.random()*types.length)]} 2025`;
      
      // Random date between 30 days ago and 30 days from now
      const date = new Date();
      date.setDate(date.getDate() + (Math.floor(Math.random() * 60) - 30));

      eventsData.push({
        title,
        date: date.toISOString().split('T')[0],
        location: cities[Math.floor(Math.random()*cities.length)],
        description: "An amazing industry event to connect and learn.",
        createdAt: new Date()
      });
    }

    await db.collection("events").insertMany(eventsData);
    const savedEvents = await db.collection("events").find({}).toArray();

    console.log("⏳ Generating 1000 Tickets...");
    const ticketsData = [];
    const firstNames = ["Aarav", "Rohan", "Priya", "Ananya", "Vikram", "Neha", "Rahul", "Aditi", "Karan", "Sanya"];
    const lastNames = ["Sharma", "Singh", "Patel", "Gupta", "Kumar", "Verma", "Jain", "Bose"];

    for (let i = 0; i < 1000; i++) {
      const targetEvent = savedEvents[Math.floor(Math.random() * savedEvents.length)];
      const isScanned = Math.random() < 0.70; // 70% attendance rate
      const fn = firstNames[Math.floor(Math.random()*firstNames.length)];
      const ln = lastNames[Math.floor(Math.random()*lastNames.length)];

      ticketsData.push({
        ticketId: `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
        eventName: targetEvent.title,
        scanned: isScanned,
        updatedAt: isScanned ? new Date() : null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
      });
    }

    await db.collection("tickets").insertMany(ticketsData);
    await client.close();

    console.log("✅ Database successfully seeded!");
    res.status(200).json({ 
      success: true, 
      message: "Data Generation Complete! 20 Events and 1000 Tickets added." 
    });

  } catch (error) {
    console.error(error);
    await client.close();
    res.status(500).json({ success: false, error: error.message });
  }
}