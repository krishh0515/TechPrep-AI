import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { Code2, Wand2, Loader2, AlertCircle } from 'lucide-react';

const API_BASE = '/code';

const CodeExplain = () => {
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExplain = async () => {
    if (!code.trim()) {
      setError('Please paste some code to explain.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`${API_BASE}/explain`, { code });
      setExplanation(res.data.explanation);
    } catch (err) {
      setError(err.message || 'Failed to explain code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col space-y-8">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Code2 className="w-8 h-8 text-teal-400" />
          Code Explainer
        </h1>
        <p className="text-text-secondary mt-2">Paste confusing or complex code and get simple, jargon-free bullet points.</p>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 h-[600px]">
        {/* Editor Side */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col relative overflow-hidden group border-white/10 focus-within:border-teal-500/50 transition-colors">
          <div className="flex justify-between items-center px-2 pb-4 border-b border-white/10 mb-4">
            <span className="text-sm font-medium text-text-secondary uppercase tracking-wider">Input Code</span>
            <button
              onClick={handleExplain}
              disabled={loading}
              className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
               Explain
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            placeholder="function example() {&#10;  // Paste your complex code here...&#10;}"
            className="w-full flex-1 bg-transparent border-none text-white font-mono text-sm leading-relaxed focus:outline-none resize-none"
          />
        </div>

        {/* Output Side */}
        <div className="glass-card p-6 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <span className="text-sm font-medium text-text-secondary uppercase tracking-wider border-b border-white/10 pb-4 mb-4 block">
            AI Explanation
          </span>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-teal-500/50 gap-4">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="text-sm font-medium animate-pulse">Analyzing logic...</p>
              </div>
            ) : explanation ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white text-lg leading-relaxed whitespace-pre-wrap"
              >
                {explanation}
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary/50 text-center px-8">
                Paste code and click explain to see how the AI breaks it down into simple concepts.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExplain;
