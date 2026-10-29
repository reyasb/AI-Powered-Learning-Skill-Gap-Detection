import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setEmail('demo@skillmap.ai');
      setPassword('DemoUser@2026');
    } else {
      setEmail('admin@skillmap.ai');
      setPassword('AdminMaster@2026');
    }
  };

  return (
    <div className="min-h-screen bg-[#080912] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background neon ambient gradients */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#101321] border border-[#1F2438] hover:border-violet-500/40 rounded-2xl shadow-2xl p-8 relative z-10 transition-all">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 p-0.5 shadow-neon-violet mb-4">
            <div className="w-full h-full bg-[#101321] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome to SkillMap AI</h2>
          <p className="text-sm text-gray-400 mt-1">
            Sign in to access your skill gap intelligence and personalized roadmap
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institution.edu"
                className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-neon-violet flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Logins for Evaluator */}
        <div className="mt-6 pt-6 border-t border-[#1F2438]">
          <p className="text-[11px] font-mono uppercase text-gray-400 text-center tracking-wider mb-3">
            Quick Demo Autofill
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('student')}
              className="px-3 py-2 rounded-xl bg-[#17192B] border border-violet-500/20 hover:border-violet-500/60 text-xs text-violet-300 flex items-center justify-center space-x-1.5 transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Demo Student</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="px-3 py-2 rounded-xl bg-[#17192B] border border-cyan-500/20 hover:border-cyan-500/60 text-xs text-cyan-300 flex items-center justify-center space-x-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};
