import { useState, useEffect } from 'react';
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // --- STATE ---
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]); 
  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', description: '' });
  const [createStatus, setCreateStatus] = useState('');

  // --- SECURITY CHECK ---
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // --- FETCH DATA ---
  const fetchData = () => {
    fetch('/api/attendees').then(res => res.json()).then(data => setAttendees(data));
    fetch('/api/events').then(res => res.json()).then(data => setEvents(data));
  };

  useEffect(() => {
    if (session) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // --- EVENT ACTIONS ---
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreateStatus('Creating...');
    
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });

    setCreateStatus('✅ Event Created!');
    setNewEvent({ title: '', date: '', location: '', description: '' }); 
    fetchData(); 
  };

  const handleEndEvent = async (id) => {
    if (!confirm("Are you sure? This will remove the event from the Join page.")) return;
    await fetch('/api/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const handleReset = async () => {
    if (!confirm("⚠️ This will delete ALL attendee history. Are you sure?")) return;
    await fetch('/api/attendees', { method: 'DELETE' });
    fetchData();
  };

  if (status === "loading") {
    return <div style={{color:'white', padding:'50px', textAlign:'center'}}>Loading secure dashboard...</div>;
  }

  if (!session) return null;

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
            <h1>⚡ Host Dashboard</h1>
            <span className="user-email">{session.user.email}</span>
        </div>
        <div className="header-right">
            {/* --- NEW HOME BUTTON --- */}
            <a href="/" style={{ background: '#222', color: 'white', padding: '8px 15px', borderRadius: '6px', textDecoration: 'none', border: '1px solid #333' }}>
              🏠 Home
            </a>
            <a href="/scan" target="_blank" className="scan-btn">Scanner 📷</a>
            <button onClick={() => signOut()} className="logout-btn">Logout</button>
            <a 
                    href="/analytics" 
                    style={{ 
                      background: '#6366f1', 
                      color: 'white', 
                      padding: '10px 15px', 
                      borderRadius: '8px', 
                      textDecoration: 'none', 
                                        fontWeight: 'bold',
                marginLeft: '10px'
                }}
                >
                  📊 Analytics
              </a>
        </div>
      </header>

      <div className="grid">
        <div className="card">
          <h2>📅 Create New Event</h2>
          <form onSubmit={handleCreateEvent}>
            <input placeholder="Event Title (e.g. Music Fest)" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
            <input placeholder="Date" type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required />
            <input placeholder="Location" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} required />
            <textarea placeholder="Description" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
            <button type="submit" className="create-btn">Publish Event 🚀</button>
            <p className="status">{createStatus}</p>
          </form>

          <h3>Your Active Events:</h3>
          <ul className="event-list">
            {events.length === 0 && <p style={{color: '#666'}}>No active events.</p>}
            {events.map(ev => (
              <li key={ev._id} className="event-item">
                <div className="event-info">
                  <strong>{ev.title}</strong>
                  <span>{ev.date}</span>
                </div>
                <button className="delete-btn" onClick={() => handleEndEvent(ev._id)}>End Event 🗑️</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>✅ Live Entry List ({attendees.length})</h2>
            <button onClick={handleReset} className="reset-btn">Clear History 🧹</button>
          </div>
          <div className="table-container">
            <table>
                <thead><tr><th>Name</th><th>Event</th><th>Status</th></tr></thead>
                <tbody>
                {attendees.length === 0 ? (
                    <tr><td colSpan="3" style={{textAlign: 'center', color: '#666', padding: '20px'}}>List is empty</td></tr>
                ) : (
                    attendees.map((p) => (
                    <tr key={p._id}>
                        <td>{p.name}</td>
                        <td>{p.eventName || 'General'}</td> 
                        <td><span className="badge">Inside</span></td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body { background: #111; color: white; font-family: -apple-system, sans-serif; padding: 20px; margin: 0; }
        .container { max-width: 1100px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #333; padding-bottom: 20px; }
        .header-left { display: flex; flex-direction: column; }
        .user-email { font-size: 0.9rem; color: #888; margin-top: 5px; }
        .header-right { display: flex; gap: 15px; align-items: center; }
        h1 { margin: 0; background: linear-gradient(90deg, #fff, #aaa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .scan-btn { background: #0070f3; color: white; padding: 8px 15px; border-radius: 6px; text-decoration: none; font-weight: bold; }
        .logout-btn { background: #333; color: white; border: 1px solid #555; padding: 8px 15px; border-radius: 6px; cursor: pointer; }
        .logout-btn:hover { background: #444; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
        .card { background: #161616; padding: 25px; border-radius: 12px; border: 1px solid #333; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px; }
        h2 { font-size: 1.2rem; margin: 0; }
        h3 { font-size: 1rem; color: #888; margin-top: 30px; }
        input, textarea { width: 100%; padding: 12px; margin-bottom: 12px; background: #0a0a0a; border: 1px solid #333; color: white; border-radius: 6px; box-sizing: border-box; }
        .create-btn { width: 100%; padding: 12px; background: #0070f3; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
        .delete-btn { background: #331111; color: #ff4444; border: 1px solid #550000; padding: 6px 12px; font-size: 0.8rem; border-radius: 4px; cursor: pointer; }
        .reset-btn { background: #222; color: #bbb; border: 1px solid #444; padding: 6px 12px; font-size: 0.8rem; border-radius: 4px; cursor: pointer; }
        .event-list { padding: 0; list-style: none; }
        .event-item { display: flex; justify-content: space-between; align-items: center; background: #222; padding: 12px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #333; }
        .event-info { display: flex; flex-direction: column; }
        .event-info span { font-size: 0.8rem; color: #777; }
        .table-container { max-height: 500px; overflow-y: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th { text-align: left; color: #666; padding: 10px; border-bottom: 1px solid #333; }
        td { padding: 12px 10px; border-bottom: 1px solid #222; }
        .badge { background: rgba(27, 77, 46, 0.5); color: #4ade80; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; border: 1px solid #1b4d2e; }
        .status { margin-top: 10px; color: #00ff88; text-align: center; }
      `}</style>
    </div>
  );
}