import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import FinanceView from './components/FinanceView';
import HRView from './components/HRView';
import LegalView from './components/LegalView';
import AuditView from './components/AuditView';

// Error Boundary for UI Resilience
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-12">
          <div className="text-center max-w-xl">
            <h2 className="text-5xl font-black mb-6 text-red-500 uppercase italic">Sector Breach Detected</h2>
            <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">A runtime fault has compromised this logic node. Redirecting to safe zone...</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-red-600 rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-900/40"
            >
              REBOOT TO SAFE VAULT
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Guard
const RoleGuard = ({ allowedRole, children }) => {
  const { user, token } = useAuth();
  
  // 1. If no token, they aren't logged in at all
  if (!token) return <Navigate to="/login" replace />;
  
  // 2. RACE CONDITION FIX: If we have a token but the 'user' object is still being 
  // populated by AuthContext, show a loading state instead of redirecting to unauthorized.
  if (token && !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white font-black animate-pulse uppercase tracking-[0.5em]">Authenticating Node...</div>
      </div>
    );
  }
  
  // 3. Only redirect if the user profile is ready AND the role doesn't match
  if (user?.role !== allowedRole) return <Navigate to="/unauthorized" replace />;
  
  return <DashboardLayout>{children}</DashboardLayout>;
};

// Simulation Login Component
const LoginSimulation = () => {
  const { login, token, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to the correct base
  React.useEffect(() => {
    if (token && user?.role) {
      navigate('/' + user.role.toLowerCase());
    }
  }, [token, user, navigate]);

  const handleDemoLogin = (role) => {
    // For demo skip real Keycloak login and just 'spoof' a token locally
    login('dummy-token-' + role);
    // The useEffect above will handle redirection once the user object is populated
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg w-full text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-2 italic">Nexus AI</h1>
        <p className="text-slate-500 font-medium mb-10">Select an Enterprise Security Role to Begin</p>
        
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => handleDemoLogin('Finance')}
            className="group relative flex items-center justify-center gap-4 py-4 rounded-2xl bg-indigo-50 border-2 border-indigo-100 text-indigo-700 font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            <span className="text-xl">📊</span> ACCESS: FINANCE DEPT
          </button>
          <button 
            onClick={() => handleDemoLogin('HR')}
            className="group relative flex items-center justify-center gap-4 py-4 rounded-2xl bg-green-50 border-2 border-green-100 text-green-700 font-bold hover:bg-green-600 hover:text-white transition-all shadow-sm"
          >
            <span className="text-xl">🧘</span> ACCESS: HR & PAYROLL
          </button>
          <button 
            onClick={() => handleDemoLogin('Legal')}
            className="group relative flex items-center justify-center gap-4 py-4 rounded-2xl bg-red-50 border-2 border-red-100 text-red-700 font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            <span className="text-xl">⚖️</span> ACCESS: LEGAL COMPLIANCE
          </button>
          <button 
            onClick={() => handleDemoLogin('Engineering')}
            className="group relative flex items-center justify-center gap-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-700 font-bold hover:bg-slate-800 hover:text-white transition-all shadow-sm"
          >
            <span className="text-xl">🛠️</span> ACCESS: SYS ADMIN / ENG
          </button>
        </div>
      </div>
    </div>
  );
};

const Unauthorized = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-12">
      <div className="max-w-md text-center">
         <div className="text-6xl mb-6">🚫</div>
         <h1 className="text-4xl font-black text-red-700 mb-4">ACCESS DENIED</h1>
         <p className="text-red-900/60 font-medium mb-8">Your JWT does not grant visibility into this departmental sector. Your attempt has been logged for audit.</p>
         <button 
           onClick={() => {
             logout();
             window.location.href = '/login';
           }}
           className="px-8 py-4 bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-800 transition-all active:scale-95 shadow-xl shadow-red-500/20"
         >
           Reset Identity & Return
         </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginSimulation />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route path="/finance" element={<RoleGuard allowedRole="Finance"><FinanceView /></RoleGuard>} />
          <Route path="/hr" element={<RoleGuard allowedRole="HR"><HRView /></RoleGuard>} />
          <Route path="/legal" element={<RoleGuard allowedRole="Legal"><LegalView /></RoleGuard>} />
          <Route path="/engineering" element={<RoleGuard allowedRole="Engineering"><AuditView /></RoleGuard>} />
          <Route path="/audit" element={<RoleGuard allowedRole="Engineering"><AuditView /></RoleGuard>} />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
