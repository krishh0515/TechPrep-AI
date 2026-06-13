import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquareText, Code2, Trophy, Flame, Activity, FileText, Sparkles, Cpu, ListChecks } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, colorClass, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="glass-card p-5 rounded-2xl flex items-center gap-4 group"
  >
    <div className={`p-3 rounded-xl ${colorClass} group-hover:rotate-12 transition-transform`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </motion.div>
);

const FeatureBlock = ({ title, description, to, icon: Icon, colorClass, className = "", span = "" }) => (
  <Link to={to} className={`${span} block group`}>
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`glass-panel p-8 rounded-[2rem] h-full flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${className}`}
    >
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity ${colorClass}`} />
      
      <div>
        <div className="inline-flex p-4 rounded-2xl mb-8 bg-white/5 border border-white/10 group-hover:border-primary-500/50 transition-colors">
          <Icon className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight leading-none italic">{title}</h2>
        <p className="text-text-secondary leading-relaxed font-medium">
          {description}
        </p>
      </div>
      
      <div className="mt-12 flex items-center text-primary-400 font-bold group-hover:translate-x-3 transition-transform">
        EXPLORE MODULE <span className="ml-3 text-2xl">→</span>
      </div>
    </motion.div>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'ENGINEER';

  return (
    <div className="space-y-10 pb-20">
      <header className="pt-12 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-600/20 blur-[100px]" />
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6"
        >
          <Sparkles className="w-4 h-4 text-primary-400" />
          <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Platform Status: Active</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9]"
        >
          WELCOME, <br />
          <span className="text-gradient italic">{userName.toUpperCase()}</span>
        </motion.h1>
      </header>

      {/* Stats Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Interview Streak" value="3 Days" icon={Flame} colorClass="bg-orange-500/40" delay={0.1} />
        <StatCard title="AI Insights" value="24" icon={Cpu} colorClass="bg-blue-500/40" delay={0.2} />
        <StatCard title="Global Rank" value="#1,240" icon={Trophy} colorClass="bg-purple-500/40" delay={0.3} />
        <StatCard title="Accuracy" value="88%" icon={Activity} colorClass="bg-emerald-500/40" delay={0.4} />
      </div>

      {/* Main Feature Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[400px]">
        <FeatureBlock 
          span="md:col-span-8"
          title="Mock Interview"
          description="Engage in production-level technical simulations. Our AI adapts questions based on your real-time responses and target role requirements."
          to="/interview"
          icon={MessageSquareText}
          colorClass="bg-primary-500"
        />
        <FeatureBlock 
          span="md:col-span-4"
          title="Code Explainer"
          description="Deconstruct complex logic into plain English. Supports 20+ languages."
          to="/code-explain"
          icon={Code2}
          colorClass="bg-teal-500"
        />
        <FeatureBlock 
          span="md:col-span-5"
          title="Resume Analyzer"
          description="Upload your CV for deep-level scanning. Get personalized feedback on how to beat the ATS and tailored prep questions."
          to="/resume-analyze"
          icon={FileText}
          colorClass="bg-indigo-500"
        />
        <FeatureBlock 
          span="md:col-span-7"
          title="Voice Mock"
          description="Speak your mind. Use voice interaction to simulate high-pressure phone screenings and behavioral rounds."
          to="/voice-interview"
          icon={MessageSquareText}
          colorClass="bg-pink-500"
          className="border-primary-500/20"
        />
        <FeatureBlock 
          span="md:col-span-6"
          title="LeetCode Tracker"
          description="Track problems by difficulty and status. Add links, topics, and mark To Do, In Progress, or Done. Data stays in your browser."
          to="/leetcode-tracker"
          icon={ListChecks}
          colorClass="bg-amber-500"
        />
      </div>
    </div>
  );
};

export default Dashboard;
