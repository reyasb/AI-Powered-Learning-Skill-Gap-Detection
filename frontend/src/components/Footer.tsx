import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Terminal, Shield, Cpu, Code2, BookOpen, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#06070E] border-t border-[#1F2438] text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-400 p-0.5 shadow-neon-violet">
                <div className="w-full h-full bg-[#0D0F1B] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                SkillMap AI
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              An intelligent, adaptive learning platform inspired by GeeksforGeeks Courses with native skill-gap detection, AI-powered roadmaps, and grounded RAG document tutoring.
            </p>
            <div className="flex items-center space-x-3 text-xs text-gray-500 font-mono">
              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-[#101321] border border-[#1F2438]">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>RAG & FAISS</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-[#101321] border border-[#1F2438]">
                <Code2 className="w-3.5 h-3.5 text-violet-400" />
                <span>FastAPI + Vite</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-[#101321] border border-[#1F2438]">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>JWT Auth</span>
              </span>
            </div>
          </div>

          {/* Featured Courses */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center space-x-2">
              <BookOpen className="w-3.5 h-3.5 text-violet-400" />
              <span>Top Courses</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/courses/data-structures-and-algorithms" className="hover:text-violet-400 transition-colors">
                  DSA & Algorithms Mastery
                </Link>
              </li>
              <li>
                <Link to="/courses/full-stack-web-development" className="hover:text-violet-400 transition-colors">
                  Full Stack Web Development
                </Link>
              </li>
              <li>
                <Link to="/courses/generative-ai-and-rag" className="hover:text-violet-400 transition-colors">
                  Generative AI & RAG Engineering
                </Link>
              </li>
              <li>
                <Link to="/courses/python-programming-masterclass" className="hover:text-violet-400 transition-colors">
                  Python Programming Masterclass
                </Link>
              </li>
              <li>
                <Link to="/courses/cybersecurity-ethical-hacking" className="hover:text-violet-400 transition-colors">
                  Cybersecurity & Ethical Hacking
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-violet-400 font-semibold hover:underline">
                  View All 12 Courses &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Intelligence</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/resume-analysis" className="hover:text-cyan-400 transition-colors">
                  Resume Skill Extraction
                </Link>
              </li>
              <li>
                <Link to="/skill-gaps" className="hover:text-cyan-400 transition-colors">
                  Skill-Gap Detection
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-cyan-400 transition-colors">
                  Dynamic Adaptive Roadmap
                </Link>
              </li>
              <li>
                <Link to="/ai-tutor" className="hover:text-cyan-400 transition-colors">
                  RAG Document Tutor
                </Link>
              </li>
              <li>
                <Link to="/quiz-generator" className="hover:text-cyan-400 transition-colors">
                  AI Quiz Generator
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-cyan-400 transition-colors">
                  Career Readiness Score
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Demo Accounts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Accounts</span>
            </h4>
            <div className="bg-[#101321] p-3 rounded-xl border border-[#1F2438] space-y-2 text-[11px] font-mono">
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase">Demo Student:</span>
                <span className="text-cyan-300">demo@skillmap.ai</span>
                <div className="text-gray-400 text-[10px]">Pass: DemoUser@2026</div>
              </div>
              <div className="pt-2 border-t border-[#1F2438]">
                <span className="text-gray-400 block font-semibold text-[10px] uppercase">Admin Access:</span>
                <span className="text-violet-300">admin@skillmap.ai</span>
                <div className="text-gray-400 text-[10px]">Pass: AdminMaster@2026</div>
              </div>
            </div>
            <div className="mt-4 flex space-x-4 text-xs">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-[#1F2438] flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 space-y-4 sm:space-y-0">
          <p>&copy; {new Date().getFullYear()} SkillMap AI. All rights reserved. Built for engineering excellence.</p>
          <div className="flex items-center space-x-6">
            <span className="text-gray-400">Next-Gen Career Intelligence</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-400">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
