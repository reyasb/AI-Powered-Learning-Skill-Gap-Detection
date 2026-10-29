import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { courseService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { EnrolledCourse } from '../types';
import {
  GraduationCap,
  PlayCircle,
  Clock,
  Layers,
  Award,
  ArrowRight,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const MyLearning: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/my-learning');
      return;
    }
    fetchMyLearning();
  }, [user]);

  const fetchMyLearning = async () => {
    try {
      setLoading(true);
      const res = await courseService.getMyLearning();
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to load enrolled courses', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCompleted = courses.filter((c) => c.status === 'completed' || c.progress_percentage >= 100).length;
  const inProgress = courses.length - totalCompleted;

  return (
    <div className="min-h-screen bg-[#080912] text-gray-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#1F2438] mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Learning Center</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              My Enrolled Courses
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Pick up where you left off and keep building your skills toward your target career.
            </p>
          </div>

          <Link
            to="/courses"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-neon-violet transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Explore More Courses</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#101321] p-4 rounded-2xl border border-[#1F2438]">
            <span className="text-xs text-gray-400 font-medium">Total Enrolled</span>
            <div className="text-2xl font-black text-white mt-1">{courses.length}</div>
          </div>
          <div className="bg-[#101321] p-4 rounded-2xl border border-[#1F2438]">
            <span className="text-xs text-gray-400 font-medium">In Progress</span>
            <div className="text-2xl font-black text-cyan-400 mt-1">{inProgress}</div>
          </div>
          <div className="bg-[#101321] p-4 rounded-2xl border border-[#1F2438]">
            <span className="text-xs text-gray-400 font-medium">Completed</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{totalCompleted}</div>
          </div>
          <div className="bg-[#101321] p-4 rounded-2xl border border-[#1F2438]">
            <span className="text-xs text-gray-400 font-medium">Target Readiness</span>
            <div className="text-2xl font-black text-violet-400 mt-1">
              {courses.length > 0 ? `${Math.round(courses.reduce((acc, c) => acc + c.progress_percentage, 0) / courses.length)}%` : '0%'}
            </div>
          </div>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-[#101321] rounded-2xl border border-[#1F2438] animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 bg-[#101321] rounded-3xl border border-[#1F2438] p-8 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Enrolled Courses Yet</h3>
            <p className="text-xs text-gray-400 mb-6">
              You haven't enrolled in any courses yet. Browse our comprehensive catalogue to start learning.
            </p>
            <Link
              to="/courses"
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-neon-violet transition-all"
            >
              Browse Course Catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.course_id}
                className="bg-[#101321] rounded-2xl border border-[#1F2438] hover:border-violet-500/40 p-6 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Info */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
                      {course.category}
                    </span>
                    <span className="text-[10px] capitalize px-2 py-0.5 rounded bg-[#181D33] text-gray-300">
                      {course.difficulty}
                    </span>
                    {course.status === 'completed' && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white hover:text-cyan-300 transition-colors">
                    <Link to={`/courses/${course.slug}`}>{course.title}</Link>
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-1">
                    {course.short_description}
                  </p>

                  {/* Progress info */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">
                        {course.completed_lessons_count} of {course.lesson_count} lessons completed
                      </span>
                      <span className="text-cyan-400 font-bold font-mono">
                        {course.progress_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[#181D33] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all"
                        style={{ width: `${course.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
                  <Link
                    to={`/learn/${course.course_id}`}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-neon-violet transition-all flex items-center justify-center space-x-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{course.progress_percentage > 0 ? 'Continue Learning' : 'Start Course'}</span>
                  </Link>

                  <Link
                    to={`/courses/${course.slug}`}
                    className="text-xs text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <span>View Syllabus</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
