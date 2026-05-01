import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api_config';
import { useAuth } from '../context/AuthContext';
import { parseAISummary } from '../utils/AIParser';
import BreachSimulator from './BreachSimulator';
import NexusAssistant from './NexusAssistant';

const AuditView = () => {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchLogs = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/audit/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAI = async () => {
    setIsGenerating(true);
    if (!token) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/v1/ai/summarize/audit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiInsight(res.data?.ai_insight || "AI returned empty security brief.");
    } catch (err) {
      setAiInsight("Security Intelligence Node Offline.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="p-10 space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-slate-900 mb-2">Layer 4: Nexus Audit Shield</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Real-Time Security Event Stream &bull; Live Intelligence Active
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={generateAI}
            disabled={isGenerating}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-indigo-900/40 active:scale-95"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : '🔍'}
            {isGenerating ? 'ANALYZING THREATS...' : 'GENERATE INTELLIGENCE'}
          </button>
          <div className="flex gap-4 border-l border-slate-800 pl-6">
          <div className="px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase">Total Events</span>
            <span className="text-xl font-bold text-white tracking-tight">{logs.length}</span>
          </div>
          <div className="px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase">Blocked Attempts</span>
            <span className="text-xl font-bold text-red-500 tracking-tight">
              {logs.filter(l => !l.granted).length}
            </span>
          </div>
          </div>
        </div>
      </header>

      <BreachSimulator onBreachComplete={() => {
        fetchLogs();
        generateAI();
      }} />

      {aiInsight && (
        <div className="relative p-8 rounded-[2.5rem] border border-indigo-100 bg-white/95 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">AI</div>
            <h3 className="text-xs font-black text-indigo-700 uppercase tracking-[0.2em]">Nexus AI Security Brief</h3>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
             {(() => {
                const lines = aiInsight.split('\n').filter(l => l.trim());
                return lines.map((line, i) => {
                  if (line.includes('CURRENT SECURITY POSTURE')) return <div key={i} className="flex flex-col gap-1 mt-2">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Security Posture</span>
                    <p className="text-sm font-bold text-slate-900">{line.replace(/.*POSTURE:/, '').trim()}</p>
                  </div>;
                  if (line.includes('OPERATIONAL INSIGHTS')) return <h4 key={i} className="text-[10px] font-black text-indigo-800 uppercase tracking-widest mt-4">Intelligence Feed</h4>;
                  if (line.includes('MANDATORY ACTION')) return <h4 key={i} className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-4">Defensive Response</h4>;
                  
                  return (
                    <div key={i} className={`flex gap-3 items-start ${line.startsWith('-') || line.startsWith('•') || /^\d\./.test(line) ? 'pl-4' : ''}`}>
                      {(line.startsWith('-') || line.startsWith('•')) && <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-1.5 flex-shrink-0"></span>}
                      <p className={`text-sm ${line.startsWith('-') || line.startsWith('•') ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>
                        {line.replace(/^[-•]\s*/, '')}
                      </p>
                    </div>
                  );
                });
             })()}
          </div>
        </div>
      )}

      <div className="glass-panel overflow-hidden border border-slate-800/50 rounded-[2.5rem]">
        <div className="bg-slate-900/40 p-6 border-b border-slate-800/50 flex items-center justify-between">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">System Event Logs</span>
          <button 
            onClick={fetchLogs}
            className="px-4 py-2 text-[10px] font-black bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all uppercase"
          >
            Terminal Refresh
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/20">
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50">Timestamp</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50">Subject (Role)</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50">Action</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50">Resource</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50">Status</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50">Enforcement Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6 text-xs text-slate-400 font-mono italic">
                    {log.timestamp === 'Now' ? 'LIVE' : new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${
                      log.role === 'Finance' ? 'bg-finance-main/20 text-finance-main' :
                      log.role === 'HR' ? 'bg-hr-main/20 text-hr-main' :
                      log.role === 'Engineering' ? 'bg-indigo-500/20 text-indigo-400' :
                      log.role === 'Legal' ? 'bg-legal-main/20 text-legal-main' :
                      'bg-slate-700/20 text-slate-400'
                    }`}>
                      {log.role}
                    </span>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-300">{log.action}</td>
                  <td className="p-6 text-sm font-bold text-white">{log.resource}</td>
                  <td className="p-6">
                    <span className={`flex items-center gap-2 text-xs font-black uppercase tracking-tighter ${log.granted ? 'text-green-500' : 'text-red-500 animate-pulse'}`}>
                      {log.granted ? '● Authorized' : '✖ Blocked'}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="max-w-xs truncate text-[10px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors italic">
                      {log.details}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <span className="text-4xl">📡</span>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">No active security events detected in the stream.</p>
            </div>
          )}
        </div>
      </div>
      <NexusAssistant currentCategory="audit" />
    </div>
  );
};

export default AuditView;
