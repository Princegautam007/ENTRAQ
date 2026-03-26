import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Analytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState(null);
  
  // AI Predictor State
  const [ticketInput, setTicketInput] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session) {
      fetch('/api/metrics').then(res => res.json()).then(data => setMetrics(data));
    }
  }, [session, status]);

  // Function to ask the Python AI server for a prediction
  const askAI = async () => {
    if (!ticketInput) return;
    setLoadingAI(true);
    try {
      const response = await fetch(`http://localhost:8000/predict?tickets=${ticketInput}`);
      const data = await response.json();
      setPrediction(data.predicted_attendance);
    } catch (error) {
      alert("AI offline. Ensure your FastAPI Python server is running on port 8000!");
    }
    setLoadingAI(false);
  };

  if (!metrics) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Loading AI Analytics...</div>;

  const barChartData = {
    labels: metrics.topEvents.map(e => e[0].substring(0, 15) + '...'),
    datasets: [
      { label: 'Tickets Sold', data: metrics.topEvents.map(e => e[1].sold), backgroundColor: '#0070f3' },
      { label: 'Actually Attended', data: metrics.topEvents.map(e => e[1].scanned), backgroundColor: '#4ade80' }
    ]
  };

  const doughnutData = {
    labels: ['Attended', 'No-Show'],
    datasets: [{
      data: [metrics.scannedTickets, metrics.totalTickets - metrics.scannedTickets],
      backgroundColor: ['#4ade80', '#ff4444'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="container">
      <nav className="navbar">
        <h1>📊 Data Insights & AI</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <a href="/" className="home-btn" style={{ background: '#333' }}>
            🏠 Home
          </a>
          <a href="/dashboard" className="home-btn">
            ⬅ Dashboard
          </a>
        </div>
      </nav>

      {/* --- NEW: AI PREDICTOR WIDGET --- */}
      <div className="ai-card">
        <div className="ai-header">
          <h2>🤖 AI Attendance Predictor</h2>
          <p>Powered by Linear Regression</p>
        </div>
        <div className="ai-controls">
          <input 
            type="number" 
            placeholder="E.g., 500 tickets sold..." 
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            className="ai-input"
          />
          <button onClick={askAI} className="ai-btn" disabled={loadingAI}>
            {loadingAI ? "Thinking..." : "Predict Turnout"}
          </button>
        </div>
        
        {prediction !== null && (
          <div className="ai-result">
            If you sell <strong>{ticketInput}</strong> tickets, expect roughly <span className="highlight">{prediction}</span> people to show up.
          </div>
        )}
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Tickets Sold</h3>
          <p className="number">{metrics.totalTickets}</p>
        </div>
        <div className="metric-card">
          <h3>Total Scans</h3>
          <p className="number" style={{color: '#4ade80'}}>{metrics.scannedTickets}</p>
        </div>
        <div className="metric-card">
          <h3>Avg. Attendance Rate</h3>
          <p className="number" style={{color: '#f5a623'}}>{metrics.attendanceRate}%</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h2>Top 5 Events by Volume</h2>
          <Bar data={barChartData} options={{ responsive: true, color: 'white' }} />
        </div>
        <div className="chart-container doughnut">
          <h2>Overall Show-up Rate</h2>
          <Doughnut data={doughnutData} options={{ color: 'white' }} />
        </div>
      </div>

      <style jsx global>{`
        body { background: #000; color: white; font-family: sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .navbar { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .home-btn { background: #222; color: white; padding: 10px 15px; text-decoration: none; border-radius: 8px; border: 1px solid #444; }
        
        /* AI Card Styles */
        .ai-card { background: linear-gradient(145deg, #1e1e2f, #111); padding: 30px; border-radius: 12px; border: 1px solid #6366f1; margin-bottom: 40px; text-align: center; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2); }
        .ai-header h2 { margin: 0; color: #fff; font-size: 1.5rem; }
        .ai-header p { margin: 5px 0 20px 0; color: #888; font-size: 0.9rem; }
        .ai-controls { display: flex; justify-content: center; gap: 15px; margin-bottom: 20px; }
        .ai-input { padding: 12px; border-radius: 8px; border: 1px solid #444; background: #222; color: white; width: 250px; font-size: 1rem; }
        .ai-btn { background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s; font-size: 1rem; }
        .ai-btn:hover { background: #4f46e5; }
        .ai-btn:disabled { background: #555; cursor: not-allowed; }
        .ai-result { background: rgba(99, 102, 241, 0.1); padding: 15px; border-radius: 8px; display: inline-block; font-size: 1.1rem; border: 1px solid rgba(99, 102, 241, 0.3); }
        .highlight { color: #4ade80; font-weight: bold; font-size: 1.3rem; }

        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric-card { background: #111; padding: 25px; border-radius: 12px; border: 1px solid #333; text-align: center; }
        .metric-card h3 { margin: 0; color: #888; font-size: 1rem; text-transform: uppercase; }
        .number { font-size: 3rem; font-weight: bold; margin: 10px 0 0 0; }
        .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .chart-container { background: #111; padding: 20px; border-radius: 12px; border: 1px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        h2 { text-align: center; font-size: 1.2rem; margin-bottom: 20px; color: #ccc; }
        @media (max-width: 768px) { .charts-grid { grid-template-columns: 1fr; } .ai-controls { flex-direction: column; align-items: center; } }
      `}</style>
    </div>
  );
}