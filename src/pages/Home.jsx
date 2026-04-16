import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ShieldCheck, ArrowRight, ShieldAlert, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: "100vh", 
      fontFamily: "'Inter', sans-serif",
      background: "radial-gradient(circle at 50% -20%, #DBEAFE 0%, #F8FAFC 50%, #F8FAFC 100%)",
      overflow: "hidden"
    }}>
      <Header />
      
      <main style={{ padding: "5rem 2rem", maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* Enhanced Official Governance Seal */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "center" }}
          >
            <div style={{ 
              padding: "2rem", 
              border: "1px solid rgba(59, 130, 246, 0.2)", 
              borderRadius: "50%", 
              backgroundColor: "rgba(255, 255, 255, 0.9)", 
              boxShadow: "0 10px 25px rgba(59, 130, 246, 0.1), inset 0 2px 4px rgba(255,255,255,1)",
              backdropFilter: "blur(10px)"
            }}>
               <ShieldAlert size={56} color="#3B82F6" />
            </div>
          </motion.div>

          {/* Premium Official Titling */}
          <div style={{ textAlign: "center", maxWidth: "850px" }}>
            <h1 style={{ fontSize: "3.25rem", color: "#0F172A", fontWeight: "800", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif", letterSpacing: "-1px" }}>
              Nashik Road Safety & Infrastructure Portal
            </h1>
            <h2 style={{ fontSize: "1.25rem", color: "#3B82F6", fontWeight: "600", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "2.5rem" }}>
              Department of City Infrastructure
            </h2>
            
            <p style={{ color: "#475569", fontSize: "1.15rem", lineHeight: "1.8", marginBottom: "4rem", padding: "0 1rem" }}>
              Welcome to the official dataset-driven infrastructure management gateway. This platform empowers authorized personnel to analyze traffic safety anomalies while offering citizens verified, risk-free routing networks. 
            </p>
          </div>

          {/* Premium Action Cards */}
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
            
            {/* Citizen Card */}
            <motion.div 
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
              transition={{ duration: 0.3 }}
              style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(226, 232, 240, 0.8)", backdropFilter: "blur(20px)", borderRadius: "16px", padding: "3rem 2.5rem", flex: "1 1 350px", maxWidth: "450px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}
            >
              <div style={{ width: "64px", height: "64px", backgroundColor: "#EFF6FF", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <Search size={32} color="#3B82F6" />
              </div>
              <h3 style={{ fontSize: "1.5rem", color: "#0F172A", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>Citizen Hub</h3>
              <p style={{ color: "#64748B", marginBottom: "2.5rem", fontSize: "1rem", lineHeight: "1.6" }}>Access public safety routes and active anomaly alerts based on real-time municipal data.</p>
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "#2563EB" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/login?role=citizen")}
                style={{ backgroundColor: "#3B82F6", color: "white", border: "none", padding: "1rem 2rem", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", width: "100%", justifyContent: "center", fontSize: "1.05rem", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}
              >
                Access Public Portal <ArrowRight size={18} />
              </motion.button>
            </motion.div>

            {/* Admin Card */}
            <motion.div 
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
              transition={{ duration: 0.3 }}
              style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(226, 232, 240, 0.8)", backdropFilter: "blur(20px)", borderRadius: "16px", padding: "3rem 2.5rem", flex: "1 1 350px", maxWidth: "450px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}
            >
              <div style={{ width: "64px", height: "64px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <ShieldCheck size={32} color="#0F172A" />
              </div>
              <h3 style={{ fontSize: "1.5rem", color: "#0F172A", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>Authority Interface</h3>
              <p style={{ color: "#64748B", marginBottom: "2.5rem", fontSize: "1rem", lineHeight: "1.6" }}>Secure command center for infrastructure monitoring, dataset modification, and core analytics.</p>
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "#2563EB" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/login?role=admin")}
                style={{ backgroundColor: "#3B82F6", color: "white", border: "none", padding: "1rem 2rem", borderRadius: "8px", fontWeight: "600", cursor: "pointer", width: "100%", fontSize: "1.05rem", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}
              >
                Authority Login <ArrowRight size={18} />
              </motion.button>
            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
