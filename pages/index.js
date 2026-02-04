import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      {/* --- HERO SECTION --- */}
      <main className="main">
        <h1 className="title">
          Welcome to <span className="brand">TicketOrder</span>
        </h1>
        <p className="subtitle">
          The fastest way to host events and validate tickets securely.
        </p>

        {/* --- ACTION CARDS --- */}
        <div className="grid">
          
          {/* Card 1: For Attendees */}
          <Link href="/entry" className="card user-card">
            <h2>🎟️ Join an Event &rarr;</h2>
            <p>Register yourself and get your unique QR ticket instantly via email.</p>
          </Link>

          {/* Card 2: For Hosts */}
          <Link href="/dashboard" className="card host-card">
            <h2>⚡ Host Dashboard &rarr;</h2>
            <p>Send bulk tickets, manage your guest list, and track live entries.</p>
          </Link>

          {/* Card 3: For Gatekeepers */}
          <Link href="/scan" className="card scan-card">
            <h2>📷 Ticket Scanner &rarr;</h2>
            <p>Open the camera to scan and validate tickets at the door.</p>
          </Link>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="footer">
        <p>Powered by Next.js & TicketOrder Security</p>
      </footer>

      {/* --- CSS STYLES --- */}
      <style jsx global>{`
        body {
          background: #000;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin: 0;
          padding: 0;
        }

        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0 20px;
        }

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 900px;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
          letter-spacing: -2px;
        }

        .brand {
          background: linear-gradient(90deg, #7928CA, #FF0080);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          text-align: center;
          line-height: 1.5;
          font-size: 1.2rem;
          color: #888;
          margin: 20px 0 60px;
        }

        /* GRID SYSTEM */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          width: 100%;
        }

        /* CARDS */
        .card {
          padding: 25px;
          text-decoration: none;
          border: 1px solid #333;
          border-radius: 15px;
          transition: color 0.15s ease, border-color 0.15s ease, transform 0.2s;
          background: #111;
          color: inherit;
        }

        .card:hover {
          border-color: #7928CA;
          transform: translateY(-5px);
          background: #161616;
        }

        .card h2 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1rem;
          line-height: 1.5;
          color: #aaa;
        }

        /* SPECIAL BORDER COLORS */
        .user-card:hover { border-color: #0070f3; }  /* Blue for Users */
        .host-card:hover { border-color: #FF0080; }  /* Pink for Hosts */
        .scan-card:hover { border-color: #7928CA; }  /* Purple for Scanners */

        .footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #333;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #444;
          margin-top: 50px;
        }
      `}</style>
    </div>
  );
}