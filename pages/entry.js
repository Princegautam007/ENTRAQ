import { useState, useEffect } from 'react';

export default function Entry() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data));
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Processing...');

    try {
      // We now send the eventName along with name and email
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          eventName: selectedEvent.title 
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('✅ Ticket Sent! Check your email.');
        setName(''); setEmail('');
      } else {
        setStatus('❌ Error: ' + data.error);
      }
    } catch (err) {
      setStatus('❌ Failed to connect.');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      
      {/* --- NEW HOME BUTTON --- */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
        <a href="/" style={{ background: '#222', color: 'white', padding: '8px 15px', borderRadius: '6px', textDecoration: 'none', border: '1px solid #333' }}>
          🏠 Home
        </a>
      </div>

      <h1 className="title">🎟️ Join an Event</h1>
      
      {/* 1. LIST OF EVENTS */}
      {!selectedEvent && (
        <div className="grid">
          {events.length === 0 ? <p>No events found. Host needs to create one!</p> : null}
          
          {events.map(event => (
            <div key={event._id} className="card">
              <h2>{event.title}</h2>
              <p className="date">📅 {event.date} • 📍 {event.location}</p>
              <p className="desc">{event.description}</p>
              <button onClick={() => setSelectedEvent(event)}>Get Ticket &rarr;</button>
            </div>
          ))}
        </div>
      )}

      {/* 2. REGISTRATION FORM (Only shows after clicking an event) */}
      {selectedEvent && (
        <div className="form-card">
          <button className="back-btn" onClick={() => setSelectedEvent(null)}>&larr; Back to Events</button>
          <h2>Register for <span className="highlight">{selectedEvent.title}</span></h2>
          
          <form onSubmit={handleRegister}>
            <input 
              placeholder="Your Name" 
              value={name} onChange={e => setName(e.target.value)} 
              required 
            />
            <input 
              placeholder="Your Email" type="email"
              value={email} onChange={e => setEmail(e.target.value)} 
              required 
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Get My Ticket 🎟️'}
            </button>
          </form>
          <p className="status">{status}</p>
        </div>
      )}

      <style jsx global>{`
        body { background: #000; color: white; font-family: sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; text-align: center; }
        .title { font-size: 2.5rem; margin-bottom: 40px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .card { background: #111; border: 1px solid #333; padding: 20px; border-radius: 10px; text-align: left; transition: 0.2s; }
        .card:hover { border-color: #7928CA; transform: translateY(-5px); }
        .date { color: #888; font-size: 0.9rem; margin: 10px 0; }
        .form-card { background: #111; padding: 40px; border-radius: 15px; border: 1px solid #333; max-width: 400px; margin: 0 auto; }
        .highlight { color: #7928CA; }
        .back-btn { background: none; border: none; color: #888; cursor: pointer; margin-bottom: 20px; }
        input { width: 100%; padding: 12px; margin-bottom: 15px; background: #000; border: 1px solid #333; color: white; border-radius: 5px; }
        button { width: 100%; padding: 12px; background: white; color: black; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; }
        button:hover { background: #ddd; }
        .status { margin-top: 15px; font-weight: bold; color: #00ff88; }
      `}</style>
    </div>
  );
}