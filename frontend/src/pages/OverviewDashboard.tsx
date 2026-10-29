import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../services/api';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Flame,
  ArrowRight,
  BookOpen,
  CheckSquare,
  FileText,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const OverviewDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboardAnalytics()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-mono">Loading SkillMap Intelligence...</p>
        </div>
      </div>
    );
  }

  const readiness = data?.readiness_score || 0;
  const strokeDashoffset = 283 - (283 * readiness) / 100;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#121528] via-[#151930] to-[#0D101D] border border-violet-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Target Role: {data?.target_career}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Welcome back, <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{data?.user_name}</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
              Your career readiness is currently at <span className="text-white font-semibold">{readiness}%</span>. Address your high-priority skill gaps to unlock target career readiness.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/assessments"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-medium shadow-neon-violet flex items-center space-x-2 transition-all"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Take Assessment</span>
            </Link>
            <Link
              to="/resume"
              className="px-4 py-2.5 rounded-xl bg-[#17192B] border border-violet-500/30 hover:border-violet-500/60 text-gray-200 text-xs font-medium flex items-center space-x-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Upload Resume</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Readiness Radial Card */}
        <div className="bg-[#101321] border border-[#1F2438] hover:border-violet-500/40 rounded-2xl p-5 shadow-card-glow flex items-center space-x-4 transition-all">
          <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="text-[#181C2E]" strokeWidth="8" stroke="currentColor" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-violet-500 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold text-white font-mono">{readiness}%</span>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Readiness Score</p>
            <p className="text-lg font-bold text-white">{readiness >= 75 ? 'Job Ready' : 'In Progress'}</p>
            <p className="text-[10px] text-cyan-400 mt-0.5">{data?.assessed_skills_count} assessed</p>
          </div>
        </div>

        {/* Metric 2: Strong Skills */}
        <div className="bg-[#101321] border border-[#1F2438] hover:border-emerald-500/40 rounded-2xl p-5 shadow-card-glow flex items-center justify-between transition-all">
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Strong Skills</p>
            <p className="text-2xl font-bold text-white mt-1">{data?.strong_skills_count || 0}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 inline" />
              <span>Meets target</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Critical Gaps */}
        <div className="bg-[#101321] border border-[#1F2438] hover:border-rose-500/40 rounded-2xl p-5 shadow-card-glow flex items-center justify-between transition-all">
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Critical Gaps</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">{data?.critical_gap_count || 0}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">High priority action</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Moderate Gaps */}
        <div className="bg-[#101321] border border-[#1F2438] hover:border-amber-500/40 rounded-2xl p-5 shadow-card-glow flex items-center justify-between transition-all">
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Moderate Gaps</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{data?.moderate_gap_count || 0}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Requires practice</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 5: Learning Streak */}
        <div className="bg-[#101321] border border-[#1F2438] hover:border-cyan-500/40 rounded-2xl p-5 shadow-card-glow flex items-center justify-between transition-all">
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Learning Streak</p>
            <p className="text-2xl font-bold text-white mt-1">{data?.learning_streak_days || 4} <span className="text-xs font-normal text-gray-400">Days</span></p>
            <p className="text-[10px] text-cyan-400 mt-0.5">{data?.weekly_hours_goal}h goal</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Skill Proficiency Comparison (Current vs Target) */}
        <div className="lg:col-span-2 bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Skill Proficiency Analysis</h3>
              <p className="text-xs text-gray-400 mt-0.5">Current assessed level vs. Target role requirement</p>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-violet-500" />
                <span className="text-gray-300">Current</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400/40 border border-cyan-400" />
                <span className="text-gray-300">Required</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.skill_proficiency_chart || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2438" vertical={false} />
                <XAxis dataKey="skill" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D0F1B', borderColor: '#2E3553', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#F3F4F6', fontWeight: 'bold' }}
                />
                <Bar dataKey="current" name="Current" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="required" name="Required" fill="#22D3EE" opacity={0.4} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weekly Activity */}
        <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Weekly Study Activity</h3>
                <p className="text-xs text-gray-400 mt-0.5">Hours invested across days</p>
              </div>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.weekly_activity || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2438" vertical={false} />
                  <XAxis dataKey="day" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D0F1B', borderColor: '#2E3553', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="hours" name="Hours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#1F2438] flex items-center justify-between text-xs">
            <span className="text-gray-400">Total this week:</span>
            <span className="text-cyan-400 font-bold font-mono">
              {data?.weekly_activity?.reduce((acc: number, curr: any) => acc + curr.hours, 0).toFixed(1)} hrs
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Next Action & Learning Roadmap Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Recommendation Card */}
        <div className="bg-gradient-to-br from-[#121528] to-[#171A2E] border border-cyan-500/30 rounded-2xl p-6 shadow-neon-cyan flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Recommended Next Priority</span>
            </div>
            {data?.recommended_next_activity ? (
              <>
                <h4 className="text-base font-bold text-white mt-1">
                  {data.recommended_next_activity.topic}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Skill Focus: <span className="text-violet-300 font-semibold">{data.recommended_next_activity.skill_name}</span>
                </p>
                <div className="flex items-center space-x-3 mt-3">
                  <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded font-mono uppercase">
                    {data.recommended_next_activity.difficulty}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 inline" />
                    <span>{data.recommended_next_activity.estimated_duration_minutes} min</span>
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 mt-2">All immediate milestone activities are up to date!</p>
            )}
          </div>

          <div className="mt-6">
            <Link
              to="/roadmap"
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-neon-cyan"
            >
              <span>Go to Learning Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Readiness Trend Over Time */}
        <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Career Readiness Progress</h3>
              <p className="text-xs text-gray-400 mt-0.5">Historical growth curve</p>
            </div>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.progress_trend || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2438" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0D0F1B', borderColor: '#2E3553', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="readiness" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#readinessGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Assessments History */}
        <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Recent Assessments</h3>
              <Link to="/assessments" className="text-xs text-violet-400 hover:text-violet-300">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {data?.recent_assessments?.length > 0 ? (
                data.recent_assessments.slice(0, 3).map((a: any) => (
                  <div key={a.id} className="p-3 rounded-xl bg-[#080912] border border-[#1F2438] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Score: {a.score}%</p>
                      <p className="text-[10px] text-gray-400">{a.completed_at}</p>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      a.score >= 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {a.correct_count}/{a.total_questions} Correct
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-gray-500">
                  No assessments completed yet.
                </div>
              )}
            </div>
          </div>

          <Link
            to="/assessments"
            className="mt-4 text-center text-xs text-gray-400 hover:text-white flex items-center justify-center space-x-1"
          >
            <span>Take new evaluation</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
