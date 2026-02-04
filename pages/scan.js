import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Scan() {
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    // Only load scanner if we are NOT showing a result
    if (scanResult) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 5, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText) {
      scanner.clear(); 
      handleCheckIn(decodedText);
    }

    function onScanFailure(error) {
      // Keep silent on errors to avoid console spam
    }

    return () => {
      scanner.clear().catch(err => console.error("Scanner cleanup error", err));
    };
  }, [scanResult]);

  async function handleCheckIn(qrData) {
    try {
      const parsedData = JSON.parse(qrData);
      const ticketId = parsedData.ticketId;

      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });

      const data = await res.json();

      // Handle "Already Used" (400) specifically
      if (res.status === 400) {
        setScanResult({ 
          success: false, 
          message: "⚠️ ALREADY SCANNED", 
          name: data.name,
          time: new Date().toLocaleTimeString() 
        });
        return;
      }

      if (!res.ok) {
        setScanResult({ success: false, message: `Server Error: ${res.status}` });
        return;
      }

      // Success!
      setScanResult({
        success: true,
        name: data.name,
        time: new Date().toLocaleTimeString()
      });

    } catch (err) {
      setScanResult({ success: false, message: "Invalid QR Format" });
    }
  }

  return (
    <div className="container">
      <nav className="navbar">
        <a href="/dashboard" className="back-link">&larr; Dashboard</a>
        <span className="logo">TicketOrder Scan</span>
      </nav>

      <div className="scanner-card">
        
        {/* STATE 1: CAMERA VIEW */}
        {!scanResult && (
          <div className="camera-wrapper">
            <h2>Ready to Scan</h2>
            <p>Point camera at the guest's QR code</p>
            <div id="reader" className="reader-box"></div>
          </div>
        )}

        {/* STATE 2: RESULT VIEW */}
        {scanResult && (
          <div className={`result-view ${scanResult.success ? 'success' : 'error'}`}>
            <div className="icon">
              {scanResult.success ? '✅' : '❌'}
            </div>
            
            <h1 className="status-text">
              {scanResult.success ? 'ACCESS GRANTED' : scanResult.message}
            </h1>

            {scanResult.name && (
              <div className="guest-info">
                <span className="label">Guest Name</span>
                <span className="name">{scanResult.name}</span>
                <span className="time">Scanned at {scanResult.time}</span>
              </div>
            )}

            <button 
              onClick={() => window.location.reload()} 
              className="next-btn"
            >
              Scan Next Person 📷
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        body { background: #000; color: white; font-family: -apple-system, sans-serif; margin: 0; padding: 0; }
        
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }

        .navbar {
          width: 100%;
          max-width: 500px;
          display: flex;
          justify-content: space-between;
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid #333;
        }
        .back-link { color: #888; text-decoration: none; font-size: 0.9rem; }
        .logo { font-weight: bold; color: #fff; }

        .scanner-card {
          width: 100%;
          max-width: 400px;
          background: #111;
          border-radius: 20px;
          border: 1px solid #333;
          padding: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        /* CAMERA STYLES */
        .camera-wrapper h2 { margin: 0 0 10px 0; font-size: 1.5rem; }
        .camera-wrapper p { color: #666; margin-bottom: 20px; font-size: 0.9rem; }
        .reader-box { 
          border-radius: 10px; 
          overflow: hidden; 
          border: 2px solid #333;
        }

        /* RESULT STYLES */
        .result-view { padding: 20px 0; animation: popIn 0.3s ease; }
        
        .icon { font-size: 4rem; margin-bottom: 10px; }
        
        .status-text { 
          font-size: 1.8rem; 
          margin: 10px 0; 
          line-height: 1.2;
          font-weight: 800;
          text-transform: uppercase;
        }

        /* Success Colors */
        .success .status-text { color: #4ade80; text-shadow: 0 0 20px rgba(74, 222, 128, 0.3); }
        .success .icon { filter: drop-shadow(0 0 20px rgba(74, 222, 128, 0.4)); }

        /* Error Colors */
        .error .status-text { color: #ff4444; text-shadow: 0 0 20px rgba(255, 68, 68, 0.3); }
        .error .icon { filter: drop-shadow(0 0 20px rgba(255, 68, 68, 0.4)); }

        .guest-info {
          background: #222;
          margin: 20px 0;
          padding: 15px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .label { color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
        .name { font-size: 1.5rem; font-weight: bold; color: white; }
        .time { color: #555; font-size: 0.8rem; margin-top: 5px; }

        .next-btn {
          width: 100%;
          background: white;
          color: black;
          font-size: 1.1rem;
          font-weight: bold;
          padding: 15px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          margin-top: 10px;
          transition: transform 0.1s;
        }
        .next-btn:active { transform: scale(0.98); background: #ddd; }

        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}