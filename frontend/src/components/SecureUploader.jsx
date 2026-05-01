import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api_config';
import { useAuth } from '../context/AuthContext';

const SecureUploader = ({ category, onUploadSuccess }) => {
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsUploading(true);
    setStatus(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/v1/data/upload?category=${category}&content=${encodeURIComponent(content)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus({ type: 'success', message: response.data.message });
      setContent('');
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Vault connection failed.";
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Secure Intelligence Deposit</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Sector: {category}</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter intelligence data, budget figures, or personnel updates..."
          className="w-full h-32 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
        />

        <button
          type="submit"
          disabled={isUploading || !content.trim()}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-lg ${
            isUploading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98] shadow-emerald-900/20'
          }`}
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : '🔒 Commit to Vault'}
        </button>
      </form>

      {status && (
        <div className={`mt-6 p-4 rounded-xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          <span>{status.type === 'success' ? '✅' : '🚨'}</span>
          {status.message}
        </div>
      )}
    </div>
  );
};

export default SecureUploader;
