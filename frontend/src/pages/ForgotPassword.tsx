import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#080912] text-gray-100 flex flex-col justify-center items-center p-4 selection:bg-violet-500/30 selection:text-white">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-violet-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md bg-[#101321] rounded-3xl border border-[#1F2438] p-8 shadow-2xl relative z-10">
        
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="flex items-center space-x-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-400 p-0.5 shadow-neon-violet">
              <div className="w-full h-full bg-[#0D0F1B] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              SkillMap AI
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white">Reset Password</h1>
          <p className="text-xs text-gray-400 mt-1">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Check Your Inbox</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              If an account exists for <span className="text-white font-medium">{email}</span>, we have sent instructions to reset your password.
            </p>
            <div className="pt-4">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-neon-violet transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="e.g. demo@skillmap.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0D0F1B] text-xs text-white rounded-xl pl-10 pr-4 py-2.5 border border-[#1F2438] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-neon-violet transition-all"
            >
              {loading ? 'Sending Instructions...' : 'Send Recovery Link'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
