import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api_config';
import { useAuth } from '../context/AuthContext';
import { parseAISummary } from '../utils/AIParser';
import DiscoveryVault from './DiscoveryVault';
import NexusAssistant from './NexusAssistant';
import SecureUploader from './SecureUploader';

const HRView = () => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/v1/data/salaries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAI = async () => {
    setIsGenerating(true);
    if (!token) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/v1/ai/summarize/salaries`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiInsight(res.data?.ai_insight || "AI returned empty summary.");
    } catch (err) {
      setAiInsight("AI analysis failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Personnel Gateway</h2>
          <p className="text-slate-500 font-medium">Encrypted Employee Data & Performance Stream</p>
        </div>
        <button 
          onClick={generateAI}
          disabled={isGenerating}
          className="px-8 py-3 bg-hr-main text-white rounded-2xl font-black hover:bg-hr-dark hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-hr-main/20 active:scale-95"
        >
          {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✨'}
          {isGenerating ? 'Compiling AI Report...' : 'Draft HR Insight'}
        </button>
      </div>

      {aiInsight && (
        <div className="glass-panel backdrop-blur-md p-8 rounded-[3rem] border border-hr-main/10 shadow-inner animate-in slide-in-from-top-4 duration-500 max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="sticky top-0 bg-white/80 backdrop-blur-md pb-4 z-10 -mt-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-hr-main shadow-sm border border-hr-main/5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xs font-black text-hr-main uppercase tracking-widest">Automated Talent Analysis</h3>
            </div>
          </div>
          
          <div className="mt-6">
            {(() => {
              const structured = parseAISummary(aiInsight);
              return (
                <div className="space-y-6">
                  {structured.summary && (
                    <div>
                      <h4 className="text-[10px] font-black text-hr-main uppercase tracking-widest mb-1 opacity-60">Executive Summary</h4>
                      <p className="text-slate-800 leading-relaxed font-bold italic text-lg">"{structured.summary}"</p>
                    </div>
                  )}

                  {structured.insights.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-hr-main uppercase tracking-widest mb-3 opacity-60">People Insights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {structured.insights.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white/50 px-4 py-2 rounded-xl border border-hr-main/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-hr-main" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {structured.actions.length > 0 && (
                    <div className="bg-hr-main/5 p-6 rounded-3xl border border-hr-main/10">
                      <h4 className="text-[10px] font-black text-hr-main uppercase tracking-widest mb-3">Policy Recommendations</h4>
                      <div className="space-y-2">
                        {structured.actions.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                             <div className="w-5 h-5 rounded-full bg-hr-main/10 flex items-center justify-center text-[10px] flex-shrink-0">✓</div>
                             {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-32 text-center">
            <div className="w-16 h-16 border-4 border-hr-light border-t-hr-main rounded-full animate-spin mx-auto mb-6" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Talent Data...</span>
          </div>
        ) : (Array.isArray(data) && data.length > 0) ? (
          data.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-hr-main/20 transition-all cursor-default group">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-hr-light/50 rounded-2xl flex items-center justify-center text-hr-main font-black text-xl group-hover:bg-hr-main group-hover:text-white transition-all">
                    {idx + 1}
                  </div>
                  <span className="text-[10px] font-black text-hr-main bg-hr-light px-2 py-1 rounded-lg uppercase">Scorecard</span>
                </div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">{item.content.split(':')[1]?.trim() || item.content}</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.content.split(':')[0] || 'Metric Resource'}</p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex -space-x-2">
                     <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                     <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                   </div>
                   <span className="text-[10px] text-slate-300 font-bold">L1_AUTH</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full h-80 flex flex-col items-center justify-center bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100 p-12 text-center">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-50">👥</div>
             <h4 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Isolation Protocol Active</h4>
             <p className="text-slate-400 font-medium max-w-sm mt-2 text-sm">Postgres RLS has isolated these rows. Your current session tokens do not map to the HR data segment.</p>
          </div>
        )}
      </div>

      <SecureUploader category="HR" onUploadSuccess={fetchData} />
      <DiscoveryVault />
      <NexusAssistant currentCategory="personnel" />
    </div>
  );
};

export default HRView;
