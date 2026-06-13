import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import CodeExplain from './pages/CodeExplain';
import ResumeAnalyze from './pages/ResumeAnalyze';
import VoiceInterview from './pages/VoiceInterview';
import LeetCodeTracker from './pages/LeetCodeTracker';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
              <Route path="/code-explain" element={<ProtectedRoute><CodeExplain /></ProtectedRoute>} />
              <Route path="/resume-analyze" element={<ProtectedRoute><ResumeAnalyze /></ProtectedRoute>} />
              <Route path="/voice-interview" element={<ProtectedRoute><VoiceInterview /></ProtectedRoute>} />
              <Route path="/leetcode-tracker" element={<ProtectedRoute><LeetCodeTracker /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
