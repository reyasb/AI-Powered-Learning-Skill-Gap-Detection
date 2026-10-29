import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { courseService } from '../services/api';
import type { CourseCard, CourseCategory } from '../types';
import {
  Sparkles,
  Search,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  Code2,
  Terminal,
  Cpu,
  Brain,
  Shield,
  Clock,
  Star,
  Users,
  Compass,
  FileText,
  ChevronDown,
  ChevronRight,
  Zap,
  Check
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesRes, catRes] = await Promise.all([
          courseService.listCourses(),
          courseService.getCategories(),
        ]);
        setCourses(coursesRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Failed to load courses on home page', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/courses');
    }
  };

  const filteredCourses = selectedCategory === 'All'
    ? courses
    : courses.filter(c => c.category === selectedCategory);

  const popularSearches = [
    'Data Structures & Algorithms',
    'Python',
    'Full Stack',
    'Generative AI',
    'Cybersecurity',
    'Cloud and DevOps',
    'System Design'
  ];

  const faqs = [
    {
      q: 'How is SkillMap AI different from traditional course websites?',
      a: 'Unlike static course providers, SkillMap AI pairs production-grade course syllabi with an automated skill gap detection engine. Upload your resume or take an assessment, and our system pinpoints exactly which skills you lack for your dream career and recommends lessons accordingly.'
    },
    {
      q: 'Can I upload my own study documents and ask questions?',
      a: 'Yes! Our built-in AI Tutor uses Retrieval-Augmented Generation (RAG) powered by FAISS vector search. You can upload lecture notes, textbooks, and documentation in PDF format, and receive grounded answers with exact source page citations.'
    },
    {
      q: 'How does the skill proficiency tracking work?',
      a: 'We use a Bayesian proficiency updating algorithm. When you complete lessons, pass interactive quizzes, or take full assessments, your proficiency levels update dynamically, reflecting genuine progress toward your target role.'
    },
    {
      q: 'Are the courses interactive?',
      a: 'Every course includes a structured lesson workspace with rich markdown explanations, runnable code snippets, real-world architecture diagrams, and a progress tracker that saves your state.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#080912] text-gray-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white">
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-[#1F2438]">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-violet-600/15 via-purple-600/10 to-cyan-500/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Top Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#101321] border border-violet-500/30 shadow-neon-violet backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-gray-200">
                Next-Gen Learning Platform Inspired by GeeksforGeeks Courses
              </span>
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto space-y-5">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Learn Smarter.{' '}
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                Close Your Skill Gaps.
              </span>{' '}
              Build Your Career.
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Explore in-depth technical courses, interactive lessons, AI resume skill extraction, and personalized career roadmaps designed to make you job-ready.
            </p>
          </div>

          {/* Hero Search Box */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative flex items-center shadow-2xl">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="What do you want to learn today? (e.g. DSA, Python, Full Stack, Generative AI...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#101321] text-sm text-gray-100 placeholder-gray-500 rounded-2xl pl-12 pr-32 py-4 border border-[#1F2438] focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold shadow-neon-violet transition-all"
              >
                Search
              </button>
            </form>

            {/* Popular Searches Tags */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
              <span className="text-gray-500 font-medium">Popular:</span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => navigate(`/courses?search=${encodeURIComponent(term)}`)}
                  className="px-2.5 py-1 rounded-lg bg-[#101321] hover:bg-[#181D33] text-gray-300 hover:text-cyan-300 border border-[#1F2438] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Platform Metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div className="bg-[#101321]/80 backdrop-blur-md p-4 rounded-2xl border border-[#1F2438]">
              <div className="text-2xl font-black text-cyan-400">12+</div>
              <div className="text-xs text-gray-400 mt-1 font-medium">Canonical Courses</div>
            </div>
            <div className="bg-[#101321]/80 backdrop-blur-md p-4 rounded-2xl border border-[#1F2438]">
              <div className="text-2xl font-black text-violet-400">70+</div>
              <div className="text-xs text-gray-400 mt-1 font-medium">Interactive Lessons</div>
            </div>
            <div className="bg-[#101321]/80 backdrop-blur-md p-4 rounded-2xl border border-[#1F2438]">
              <div className="text-2xl font-black text-emerald-400">10</div>
              <div className="text-xs text-gray-400 mt-1 font-medium">Target Career Tracks</div>
            </div>
            <div className="bg-[#101321]/80 backdrop-blur-md p-4 rounded-2xl border border-[#1F2438]">
              <div className="text-2xl font-black text-purple-400">100%</div>
              <div className="text-xs text-gray-400 mt-1 font-medium">Free Learning Access</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. COURSE CATALOGUE & DISCOVERY (GeeksforGeeks Inspired) */}
      <section className="py-16 bg-[#080912]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Structured Learning Paths</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Explore Top Engineering Courses
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Handcrafted curriculums designed to master core concepts and clear technical interviews.
              </p>
            </div>
            <Link
              to="/courses"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 group"
            >
              <span>Browse Full Catalogue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 custom-scrollbar">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-violet-600 text-white shadow-neon-violet'
                  : 'bg-[#101321] text-gray-400 hover:text-white hover:bg-[#171A2E] border border-[#1F2438]'
              }`}
            >
              All Courses ({courses.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.category
                    ? 'bg-violet-600 text-white shadow-neon-violet'
                    : 'bg-[#101321] text-gray-400 hover:text-white hover:bg-[#171A2E] border border-[#1F2438]'
                }`}
              >
                {cat.category} ({cat.count})
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-[#101321] rounded-2xl border border-[#1F2438] animate-pulse p-6" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.slice(0, 6).map((course) => (
                <div
                  key={course.id}
                  className="bg-[#101321] rounded-2xl border border-[#1F2438] hover:border-violet-500/50 hover:shadow-neon-violet transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Top Row: Category & Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
                        {course.category}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                        {course.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-2">
                      {course.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                      {course.short_description}
                    </p>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 py-3 border-y border-[#1F2438]">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>{course.duration_hours}h total</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Layers className="w-3.5 h-3.5 text-gray-500" />
                        <span>{course.lesson_count} lessons</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-white font-medium">{course.rating.toFixed(1)}</span>
                      </div>
                      <div className="ml-auto">
                        <span className="capitalize text-[10px] px-2 py-0.5 rounded bg-[#181D33] text-gray-300">
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-4 bg-[#0D0F1B] border-t border-[#1F2438] flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">
                      By {course.instructor_name || 'SkillMap Team'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/courses/${course.slug}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white bg-[#141829] hover:bg-[#1C223D] border border-[#1F2438] transition-colors"
                      >
                        Syllabus
                      </Link>
                      <Link
                        to={`/learn/${course.id}`}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-all flex items-center space-x-1"
                      >
                        <span>Start</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="mt-10 text-center">
            <Link
              to="/courses"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#101321] hover:bg-[#181D33] text-white text-sm font-semibold border border-[#1F2438] hover:border-violet-500/40 transition-all"
            >
              <span>View All 12 Courses</span>
              <ArrowRight className="w-4 h-4 text-violet-400" />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. CORE VALUE PROPOSITION: SKILL GAP DETECTION & ROADMAP */}
      <section className="py-20 bg-gradient-to-b from-[#080912] via-[#0B0D18] to-[#080912] border-y border-[#1F2438] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Career Intelligence Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Your Career. Your Gaps. Your Adaptive Roadmap.
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mt-3 leading-relaxed">
              Don’t guess what to study next. SkillMap AI computes your exact readiness score for your target role and builds a dynamic, prioritized learning path to close every critical gap.
            </p>
          </div>

          {/* Interactive Comparison Visual Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#101321] p-6 sm:p-10 rounded-3xl border border-[#1F2438] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 blur-[100px] pointer-events-none" />

            {/* Left: Skill Gap Analytics Visual */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1F2438]">
                <div>
                  <span className="text-xs text-gray-400 font-mono uppercase">Target Career:</span>
                  <h4 className="text-lg font-bold text-white">Full Stack Developer</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-cyan-400 font-mono">Readiness</span>
                  <div className="text-xl font-black text-cyan-300">68%</div>
                </div>
              </div>

              {/* Sample Skills with Gap Status */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-200">React.js & Frontend Architecture</span>
                    <span className="text-emerald-400 font-mono">82% Proficient</span>
                  </div>
                  <div className="w-full bg-[#1A1E33] h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-200">REST APIs & FastAPI Backend</span>
                    <span className="text-amber-400 font-mono">55% (Moderate Gap)</span>
                  </div>
                  <div className="w-full bg-[#1A1E33] h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '55%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-200">PostgreSQL & Database Design</span>
                    <span className="text-rose-400 font-mono">25% (Critical Gap)</span>
                  </div>
                  <div className="w-full bg-[#1A1E33] h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-400 h-full rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-200">Docker & Cloud CI/CD</span>
                    <span className="text-rose-400 font-mono">10% (Critical Gap)</span>
                  </div>
                  <div className="w-full bg-[#1A1E33] h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-400 h-full rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center space-x-3 text-xs text-gray-400 font-mono">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Strong (3)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Moderate (2)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Critical (3)</span>
                </span>
              </div>
            </div>

            {/* Right: AI-Generated Action Plan */}
            <div className="bg-[#0D0F1B] p-6 rounded-2xl border border-[#1F2438] space-y-4">
              <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4 text-violet-400" />
                <span>AI Automated Action Plan</span>
              </div>
              <h4 className="text-base font-bold text-white">
                Next Steps to Reach 90% Readiness:
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-[#141829] border border-[#1F2438]">
                  <div className="w-6 h-6 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-white">Study Lesson: Relational DB Indexing</span>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Course: Full Stack Web Development • 45 min
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-[#141829] border border-[#1F2438]">
                  <div className="w-6 h-6 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-white">Take 5-Question SQL Assessment</span>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Recalculates Bayesian proficiency upon completion
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-[#141829] border border-[#1F2438]">
                  <div className="w-6 h-6 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-white">Ask AI Tutor about Docker Multi-Stage Builds</span>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Grounded in your uploaded DevOps handbook
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/skill-gaps"
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-xs shadow-neon-violet transition-all"
                >
                  <span>Analyze Your Skill Gaps Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. PLATFORM PILLARS / FEATURES */}
      <section className="py-20 bg-[#080912]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-white">
              End-to-End Career Intelligence Architecture
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Everything you need from self-discovery to technical mastery, built into a single cohesive platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="bg-[#101321] p-6 rounded-2xl border border-[#1F2438] hover:border-violet-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Resume Skill Extraction</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Upload your PDF resume. Our PyMuPDF and NLP pipeline extracts your verified skills, aliases, and experience levels in seconds.
              </p>
            </div>

            <div className="bg-[#101321] p-6 rounded-2xl border border-[#1F2438] hover:border-violet-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Bayesian Skill Assessments</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Take target-role assessments that dynamically recalibrate your proficiency using probabilistic Bayesian updating.
              </p>
            </div>

            <div className="bg-[#101321] p-6 rounded-2xl border border-[#1F2438] hover:border-violet-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">RAG Document Tutor</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Upload PDF lecture notes or company docs. Our FAISS vector engine retrieves relevant chunks and provides cited answers.
              </p>
            </div>

            <div className="bg-[#101321] p-6 rounded-2xl border border-[#1F2438] hover:border-violet-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Interactive Lesson Workspace</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Read rich markdown explanations, review code examples, track key takeaways, and mark lessons as complete with instant progress saving.
              </p>
            </div>

            <div className="bg-[#101321] p-6 rounded-2xl border border-[#1F2438] hover:border-violet-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">AI Quiz Generator</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Generate tailored multiple-choice practice quizzes on any topic or directly from your uploaded study materials.
              </p>
            </div>

            <div className="bg-[#101321] p-6 rounded-2xl border border-[#1F2438] hover:border-violet-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Role Readiness Analytics</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Real-time charts, radar plots, and CSV reports displaying your exact distance to industry requirements.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 bg-[#06070E] border-t border-[#1F2438]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Have questions about SkillMap AI? Find answers to commonly asked questions below.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#101321] rounded-2xl border border-[#1F2438] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-semibold text-white hover:text-violet-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-violet-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-gray-400 leading-relaxed border-t border-[#1F2438]/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. FINAL HIGH-IMPACT CTA */}
      <section className="py-20 bg-gradient-to-tr from-violet-900/30 via-[#0D0F1B] to-cyan-900/20 border-t border-[#1F2438] relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Become a Job-Ready Engineer?
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            Join thousands of developers leveling up their careers with structured courses and automated skill-gap analysis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/courses"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm shadow-neon-violet transition-all"
            >
              Explore All Courses
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#101321] hover:bg-[#181D33] text-gray-200 hover:text-white font-semibold text-sm border border-[#1F2438] hover:border-violet-500/40 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
