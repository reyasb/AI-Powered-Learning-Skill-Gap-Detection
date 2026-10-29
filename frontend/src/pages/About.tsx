import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import {
  Sparkles,
  Cpu,
  Brain,
  Shield,
  Code2,
  Layers,
  ArrowRight,
  GraduationCap,
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080912] text-gray-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 border-b border-[#1F2438] bg-gradient-to-b from-[#101321] to-[#080912] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/10 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About SkillMap AI</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Revolutionizing Technical Education & Career Readiness
            </h1>
            <p className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
              We bridge the gap between static computer science courses and real-world tech industry expectations through automated skill-gap analysis and adaptive AI learning.
            </p>
          </div>
        </section>

        {/* The Problem & Our Solution */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase text-rose-400 tracking-wider">The Problem</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Traditional course websites don’t know what you actually lack.
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Most students spend hundreds of hours watching tutorials without knowing if those skills match their target roles or whether they have critical blind spots in database optimization, distributed systems, or API security.
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Generic certificates fail to demonstrate genuine capability to hiring managers.
              </p>
            </div>

            <div className="bg-[#101321] p-8 rounded-3xl border border-[#1F2438] space-y-4 shadow-xl">
              <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">The SkillMap AI Solution</span>
              <h3 className="text-xl font-bold text-white">
                Intelligent, Grounded, and Adaptive
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-gray-300">
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>AI Resume Skill Parser:</strong> Identifies verified skills and aliases from your actual resume.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <span><strong>Probabilistic Gap Analysis:</strong> Computes exact distance to target career benchmarks.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Targeted Syllabi:</strong> 12 canonical courses structured like top engineering academies.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>RAG Tutor & AI Quizzes:</strong> Study your own materials with grounded question answering.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tech Stack Architecture */}
        <section className="py-16 bg-[#06070E] border-t border-[#1F2438]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Built with Production-Grade Technology
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">
                Engineered for speed, data privacy, and mathematical rigor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#101321] p-6 rounded-2xl border border-[#1F2438] space-y-2">
                <Cpu className="w-6 h-6 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">FAISS & Sentence Transformers</h4>
                <p className="text-xs text-gray-400">Vector similarity search enabling sub-millisecond retrieval for RAG tutor.</p>
              </div>

              <div className="bg-[#101321] p-6 rounded-2xl border border-[#1F2438] space-y-2">
                <Brain className="w-6 h-6 text-violet-400" />
                <h4 className="text-sm font-bold text-white">Bayesian Proficiency Model</h4>
                <p className="text-xs text-gray-400">Adaptive belief updates based on question difficulty, speed, and accuracy.</p>
              </div>

              <div className="bg-[#101321] p-6 rounded-2xl border border-[#1F2438] space-y-2">
                <Code2 className="w-6 h-6 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">FastAPI & Pydantic</h4>
                <p className="text-xs text-gray-400">High-performance async Python backend with automatic OpenAPI validation.</p>
              </div>

              <div className="bg-[#101321] p-6 rounded-2xl border border-[#1F2438] space-y-2">
                <Layers className="w-6 h-6 text-purple-400" />
                <h4 className="text-sm font-bold text-white">React, Vite & Tailwind</h4>
                <p className="text-xs text-gray-400">Futuristic analytics dashboard design system with responsive layouts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center max-w-3xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-white mb-3">Begin Your Personalized Career Journey</h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-6">
            Explore our course catalogue or take a diagnostic skill assessment now.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/courses"
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-neon-violet transition-all"
            >
              Browse Courses
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-[#141829] hover:bg-[#1A1E33] text-gray-200 text-xs font-semibold border border-[#1F2438] transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
