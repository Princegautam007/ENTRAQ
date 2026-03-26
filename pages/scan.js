import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Scan() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Security State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isPinSent, setIsPinSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Scanner State
  const [scanResult, setScanResult] = useState(null);

  // Protect the page: Must be logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 1. Ask Server to Email the PIN
  const handleSendPin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email })
      });
      
      if (res.ok) {
        setIsPinSent(true);
      } else {
        setError("❌ Failed to send email. Check API keys.");
      }
    } catch (err) {
      setError("❌ Server Error");
    }
    setLoading(false);
  };

  // 2. Send PIN to Server to Check
  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth-pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, pin })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setIsUnlocked(true);
      } else {
        setError("❌ Invalid or Expired PIN");
        setPin('');
      }
    } catch(err) {
      setError("❌ Server Error");
    }
    setLoading(false);
  };

  // 3. Initialize Camera (Only when unlocked)
  useEffect(() => {
    if (!isUnlocked || scanResult) return;

    const scanner = new Html5QrcodeScanner(
      "reader", { fps: 5, qrbox: { width: 250, height: 250 } }, false
    );
    scanner.render(onScanSuccess, () => {});

    function onScanSuccess(decodedText) {
      scanner.clear(); 
      handleCheckIn(decodedText);
    }

    return () => { scanner.clear().catch(err => console.error("Cleanup error", err)); };
  }, [isUnlocked, scanResult]);

  // 4. Handle QR Code Ticket
  async function handleCheckIn(qrData) {
    try {
      const parsedData = JSON.parse(qrData);
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: parsedData.ticketId }),
      });
      const data = await res.json();

      if (res.status === 400) {
        setScanResult({ success: false, message: "⚠️ ALREADY SCANNED", name: data.name, time: new Date().toLocaleTimeString() });
        return;
      }
      if (!res.ok) {
        setScanResult({ success: false, message: `Server Error: ${res.status}` });
        return;
      }
      setScanResult({ success: true, name: data.name, time: new Date().toLocaleTimeString() });

    } catch (err) {
      setScanResult({ success: false, message: "Invalid QR Format" });
    }
  }

  // --- LOADING VIEW ---
  if (status === "loading") return <div className="container" style={{justifyContent: 'center'}}>Loading...</div>;
  if (!session) return null;

  // --- VIEW 1: LOCKED SCREEN ---
  if (!isUnlocked) {
    return (
      <div className="container lock-screen">
        <div className="card">
          <h1>🔒 Host Access Only</h1>
          <p>Logged in as: <strong>{session.user.email}</strong></p>
          
          {!isPinSent ? (
            <div>
              <p style={{color: '#888', fontSize: '0.9rem'}}>Click below to receive a secure login code via email.</p>
              <button onClick={handleSendPin} disabled={loading} style={{marginTop: '10px'}}>
                {loading ? 'Sending...' : 'Send PIN to my Email 📧'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyPin}>
              <p style={{color: '#4ade80', fontSize: '0.9rem', marginBottom: '15px'}}>✅ PIN Sent! Check your email.</p>
              <input type="password" placeholder="Enter 4-Digit PIN" value={pin} onChange={(e) => setPin(e.target.value)} maxLength="4" required />
              <button type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Unlock Scanner 🔓'}
              </button>
            </form>
          )}

          {error && <p className="error-msg">{error}</p>}
          
          <a href="/" style={{ display: 'inline-block', marginTop: '30px', background: '#222', color: 'white', padding: '8px 15px', borderRadius: '6px', textDecoration: 'none', border: '1px solid #333' }}>
            🏠 Go Home
          </a>
        </div>

        <style jsx>{`
          .container { height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: white; }
          .card { background: #111; padding: 30px; border-radius: 12px; border: 1px solid #333; text-align: center; max-width: 350px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          h1 { font-size: 1.5rem; margin-bottom: 10px; }
          p { margin-bottom: 10px; }
          input { width: 100%; padding: 15px; font-size: 1.5rem; text-align: center; letter-spacing: 5px; margin-bottom: 15px; background: #000; color: white; border: 1px solid #333; border-radius: 8px; box-sizing: border-box; }
          button { width: 100%; padding: 15px; background: #0070f3; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; }
          button:hover { background: #0056b3; }
          button:disabled { background: #555; cursor: not-allowed; }
          .error-msg { color: #ff4444; margin-top: 15px; font-weight: bold; }
        `}</style>
      </div>
    );
  }

  // --- VIEW 2: THE SCANNER (Unlocked) ---
  return (
    <div className="container">
      <nav className="navbar">
        <button onClick={() => setIsUnlocked(false)} className="lock-btn">🔒 Lock Device</button>
        <a href="/" style={{ background: '#222', color: 'white', padding: '5px 10px', borderRadius: '6px', textDecoration: 'none', border: '1px solid #333', fontSize: '0.9rem' }}>
          🏠 Home
        </a>
        <span className="logo">TicketOrder Scan</span>
      </nav>

      <div className="scanner-card">
        {!scanResult && (
          <div className="camera-wrapper">
            <h2>Ready to Scan</h2>
            <div id="reader" className="reader-box"></div>
          </div>
        )}

        {scanResult && (
          <div className={`result-view ${scanResult.success ? 'success' : 'error'}`}>
            <div className="icon">{scanResult.success ? '✅' : '❌'}</div>
            <h1 className="status-text">{scanResult.success ? 'ACCESS GRANTED' : scanResult.message}</h1>
            
            {scanResult.name && (
              <div className="guest-info">
                <span className="label">Guest Name</span>
                <span className="name">{scanResult.name}</span>
                <span className="time">Scanned at {scanResult.time}</span>
              </div>
            )}
            <button onClick={() => window.location.reload()} className="next-btn">Scan Next Person 📷</button>
          </div>
        )}
      </div>

      <style jsx global>{`
        body { background: #000; color: white; font-family: -apple-system, sans-serif; margin: 0; padding: 0; }
        .container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 20px; box-sizing: border-box; }
        .navbar { width: 100%; max-width: 500px; display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid #333; }
        .lock-btn { background: none; border: none; color: #888; cursor: pointer; }
        .logo { font-weight: bold; }
        .scanner-card { width: 100%; max-width: 400px; background: #111; border-radius: 20px; border: 1px solid #333; padding: 20px; text-align: center; }
        .reader-box { border-radius: 10px; overflow: hidden; border: 2px solid #333; }
        .result-view { padding: 20px 0; }
        .icon { font-size: 4rem; margin-bottom: 10px; }
        .status-text { font-size: 1.8rem; margin: 10px 0; font-weight: 800; text-transform: uppercase; }
        .success .status-text { color: #4ade80; } .error .status-text { color: #ff4444; }
        .guest-info { background: #222; margin: 20px 0; padding: 15px; border-radius: 12px; display: flex; flex-direction: column; }
        .label { color: #888; font-size: 0.8rem; text-transform: uppercase; }
        .name { font-size: 1.5rem; font-weight: bold; margin-top: 5px; }
        .time { color: #555; font-size: 0.8rem; margin-top: 5px; }
        .next-btn { width: 100%; background: white; color: black; font-size: 1.1rem; font-weight: bold; padding: 15px; border: none; border-radius: 12px; cursor: pointer; margin-top: 10px; }
      `}</style>
    </div>
  );
}