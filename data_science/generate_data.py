import os
import random
import certifi
from datetime import datetime, timedelta
from pymongo import MongoClient
from faker import Faker
from dotenv import load_dotenv

# 1. Load your MongoDB connection string from your Next.js config
# This automatically finds your .env.local file
load_dotenv('../.env.local')
MONGO_URI = "mongodb+srv://admin:Prince@ticketweb.uoneqki.mongodb.net/?appName=Ticketweb"

if not MONGO_URI:
    print("❌ Error: Could not find MONGODB_URI. Please paste it directly into the script.")
    exit()

# 2. Connect to the Database
import certifi

# The Nuclear Option: Forces TLS, uses the Certifi package, AND ignores invalid certificates
client = MongoClient(
    MONGO_URI, 
    tls=True, 
    tlsCAFile=certifi.where(), 
    tlsAllowInvalidCertificates=True
)

db = client.get_database("ticket_db")
fake = Faker('en_IN') # Using Indian locale for realistic names/cities!

print("⏳ Connected to MongoDB. Generating synthetic data...")

# --- GENERATE EVENTS ---
event_ids = []
events_data = []

# Create 20 simulated events (some in the past, some in the future)
for i in range(20):
    # Random date between 30 days ago and 30 days from now
    days_offset = random.randint(-30, 30)
    event_date = datetime.now() + timedelta(days=days_offset)
    
    event = {
        "title": f"{fake.company()} {random.choice(['Summit', 'Fest', 'Conference', 'Meetup'])}",
        "date": event_date.strftime("%Y-%m-%d"),
        "location": fake.city(),
        "description": fake.catch_phrase(),
        "createdAt": datetime.now()
    }
    events_data.append(event)

# Insert Events into MongoDB
if events_data:
    db.events.insert_many(events_data)
    # Fetch them back to get their generated _ids
    saved_events = list(db.events.find())
    print(f"✅ Successfully created {len(saved_events)} Events.")

# --- GENERATE TICKETS / CHECK-INS ---
tickets_data = []

# Create 1000 random ticket purchases
for _ in range(1000):
    target_event = random.choice(saved_events)
    
    # 70% chance the ticket was actually scanned (attended)
    is_scanned = random.random() < 0.70 
    
    ticket = {
        "ticketId": fake.uuid4(),
        "name": fake.name(),
        "email": fake.email(),
        "eventName": target_event['title'],
        "scanned": is_scanned,
        # If scanned, generate a random timestamp on the day of the event
        "updatedAt": datetime.strptime(target_event['date'], "%Y-%m-%d") + timedelta(hours=random.randint(9, 20), minutes=random.randint(0, 59)) if is_scanned else datetime.now(),
        "createdAt": datetime.now() - timedelta(days=random.randint(1, 14)) # Bought 1-14 days before
    }
    tickets_data.append(ticket)

# Insert Tickets into MongoDB
if tickets_data:
    db.tickets.insert_many(tickets_data)
    print(f"✅ Successfully created {len(tickets_data)} Ticket records.")

print("🚀 Data Generation Complete! Your database is now ready for Data Science.")