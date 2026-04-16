import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { User, Shield, Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "citizen";
  
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Please enter a valid formatted email address.");
      return;
    }
    if (password.length < 4) {
      setError("Passcode must be at least 4 characters.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      
      const users = JSON.parse(localStorage.getItem("roadguard_registered_users") || "[]");
      
      if (isRegister) {
        // Register flow
        const userExists = users.some(u => u.email === email && u.role === role);
        if (userExists) {
          setError(`User already registered for ${role} role. Please sign in.`);
          return;
        }
        users.push({ email, password, role });
        localStorage.setItem("roadguard_registered_users", JSON.stringify(users));
        setIsRegister(false);
        setPassword("");
        setError("Registration successful! Please login.");
      } else {
        // Login flow
        const user = users.find(u => u.email === email && u.password === password && u.role === role);
        if (!user) {
          setError("User not found or invalid credentials. Please register first.");
          return;
        }
        localStorage.setItem("roadguard_user", role);
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/citizen");
        }
      }
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      <Header />
      <div className="auth-container">
        
        {/* Role Toggle Selector */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <button 
            className={`btn ${role !== 'citizen' ? 'btn-outline' : ''}`} 
            onClick={() => setRole("citizen")}
            style={{ borderRadius: "50px", padding: "0.5rem 1.5rem" }}
          >
            <User size={18} /> Citizen
          </button>
          <button 
            className={`btn ${role !== 'admin' ? 'btn-outline' : ''}`} 
            onClick={() => setRole("admin")}
            style={{ borderRadius: "50px", padding: "0.5rem 1.5rem" }}
          >
            <Shield size={18} /> Authority
          </button>
        </div>

        <div className="card" style={{ width: '400px', textAlign: 'left', padding: "2.5rem 2.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "inline-flex", padding: "1rem", background: role === 'admin' ? 'var(--danger-light)' : 'rgba(59,130,246,0.1)', borderRadius: "50%", color: role === 'admin' ? 'var(--danger)' : 'var(--accent-blue)', marginBottom: "1rem" }}>
              {role === 'admin' ? <Shield size={32} /> : <User size={32} />}
            </div>
            <h2 style={{ fontSize: "1.8rem", color: "var(--primary-navy)", margin: 0 }}>
              {isRegister ? 'Create Account' : (role === 'admin' ? 'Authority Portal' : 'Citizen Access')}
            </h2>
            <p style={{ color: "var(--text-light)", marginTop: "0.5rem" }}>
              {isRegister ? 'Register your credentials into the secured network.' : 'Sign in to continue into the network.'}
            </p>
          </div>

          {error && (
             <div className="alert-banner alert-danger" style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                {error}
             </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {isRegister && (
               <div style={{ position: "relative" }}>
                 <label className="input-label">Full Name</label>
                 <div style={{ position: "relative" }}>
                   <input 
                     type="text" 
                     className="input-field" 
                     style={{ paddingLeft: "1.25rem" }} 
                     placeholder="Enter your full name"
                     required={isRegister}
                   />
                 </div>
               </div>
            )}
            
            <div style={{ position: "relative" }}>
              <label className="input-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <input 
                  type="email" 
                  className="input-field" 
                  style={{ paddingLeft: "2.75rem" }} 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <label className="input-label">Passcode / OTP</label>
              <div style={{ position: "relative" }}>
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ paddingLeft: "2.75rem" }} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ width: "100%", marginTop: "1rem", height: "48px" }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} style={{ animation: "spin 1s linear infinite" }} /> Validating Secure Credentials...
                </>
              ) : (
                isRegister ? "Register & Enter System" : "Authenticate & Login"
              )}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
             <button 
               type="button" 
               onClick={() => setIsRegister(!isRegister)} 
               style={{ background: "none", border: "none", color: "var(--accent-blue)", cursor: "pointer", fontWeight: "600", textDecoration: "underline", fontSize: "0.95rem" }}
             >
               {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register Here"}
             </button>
          </div>
          
          <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    </div>
  );
}
