import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogIn, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/20 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-10 rounded-[2.5rem] w-full max-w-md relative z-10 border border-white/10 shadow-2xl"
      >
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-4">
            <Sparkles className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            TECHPREP <span className="text-gradient">AI</span>
          </h1>
          <p className="text-text-secondary font-medium">Elevate your career with AI simulation.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-white hover:bg-white/90 text-black font-bold rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                  />
                  <path
                    fill="#34A853"
                    d="M16.04 18.013c-1.09.693-2.43 1.078-3.84 1.14l-4.14 3.22c2.41 1.03 5.03 1.627 7.74 1.627 5.26 0 9.72-3.35 11.41-8.12l-4.22-3.26c-.73 2.53-3.13 5.393-6.95 5.393Z"
                  />
                  <path
                    fill="#4285F4"
                    d="M19.834 7.5c.11.48.166 1 .166 1.5 0 1.22-.303 2.37-.834 3.38l4.22 3.26c1.02-2.04 1.614-4.29 1.614-6.64 0-1.52-.25-2.98-.71-4.34l-4.456 2.84Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M4.026 9.765 0 6.65c-1.02 2.04-1.614 4.29-1.614 6.64 0 1.52.25 2.98.71 4.34l4.456-2.84c-.11-.48-.166-1-.166-1.5 0-1.22.303-2.37.834-3.38Z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="text-center text-xs text-text-secondary mt-10 px-4 leading-relaxed italic">
            By continuing, you agree to step into the future of engineering interviews.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
