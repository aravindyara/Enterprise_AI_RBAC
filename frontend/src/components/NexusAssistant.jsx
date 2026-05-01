import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api_config';
import { useAuth } from '../context/AuthContext';

const NexusAssistant = ({ currentCategory }) => {
  const { token, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0 && user) {
      setMessages([{
        sender: 'ai',
        text: `Greetings. I am your Nexus ${user.role || 'Enterprise'} Assistant. How can I facilitate your departmental operations today?`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !token) return;

    const userMessage = { 
      sender: 'user', 
      text: input, 
      timestamp: new Date().toLocaleTimeString() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/v1/ai/chat/${currentCategory}`, 
        { question: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: res.data.response,
        restricted: res.data.restricted,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "Communication Layer Offline. Security protocols remain active.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-sans">
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-slate-900 rotate-90' : 'bg-indigo-600'
        }`}
      >
        {isOpen ? (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">Nexus Intelligence</h3>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Authorized Assistant Session</p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-indigo-600 px-2 py-1 rounded">RBAC ACTIVE</span>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium shadow-sm transition-all ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : msg.restricted 
                      ? 'bg-red-50 border-2 border-red-500 text-red-900 rounded-tl-none animate-shake' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">{msg.timestamp}</span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query your departmental records..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-slate-800 transition-all active:scale-90"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NexusAssistant;
