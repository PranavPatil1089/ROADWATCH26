import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CitizenDashboard from "./pages/CitizenDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminMap from "./pages/admin/AdminMap";
import Analytics from "./pages/admin/Analytics";
import Suggestions from "./pages/admin/Suggestions";
import DigitalTwin from "./pages/admin/DigitalTwin";

// Protected Route Component
function ProtectedRoute({ children, roleRequired }) {
  const role = localStorage.getItem("roadguard_user");
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  if (roleRequired && role !== roleRequired) {
    return <Navigate to={role === "admin" ? "/admin" : "/citizen"} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Citizen Routes */}
        <Route 
          path="/citizen" 
          element={
            <ProtectedRoute roleRequired="citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute roleRequired="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="map" element={<AdminMap />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="suggestions" element={<Suggestions />} />
          <Route path="digital-twin" element={<DigitalTwin />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
