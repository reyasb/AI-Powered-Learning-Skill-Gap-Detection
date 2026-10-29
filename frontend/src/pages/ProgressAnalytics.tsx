import React, { useState, useEffect } from 'react';
import { analyticsService, skillService } from '../services/api';
import {
  TrendingUp,
  Download,
  Award,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export const ProgressAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [gapData, setGapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getDashboardAnalytics(),
      skillService.getSkillGaps(),
    ])
      .then(([aRes, gRes]) => {
        setAnalytics(aRes.data);
        setGapData(gRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadCsv = async () => {
    try {
      const res = await analyticsService.downloadCsvReport(gapData?.career_id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SkillMap_Analytics_Export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Radar Data
  const radarData = (gapData?.skill_gaps || []).map((g: any) => ({
    subject: g.skill_name,
    Current: g.current_proficiency,
    Required: g.required_proficiency,
    fullMark: 100,
  }));

  // Pie Data (Severity Distribution)
  const pieData = [
    { name: 'Strong', value: gapData?.strong_skills_count || 0, color: '#34D399' },
    { name: 'Moderate', value: gapData?.moderate_gap_count || 0, color: '#FBBF24' },
    { name: 'Critical', value: gapData?.critical_gap_count || 0, color: '#FB7185' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-violet-400" />
            <span>Progress Intelligence & Skill Analytics</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Multidimensional capability modeling for <strong className="text-cyan-400">{analytics?.target_career}</strong>.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#17192B] border border-violet-500/30 hover:border-violet-500/60 shadow-neon-violet flex items-center space-x-2 transition-all flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Top 3 High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-[#101321] border border-[#1F2438] shadow-card-glow">
          <p className="text-xs text-gray-400 font-medium">Overall Role Competency</p>
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 mt-1 font-mono">
            {analytics?.readiness_score}%
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            Calculated via weighted importance across {analytics?.total_required_skills} benchmark requirements
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#101321] border border-[#1F2438] shadow-card-glow">
          <p className="text-xs text-gray-400 font-medium">Verified Assessments</p>
          <p className="text-3xl font-extrabold text-white mt-1 font-mono">
            {analytics?.assessed_skills_count} <span className="text-sm font-normal text-gray-500">Skills</span>
          </p>
          <p className="text-[10px] text-cyan-400 mt-1">
            Evidence confidence based on objective question banks
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#101321] border border-[#1F2438] shadow-card-glow">
          <p className="text-xs text-gray-400 font-medium">Roadmap Completion</p>
          <p className="text-3xl font-extrabold text-white mt-1 font-mono">
            {analytics?.roadmap_summary?.completion_rate}%
          </p>
          <p className="text-[10px] text-emerald-400 mt-1">
            {analytics?.roadmap_summary?.completed} of {analytics?.roadmap_summary?.total} core modules completed
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart (Competency Web) */}
        <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Competency Radar Spectrum</h3>
              <p className="text-xs text-gray-400 mt-0.5">Assessed capacity vs target role polygon</p>
            </div>
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1F2438" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4B5563" />
                <Radar name="Current" dataKey="Current" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                <Radar name="Required" dataKey="Required" stroke="#22D3EE" fill="#22D3EE" fillOpacity={0.15} />
                <Tooltip contentStyle={{ backgroundColor: '#0D0F1B', borderColor: '#2E3553', borderRadius: '12px', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut */}
        <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Gap Severity Distribution</h3>
                <p className="text-xs text-gray-400 mt-0.5">Classification of required competencies</p>
              </div>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0D0F1B', borderColor: '#2E3553', borderRadius: '12px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-around text-xs pt-4 border-t border-[#1F2438]">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-300">{item.name}: <strong className="text-white font-mono">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Growth Curve Line Chart */}
      <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow">
        <h3 className="text-sm font-bold text-white mb-1">Career Readiness Trajectory</h3>
        <p className="text-xs text-gray-400 mb-6">Persistent snapshot history tracked as you submit assessments and quizzes</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.progress_trend || []} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2438" vertical={false} />
              <XAxis dataKey="date" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0D0F1B', borderColor: '#2E3553', borderRadius: '12px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="readiness" name="Readiness Index" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="avg_proficiency" name="Avg Proficiency" stroke="#22D3EE" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#22D3EE', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
