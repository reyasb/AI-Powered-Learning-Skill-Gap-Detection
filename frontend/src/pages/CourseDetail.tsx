import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { courseService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { CourseDetail as CourseDetailType } from '../types';
import {
  Clock,
  Layers,
  Star,
  CheckCircle2,
  PlayCircle,
  Award,
  BookOpen,
  ArrowRight,
  Shield,
  FileCode,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Compass
} from 'lucide-react';

export const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<CourseDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId]);

  const fetchCourse = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await courseService.getCourse(id);
      setCourse(res.data);
    } catch (err: any) {
      console.error('Error fetching course', err);
      setError('Course not found or unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollOrStart = async () => {
    if (!course) return;

    if (!user) {
      // Direct guest to login with redirect back
      navigate(`/login?redirect=/courses/${course.slug}`);
      return;
    }

    try {
      setEnrolling(true);
      await courseService.enrollCourse(course.id);
      navigate(`/learn/${course.id}`);
    } catch (err) {
      console.error('Error enrolling in course', err);
      // Still navigate to learn interface if already enrolled
      navigate(`/learn/${course.id}`);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080912] text-gray-100 flex flex-col">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#080912] text-gray-100 flex flex-col">
        <PublicNavbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-xl font-bold text-white mb-2">Course Not Found</h2>
          <p className="text-xs text-gray-400 mb-6">The course you are looking for does not exist or has been moved.</p>
          <Link
            to="/courses"
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
          >
            Back to Course Catalogue
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080912] text-gray-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white">
      <PublicNavbar />

      {/* Course Banner Header */}
      <section className="bg-gradient-to-b from-[#101321] to-[#080912] border-b border-[#1F2438] py-12 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-4">
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-500">{course.category}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-violet-400 truncate max-w-xs">{course.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Left 2 Cols: Details */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30 font-semibold">
                  {course.category}
                </span>
                <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                  {course.badge}
                </span>
                <span className="text-xs capitalize px-2.5 py-1 rounded-lg bg-[#181D33] text-gray-300">
                  {course.difficulty} Level
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm text-gray-300 leading-relaxed max-w-2xl">
                {course.short_description}
              </p>

              {/* Quick stats row */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-gray-300">
                <div className="flex items-center space-x-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white text-sm">{course.rating.toFixed(1)}</span>
                  <span className="text-gray-500">(1,240+ reviews)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>{course.duration_hours} hours total</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-violet-400" />
                  <span>{course.lessons.length} structured lessons</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>{course.estimated_weeks} weeks recommended</span>
                </div>
              </div>

              <div className="text-xs text-gray-400 pt-1">
                Instructor: <strong className="text-white">{course.instructor_name || 'SkillMap AI Engineering Team'}</strong>
              </div>
            </div>

            {/* Right Card: Sticky Enrollment Card */}
            <div className="lg:col-span-1 bg-[#101321] p-6 rounded-3xl border border-[#1F2438] shadow-2xl space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-gray-400 tracking-wider">Access</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">Free</span>
                  <span className="text-xs text-gray-500 line-through">$199</span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    100% Scholarship
                  </span>
                </div>
              </div>

              {course.enrolled && (
                <div className="bg-[#141829] p-4 rounded-2xl border border-[#1F2438] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-medium">Your Progress</span>
                    <span className="text-cyan-400 font-bold font-mono">{course.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-[#0D0F1B] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all"
                      style={{ width: `${course.progress_percentage}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {course.completed_lessons_count} of {course.lessons.length} lessons completed
                  </div>
                </div>
              )}

              <button
                onClick={handleEnrollOrStart}
                disabled={enrolling}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-neon-violet transition-all flex items-center justify-center space-x-2"
              >
                {course.enrolled ? (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    <span>Continue Learning</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    <span>{enrolling ? 'Enrolling...' : 'Enroll & Start Learning'}</span>
                  </>
                )}
              </button>

              <div className="space-y-3 pt-3 border-t border-[#1F2438] text-xs text-gray-400">
                <div className="flex items-center space-x-2.5">
                  <PlayCircle className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Full interactive workspace with code samples</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Bayesian skill proficiency updates upon completion</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Certificate & Career Readiness boost</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Lifetime access to all updates</span>
                </div>
              </div>

              {course.career_role_title && (
                <div className="pt-3 border-t border-[#1F2438]">
                  <span className="text-[11px] text-gray-500 uppercase font-mono block mb-1">
                    Direct Career Track:
                  </span>
                  <Link
                    to="/careers"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{course.career_role_title}</span>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Main Content: Overview, Outcomes, Skills & Syllabus */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Detailed Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-violet-400" />
              <span>Course Overview</span>
            </h2>
            <div className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-[#101321] p-6 rounded-2xl border border-[#1F2438] whitespace-pre-line">
              {course.description}
            </div>
          </div>

          {/* What You Will Learn */}
          {course.learning_outcomes && course.learning_outcomes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>What You Will Learn</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#101321] p-6 rounded-2xl border border-[#1F2438]">
                {course.learning_outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-gray-300">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                      ✓
                    </span>
                    <span className="leading-relaxed">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structured Course Syllabus */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>Course Curriculum & Syllabus</span>
              </h2>
              <span className="text-xs text-gray-400 font-mono">
                {course.lessons.length} Lessons • {course.duration_hours} Hours
              </span>
            </div>

            <div className="bg-[#101321] rounded-2xl border border-[#1F2438] divide-y divide-[#1F2438] overflow-hidden">
              {course.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="p-4 hover:bg-[#141829] transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        lesson.completed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-[#181D33] text-gray-400'
                      }`}
                    >
                      {lesson.completed ? '✓' : idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {lesson.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-[11px] text-gray-500 mt-0.5">
                        <span className="capitalize">{lesson.content_type}</span>
                        <span>•</span>
                        <span>{lesson.duration_minutes} minutes</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/learn/${course.id}`}
                    className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 transition-all"
                  >
                    Start Lesson
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Covered */}
          {course.skills_covered && course.skills_covered.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <span>Skills You Will Acquire</span>
              </h2>
              <div className="flex flex-wrap gap-2 bg-[#101321] p-6 rounded-2xl border border-[#1F2438]">
                {course.skills_covered.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-violet-600/15 text-violet-300 text-xs font-mono font-medium border border-violet-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {course.prerequisites_text && (
            <div className="space-y-2 bg-[#101321] p-6 rounded-2xl border border-[#1F2438]">
              <h3 className="text-sm font-bold text-gray-200 uppercase font-mono tracking-wider">
                Prerequisites & Requirements
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {course.prerequisites_text}
              </p>
            </div>
          )}

        </div>

        {/* Right Col: Supporting Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#101321] p-6 rounded-3xl border border-[#1F2438] space-y-4">
            <h3 className="text-sm font-bold text-white">Why Learn with SkillMap AI?</h3>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-violet-400 font-bold">•</span>
                <span><strong>Grounded in Industry Standards:</strong> Curated to match real job descriptions and technical rounds.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Bayesian Adaptive Tracking:</strong> Your skill profile updates automatically as you complete lessons.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Personalized AI Tutor:</strong> Upload course references to get custom explanations and quizzes.</span>
              </li>
            </ul>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};
