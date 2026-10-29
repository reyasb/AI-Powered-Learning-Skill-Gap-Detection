import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { CourseLearnData, Lesson } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  BookOpen,
  Sparkles,
  Bot,
  Layers,
  Clock,
  Menu,
  X,
  Share2,
  ArrowRight,
  Code2,
  FileCheck,
  Award
} from 'lucide-react';

export const CourseLearn: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [learnData, setLearnData] = useState<CourseLearnData | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchLearnData(parseInt(courseId, 10));
    }
  }, [courseId]);

  const fetchLearnData = async (id: number) => {
    try {
      setLoading(true);
      const res = await courseService.getCourseLearn(id);
      const data: CourseLearnData = res.data;
      setLearnData(data);

      if (data.lessons && data.lessons.length > 0) {
        // default to current_lesson_id or first lesson
        const target = data.lessons.find((l) => l.id === data.current_lesson_id) || data.lessons[0];
        setActiveLesson(target);
      }
    } catch (err: any) {
      console.error('Failed to load course learning interface', err);
      if (err.response?.status === 401) {
        navigate(`/login?redirect=/learn/${courseId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!learnData || !activeLesson || updating) return;

    try {
      setUpdating(true);
      const res = await courseService.completeLesson(learnData.course.id, activeLesson.id);
      const updatedComplete = res.data.completed;
      const updatedProgress = res.data.progress_percentage;
      const updatedCount = res.data.completed_count;

      // Update active lesson state
      setActiveLesson((prev) => (prev ? { ...prev, completed: updatedComplete } : null));

      // Update lesson in list
      setLearnData((prev) => {
        if (!prev) return prev;
        const newLessons = prev.lessons.map((l) =>
          l.id === activeLesson.id ? { ...l, completed: updatedComplete } : l
        );
        return {
          ...prev,
          lessons: newLessons,
          completed_count: updatedCount,
          progress_percentage: updatedProgress,
        };
      });
    } catch (err) {
      console.error('Failed to toggle lesson completion', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleNextLesson = () => {
    if (!learnData || !activeLesson) return;
    const currentIndex = learnData.lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex < learnData.lessons.length - 1) {
      setActiveLesson(learnData.lessons[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevLesson = () => {
    if (!learnData || !activeLesson) return;
    const currentIndex = learnData.lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex > 0) {
      setActiveLesson(learnData.lessons[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Basic formatted markdown-like text renderer
  const renderFormattedContent = (content: string) => {
    if (!content) return null;
    const paragraphs = content.split('\n\n');

    return paragraphs.map((block, i) => {
      // Code block
      if (block.startsWith('```') && block.endsWith('```')) {
        const lines = block.split('\n');
        const lang = lines[0].replace('```', '').trim() || 'code';
        const code = lines.slice(1, -1).join('\n');
        return (
          <div key={i} className="my-5 rounded-2xl overflow-hidden border border-[#1F2438] bg-[#0A0C16] shadow-xl">
            <div className="flex items-center justify-between px-4 py-2 bg-[#101321] border-b border-[#1F2438] text-[11px] font-mono text-gray-400">
              <span className="flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="uppercase text-cyan-400 font-semibold">{lang}</span>
              </span>
              <span className="text-gray-500 text-[10px]">Interactive Code Sandbox</span>
            </div>
            <pre className="p-4 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed custom-scrollbar">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Headers
      if (block.startsWith('### ')) {
        return (
          <h3 key={i} className="text-lg font-bold text-white mt-6 mb-2 flex items-center space-x-2">
            <span className="w-1.5 h-4 rounded-full bg-cyan-400 inline-block" />
            <span>{block.replace('### ', '')}</span>
          </h3>
        );
      }
      if (block.startsWith('## ')) {
        return (
          <h2 key={i} className="text-xl font-bold text-white mt-8 mb-3 flex items-center space-x-2">
            <span className="w-2 h-5 rounded-full bg-violet-500 inline-block" />
            <span>{block.replace('## ', '')}</span>
          </h2>
        );
      }
      if (block.startsWith('# ')) {
        return (
          <h1 key={i} className="text-2xl font-black text-white mt-8 mb-4">
            {block.replace('# ', '')}
          </h1>
        );
      }

      // Bullet lists
      if (block.startsWith('- ') || block.startsWith('* ')) {
        const items = block.split('\n');
        return (
          <ul key={i} className="my-3 space-y-1.5 pl-4 text-xs sm:text-sm text-gray-300">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-violet-400 font-bold mt-1 text-xs">•</span>
                <span>{item.replace(/^[-*]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      return (
        <p key={i} className="my-3 text-xs sm:text-sm text-gray-300 leading-relaxed">
          {block}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080912] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!learnData || !activeLesson) {
    return (
      <div className="min-h-screen bg-[#080912] flex flex-col items-center justify-center text-center p-8 text-white">
        <h2 className="text-xl font-bold mb-2">Lesson Unavailable</h2>
        <p className="text-xs text-gray-400 mb-6">Could not load course lessons.</p>
        <Link to="/courses" className="px-4 py-2 rounded-xl bg-violet-600 text-xs font-semibold">
          Return to Courses
        </Link>
      </div>
    );
  }

  const currentIndex = learnData.lessons.findIndex((l) => l.id === activeLesson.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === learnData.lessons.length - 1;

  return (
    <div className="min-h-screen bg-[#080912] text-gray-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white">
      
      {/* 1. TOP LEARNING BAR */}
      <header className="sticky top-0 z-40 bg-[#0D0F1B] border-b border-[#1F2438] px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Left: Course info & back */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#141829] text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to={`/courses/${learnData.course.slug}`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#141829] transition-colors"
            title="Course Overview"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div>
            <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {learnData.course.title}
            </h1>
            <div className="flex items-center space-x-2 text-[11px] text-gray-400">
              <span>Lesson {currentIndex + 1} of {learnData.total_lessons}</span>
              <span>•</span>
              <span className="capitalize">{activeLesson.content_type}</span>
            </div>
          </div>
        </div>

        {/* Center: Progress Bar */}
        <div className="hidden md:flex flex-col items-center w-56">
          <div className="flex justify-between w-full text-[11px] text-gray-400 mb-1">
            <span>Course Progress</span>
            <span className="text-cyan-400 font-mono font-bold">{learnData.progress_percentage}%</span>
          </div>
          <div className="w-full bg-[#181D33] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${learnData.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Right: Completion Toggle & Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handleToggleComplete}
            disabled={updating}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLesson.completed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-[#181D33] text-gray-300 border border-[#1F2438] hover:border-violet-500/50 hover:text-white'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${activeLesson.completed ? 'text-emerald-400' : 'text-gray-500'}`} />
            <span className="hidden sm:inline">
              {activeLesson.completed ? 'Completed' : 'Mark Complete'}
            </span>
          </button>

          <button
            onClick={handlePrevLesson}
            disabled={isFirst}
            className={`p-2 rounded-xl text-xs font-semibold border border-[#1F2438] transition-colors ${
              isFirst ? 'text-gray-600 bg-transparent cursor-not-allowed' : 'text-gray-300 bg-[#141829] hover:bg-[#1F2438]'
            }`}
            title="Previous Lesson"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNextLesson}
            disabled={isLast}
            className={`p-2 rounded-xl text-xs font-semibold border border-[#1F2438] transition-colors ${
              isLast ? 'text-gray-600 bg-transparent cursor-not-allowed' : 'text-gray-300 bg-[#141829] hover:bg-[#1F2438]'
            }`}
            title="Next Lesson"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* 2. MAIN LEARNING VIEW (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Curriculum Sidebar */}
        <aside
          className={`w-80 bg-[#0D0F1B] border-r border-[#1F2438] flex flex-col shrink-0 transition-transform duration-200 z-30 fixed lg:static top-[57px] bottom-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-[#1F2438] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">Course Syllabus</h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">
              {learnData.completed_count}/{learnData.total_lessons} Done
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
            {learnData.lessons.map((lesson, idx) => {
              const isActive = lesson.id === activeLesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setActiveLesson(lesson);
                    setSidebarOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-200 border border-violet-500/40 shadow-neon-violet'
                      : 'hover:bg-[#141829] text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 pr-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        lesson.completed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isActive
                          ? 'bg-violet-600 text-white'
                          : 'bg-[#181D33] text-gray-400'
                      }`}
                    >
                      {lesson.completed ? '✓' : idx + 1}
                    </div>
                    <span className="text-xs font-medium line-clamp-2 leading-snug">
                      {lesson.title}
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-500 font-mono shrink-0">
                    {lesson.duration_minutes}m
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick AI Assistant Card at bottom of sidebar */}
          <div className="p-4 border-t border-[#1F2438] bg-[#0A0C16]">
            <Link
              to="/ai-tutor"
              className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-violet-950/30 border border-violet-500/30 hover:border-violet-500/60 text-xs text-violet-300 transition-all group"
            >
              <Bot className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="font-semibold text-white">Ask AI Tutor</span>
                <span className="text-[10px] text-gray-400">Ask questions about this lesson</span>
              </div>
            </Link>
          </div>
        </aside>

        {/* Lesson Body Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 max-w-4xl mx-auto w-full">
          
          {/* Lesson Header */}
          <div className="pb-6 border-b border-[#1F2438] mb-8 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-gray-400">
              <span className="px-2 py-0.5 rounded bg-[#101321] border border-[#1F2438]">
                Section {currentIndex + 1}
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-cyan-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{activeLesson.duration_minutes} min read</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeLesson.title}
            </h1>
          </div>

          {/* Formatted Content Renderer */}
          <article className="prose prose-invert max-w-none">
            {renderFormattedContent(activeLesson.content_body)}
          </article>

          {/* Key Takeaways Card */}
          {activeLesson.key_takeaways && activeLesson.key_takeaways.length > 0 && (
            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-[#101321] to-[#141829] border border-[#1F2438] shadow-lg space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <span>Key Takeaways & Core Concepts</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                {activeLesson.key_takeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                      ✓
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="mt-12 pt-8 border-t border-[#1F2438] flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <button
              onClick={handleToggleComplete}
              disabled={updating}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                activeLesson.completed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-neon-violet'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{activeLesson.completed ? 'Lesson Marked as Completed' : 'Complete Lesson'}</span>
            </button>

            {!isLast ? (
              <button
                onClick={handleNextLesson}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#141829] hover:bg-[#1F2438] border border-[#1F2438] transition-colors flex items-center justify-center space-x-2"
              >
                <span>Next Lesson</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            ) : (
              <Link
                to="/my-learning"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center space-x-2"
              >
                <Award className="w-4 h-4" />
                <span>Finish Course & View Progress</span>
              </Link>
            )}

          </div>

        </main>
      </div>

    </div>
  );
};
