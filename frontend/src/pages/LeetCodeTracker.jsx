import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  ListChecks,
  Plus,
  ExternalLink,
  Trash2,
  Filter,
  CheckCircle2,
  Circle,
  Loader2,
  Search,
  BarChart3,
} from 'lucide-react';

import { API_BASE } from '../api';

const STORAGE_KEY = 'techprep-leetcode-problems';
const USERNAME_KEY = 'techprep-leetcode-username';

const DIFFICULTIES = [
  { value: 'Easy', label: 'Easy', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  { value: 'Medium', label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  { value: 'Hard', label: 'Hard', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30' },
];

const STATUSES = [
  { value: 'todo', label: 'To Do', icon: Circle },
  { value: 'in_progress', label: 'In Progress', icon: Loader2 },
  { value: 'done', label: 'Done', icon: CheckCircle2 },
];

function loadProblems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProblems(problems) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
}

const LeetCodeTracker = () => {
  const [problems, setProblems] = useState(loadProblems);
  const [lcUsername, setLcUsername] = useState(() => {
    try {
      return localStorage.getItem(USERNAME_KEY) || '';
    } catch {
      return '';
    }
  });
  const [remoteStats, setRemoteStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState('todo');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const persist = useCallback((next) => {
    setProblems(next);
    saveProblems(next);
  }, []);

  useEffect(() => {
    saveProblems(problems);
  }, [problems]);

  const addProblem = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const newProblem = {
      id: crypto.randomUUID(),
      title: trimmed,
      url: url.trim() || null,
      difficulty,
      topic: topic.trim() || null,
      status,
      addedAt: new Date().toISOString(),
    };
    persist([newProblem, ...problems]);
    setTitle('');
    setUrl('');
    setTopic('');
    setStatus('todo');
    setShowForm(false);
  };

  const updateStatus = (id, newStatus) => {
    persist(
      problems.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const removeProblem = (id) => {
    if (window.confirm('Remove this problem from your tracker?')) {
      persist(problems.filter((p) => p.id !== id));
    }
  };

  const filtered = problems.filter((p) => {
    if (filterDifficulty !== 'all' && p.difficulty !== filterDifficulty) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.topic && p.topic.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const stats = {
    total: problems.length,
    done: problems.filter((p) => p.status === 'done').length,
    easy: problems.filter((p) => p.difficulty === 'Easy').length,
    medium: problems.filter((p) => p.difficulty === 'Medium').length,
    hard: problems.filter((p) => p.difficulty === 'Hard').length,
  };

  const diffMeta = (d) => DIFFICULTIES.find((x) => x.value === d) || DIFFICULTIES[1];
  const statusMeta = (s) => STATUSES.find((x) => x.value === s) || STATUSES[0];

  const fetchRemoteStats = async () => {
    const username = lcUsername.trim();
    if (!username) {
      setStatsError('Please enter your LeetCode username.');
      return;
    }

    setStatsLoading(true);
    setStatsError('');
    try {
      localStorage.setItem(USERNAME_KEY, username);
      const res = await axios.get(`${API_BASE}/leetcode/stats/${encodeURIComponent(username)}`);
      setRemoteStats(res.data);
    } catch (err) {
      setRemoteStats(null);
      setStatsError(
        err.response?.data?.detail ||
          'Failed to fetch stats from LeetCode. Please try again later.'
      );
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
          <ListChecks className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">
          LeetCode <span className="text-amber-400 italic font-medium">Tracker</span>
        </h1>
        <p className="text-text-secondary text-lg font-medium">
          Track problems by difficulty and status. Optionally sync high-level stats from your LeetCode profile.
        </p>
      </header>

      {/* Remote LeetCode stats + local tracker stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-4"
      >
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-amber-400" />
          <div>
            <p className="text-text-secondary text-xs font-semibold uppercase">
              Total solved (LeetCode)
            </p>
            <p className="text-xl font-black text-white">
              {remoteStats?.totalSolved ?? '—'}
            </p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <div>
            <p className="text-text-secondary text-xs font-semibold uppercase">
              Solved in tracker
            </p>
            <p className="text-xl font-black text-white">{stats.done}</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
          <div>
            <p className="text-text-secondary text-xs font-semibold uppercase">Easy</p>
            <p className="text-xl font-black text-white">
              {remoteStats?.easySolved ?? stats.easy}
            </p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <div>
            <p className="text-text-secondary text-xs font-semibold uppercase">Medium</p>
            <p className="text-xl font-black text-white">
              {remoteStats?.mediumSolved ?? stats.medium}
            </p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-rose-400" />
          <div>
            <p className="text-text-secondary text-xs font-semibold uppercase">Hard</p>
            <p className="text-xl font-black text-white">
              {remoteStats?.hardSolved ?? stats.hard}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1">
          <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
            LeetCode username (optional)
          </p>
          <input
            type="text"
            value={lcUsername}
            onChange={(e) => setLcUsername(e.target.value)}
            placeholder="e.g. john_doe"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          {statsError && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{statsError}</p>
          )}
        </div>
        <button
          type="button"
          onClick={fetchRemoteStats}
          disabled={statsLoading}
          className="shrink-0 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {statsLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sync stats
            </>
          ) : (
            <>
              Sync from LeetCode
            </>
          )}
        </button>
      </div>

      {/* Add problem */}
      <div className="glass-panel p-6 rounded-2xl">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add problem
          </button>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={addProblem}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">New problem</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-text-secondary hover:text-white text-sm font-medium"
              >
                Cancel
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Two Sum"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">LeetCode URL (optional)</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Topic (optional)</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Arrays, DP"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors"
            >
              Add to tracker
            </button>
          </motion.form>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or topic..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-text-secondary shrink-0" />
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">All difficulties</option>
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel p-12 rounded-2xl text-center text-text-secondary font-medium"
            >
              {problems.length === 0
                ? 'No problems yet. Add one above.'
                : 'No problems match the current filters.'}
            </motion.div>
          ) : (
            filtered.map((p, i) => {
              const diff = diffMeta(p.difficulty);
              const st = statusMeta(p.status);
              const StatusIcon = st.icon;
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card p-4 rounded-2xl flex flex-wrap items-center gap-4"
                >
                  <button
                    type="button"
                    onClick={() => {
                      const order = ['todo', 'in_progress', 'done'];
                      const i = order.indexOf(p.status);
                      updateStatus(p.id, order[(i + 1) % 3]);
                    }}
                    className={`p-2 rounded-xl border ${diff.border} ${diff.bg} ${diff.color}`}
                    title="Cycle status"
                  >
                    <StatusIcon className={`w-5 h-5 ${p.status === 'done' ? 'text-emerald-400' : ''} ${p.status === 'in_progress' ? 'animate-spin text-amber-400' : ''}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white truncate">{p.title}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${diff.bg} ${diff.color}`}>
                        {p.difficulty}
                      </span>
                      {p.topic && (
                        <span className="text-xs text-text-secondary">{p.topic}</span>
                      )}
                    </div>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 mt-1"
                      >
                        Open on LeetCode <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <select
                    value={p.status}
                    onChange={(e) => updateStatus(p.id, e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeProblem(p.id)}
                    className="p-2 rounded-lg text-text-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LeetCodeTracker;
