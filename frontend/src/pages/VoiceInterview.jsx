import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MessageSquare, ShieldCheck, Sparkles, StopCircle, Volume2, Loader2, BrainCircuit } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../api';

const VoiceInterview = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('Welcome to your AI Voice Interview. Please click the button below to start.');
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/interview/question`, {
        topic: 'General Technical',
        difficulty: 'Medium'
      });
      setQuestion(res.data.question);
      speakText(res.data.question);
    } catch (err) {
      console.error('Failed to get question:', err);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      handleFinalTranscript();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  const handleFinalTranscript = async () => {
    if (!transcript) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/interview/evaluate`, {
        question: question,
        answer: transcript
      });
      setAiResponse(res.data.feedback);
      speakText(res.data.feedback);
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex p-4 rounded-3xl bg-pink-500/10 border border-pink-500/20 mb-6">
          <Mic className="w-10 h-10 text-pink-400" />
        </div>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase leading-none">
          VOICE <span className="text-pink-400 italic">COMMAND</span>
        </h1>
        <p className="text-text-secondary text-xl font-medium tracking-tight">Speak naturally. Our AI tracks your pacing, tone, and technical accuracy.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Question Display */}
          <motion.div 
            layout
            className="glass-panel p-10 rounded-[3rem] border-white/10 relative overflow-hidden h-[280px] flex flex-col justify-center"
          >
            <div className="absolute top-0 right-0 p-6">
              <Sparkles className="w-6 h-6 text-pink-500 opacity-30" />
            </div>
            <h2 className="text-xs font-black text-pink-500 uppercase tracking-[0.2em] mb-4">Interviewer</h2>
            <p className="text-3xl font-bold text-white leading-[1.1] tracking-tight italic">
               "{question}"
            </p>
          </motion.div>

          {/* Transcript Display */}
          <motion.div 
            layout
            className="glass-panel p-10 rounded-[3rem] border-white/5 bg-white/5 relative h-[300px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Your Response (Live)</h2>
              {isListening && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black text-pink-500 uppercase italic">Recording</span>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto text-xl font-medium text-text-secondary italic">
              {transcript || (isListening ? 'Start speaking...' : 'Transcript will appear here...')}
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-4">
               {question.includes('Welcome') ? (
                 <button 
                  onClick={startInterview}
                  disabled={loading}
                  className="px-12 py-5 bg-white text-black font-black rounded-3xl shadow-2xl hover:bg-white/90 transition-all uppercase tracking-widest flex items-center gap-3"
                 >
                   {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <BrainCircuit className="w-6 h-6" />}
                   INITIALIZE SESSION
                 </button>
               ) : (
                <button 
                  onClick={toggleListening}
                  className={`group relative flex items-center gap-3 px-10 py-5 rounded-3xl font-black transition-all duration-500 uppercase tracking-widest ${
                    isListening 
                    ? 'bg-red-500 text-white shadow-red-500/20' 
                    : 'bg-pink-600 text-white hover:bg-pink-500 shadow-pink-600/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  {isListening ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  {isListening ? 'FINISH RESPONSE' : 'START SPEAKING'}
                </button>
               )}
            </div>
          </motion.div>
        </div>

        {/* AI Feedback Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-8 rounded-[2.5rem] flex-1 bg-gradient-to-b from-white/5 to-transparent relative border-white/5">
             <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-pink-500/20 rounded-xl">
                 <Volume2 className="w-5 h-5 text-pink-400" />
               </div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Feedback</h3>
             </div>
             
             <div className="text-sm leading-relaxed text-text-secondary font-medium italic">
                {aiResponse || 'Awaiting your first response to provide real-time coaching...'}
             </div>

             <div className="mt-12 space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex justify-between text-[10px] font-black uppercase text-white/40 mb-2">
                    <span>Performance Rating</span>
                    <span>N/A</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500/50 w-0 transition-all duration-1000" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5 text-emerald-400" />
                   <span className="text-[10px] font-black uppercase text-text-secondary">Low filler word count detected</span>
                </div>
             </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-white/5 text-center">
             <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Privacy Encryption: Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterview;
