import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api_config';
import { useAuth } from '../context/AuthContext';

const BreachSimulator = ({ onBreachComplete }) => {
  const { token } = useAuth();
  const [isSimulating, setIsSimulating] = useState(false);
  const [attackProgress, setAttackProgress] = useState(0);

  const runSimulation = async () => {
    if (!token || isSimulating) return;
    setIsSimulating(true);
    setAttackProgress(0);

    const endpoints = [
      'costs', 'salaries', 'compliance', 'costs', 'compliance', 
      'salaries', 'costs', 'compliance', 'salaries', 'costs'
    ];

    for (let i = 0; i < endpoints.length; i++) {
      try {
        // Fire intentional unauthorized requests
        await axios.get(`${API_BASE_URL}/v1/data/${endpoints[i]}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        // We expect failure (403 Forbidden)
        console.log(`[Simulator] Breach attempt ${i+1} blocked: ${endpoints[i]}`);
      }
      setAttackProgress(((i + 1) / endpoints.length) * 100);
      await new Promise(r => setTimeout(r, 400)); // Dynamic pulse delay
    }

    setIsSimulating(false);
    if (onBreachComplete) onBreachComplete();
  };

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-red-500/30 shadow-2xl overflow-hidden relative group">
      {/* Background Pulse Effect */}
      <div className={`absolute inset-0 bg-red-600/5 transition-opacity duration-1000 ${isSimulating ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <span className={`w-3 h-3 rounded-full ${isSimulating ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`} />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Nexus Chaos Engine</h3>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-sm">
            Launch cross-sector intrusion simulation to verify OPA/Audit latency and AI threat detection.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          {isSimulating ? (
            <div className="w-48 space-y-2">
               <div className="flex justify-between text-[10px] font-black text-red-500 uppercase tracking-widest">
                 <span>Intrusion Progress</span>
                 <span>{Math.round(attackProgress)}%</span>
               </div>
               <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-red-600 transition-all duration-300" 
                   style={{ width: `${attackProgress}%` }}
                 />
               </div>
            </div>
          ) : (
            <button 
              onClick={runSimulation}
              className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-600/20"
            >
              🚀 Simulate Cyber Attack
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreachSimulator;
