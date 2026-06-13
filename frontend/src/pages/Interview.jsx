import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { Bot, User, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE = '/interview';

const Interview = () => {
  const [step, setStep] = useState('setup'); // setup, answering, feedback
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateQuestion = async () => {
    if (!topic.trim()) {
      setError('Please provide a topic');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`${API_BASE}/question`, { topic, difficulty });
      setQuestion(res.data.question);
      setStep('answering');
    } catch (err) {
      setError(err.message || 'Failed to generate question');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError('Please provide an answer');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`${API_BASE}/evaluate`, { question, answer });
      setFeedback(res.data.feedback);
      setScore(res.data.score);
      setStep('feedback');
    } catch (err) {
      setError(err.message || 'Failed to evaluate answer');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('setup');
    setQuestion('');
    setAnswer('');
    setFeedback('');
    setScore(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Mock Interview Simulator</h1>
        <p className="text-text-secondary mt-2">Practice under pressure with an AI interviewer.</p>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel p-8 rounded-2xl"
          >
            <h2 className="text-xl font-semibold mb-6">Configure Interview</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Topic (e.g., React hooks, Binary Trees, System Design)</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-surface-hover/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                  placeholder="Enter a topic..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-surface-hover/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow appearance-none"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <button
                onClick={generateQuestion}
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Question'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'answering' && (
          <motion.div
            key="answering"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glass-card p-6 rounded-2xl flex gap-4 border-l-4 border-l-primary-500">
              <div className="bg-primary-500/20 p-3 rounded-full h-fit flex-shrink-0">
                <Bot className="w-6 h-6 text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-primary-400 mb-1">Interviewer</h3>
                <p className="text-white text-lg leading-relaxed">{question}</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl relative">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... Be as detailed as possible."
                className="w-full h-64 bg-transparent border-none text-white focus:outline-none resize-none"
              />
              <div className="absolute bottom-6 right-6">
                <button
                  onClick={submitAnswer}
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-500 py-2 px-6 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Submit <Send className="w-4 h-4 ml-1" /></>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'feedback' && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
              <h2 className="text-2xl font-bold">Evaluation Complete</h2>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle className="text-surface-hover" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                  <circle 
                    className="text-primary-500 transition-all duration-1000 ease-out" 
                    strokeWidth="8" 
                    strokeDasharray={364} 
                    strokeDashoffset={364 - (364 * (score || 0)) / 10}
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="58" 
                    cx="64" 
                    cy="64" 
                  />
                </svg>
                <div className="absolute flex items-end">
                  <span className="text-4xl font-bold">{score}</span>
                  <span className="text-xl text-text-secondary mb-1">/10</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex gap-4">
               <div className="bg-green-500/20 p-3 rounded-full h-fit flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-400 mb-2">Detailed Feedback</h3>
                <div className="text-white whitespace-pre-wrap leading-relaxed">
                  {feedback}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={reset}
                className="bg-surface hover:bg-surface-hover border border-white/10 py-3 px-8 rounded-lg font-medium transition-colors"
              >
                Try Another Question
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Interview;
