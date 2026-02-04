import { signIn, getSession } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState('');

  const handleEmailLogin = (e) => {
    e.preventDefault();
    signIn('email', { email });
  };

  return (
    <div className="container">
      <div className="card">
        <h1>🔐 TicketOrder Login</h1>
        <p>Sign in to manage your events and scan tickets.</p>

        {/* Option 1: Social Login */}
        <button 
          onClick={() => signIn('google')} 
          className="btn google"
        >
          <span className="icon">G</span> Sign in with Google
        </button>

        <div className="divider">OR</div>

        {/* Option 2: Email OTP */}
        <form onSubmit={handleEmailLogin}>
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn email">
            Send Login Link 📧
          </button>
        </form>
      </div>

      <style jsx>{`
        .container { height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; }
        .card { background: #111; padding: 40px; border-radius: 12px; border: 1px solid #333; width: 100%; max-width: 400px; text-align: center; color: white; }
        h1 { margin-bottom: 10px; }
        p { color: #888; margin-bottom: 30px; }
        
        .btn { width: 100%; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; transition: 0.2s; }
        
        .google { background: white; color: black; }
        .google:hover { background: #ddd; }
        
        .email { background: #0070f3; color: white; margin-top: 10px; }
        .email:hover { background: #0056b3; }

        input { width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #333; background: #000; color: white; box-sizing: border-box; }
        
        .divider { margin: 20px 0; color: #555; font-size: 0.8rem; font-weight: bold; }
        .icon { font-weight: bold; font-family: serif; }
      `}</style>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (session) {
    return { redirect: { destination: '/dashboard', permanent: false } };
  }
  return { props: {} };
}