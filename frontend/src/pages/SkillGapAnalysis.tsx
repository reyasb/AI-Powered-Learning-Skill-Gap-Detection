import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { skillService, careerService, analyticsService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Select } from '../components/ui/Select';
import type { SkillGapItem } from '../types';
import {
  BarChart2,
  AlertTriangle,
  CheckCircle2,
  Download,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Compass,
  CheckSquare,
  BookOpen
} from 'lucide-react';

export const SkillGapAnalysis: React.FC = () => {
  const navigate = useNavigate();

  const [gapData, setGapData] = useState<any>(null);
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<number | ''>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gapRes, careersRes] = await Promise.all([
        skillService.getSkillGaps(),
        careerService.listCareers(),
      ]);
      setGapData(gapRes.data);
      setCareers(careersRes.data);
      if (gapRes.data?.career_id) {
        setSelectedCareerId(gapRes.data.career_id);
      }
    } catch (err) {
      console.error('Failed to load skill gap data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCareerChange = async (careerId: number) => {
    setSelectedCareerId(careerId);
    setLoading(true);
    try {
      const res = await skillService.getSkillGaps(careerId);
      setGapData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async () => {
    setExporting(true);
    try {
      const res = await analyticsService.downloadCsvReport(gapData?.career_id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SkillMap_Gap_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const items: SkillGapItem[] = gapData?.skill_gaps || [];
  const filteredItems = items.filter((item) => {
    if (filterSeverity === 'all') return true;
    return item.severity === filterSeverity;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2.5">
            <BarChart2 className="w-6 h-6 text-violet-400" />
            <span>AI Skill Gap Intelligence Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Mathematical gap analysis comparing your assessed proficiency against target role requirements: <strong className="text-cyan-400 font-mono">gap = max(0, required - current)</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCsv}
            isLoading={exporting}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/skill-assessment')}
            leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
          >
            Take Assessment
          </Button>
        </div>
      </div>

      {/* Career Benchmark Selector Card */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#111426] border-[#252A40]">
        <div className="flex items-center space-x-3">
          <Compass className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <span className="text-xs font-bold text-white">Target Career Benchmark</span>
            <p className="text-[11px] text-gray-400">Change role to re-evaluate gaps against different industry standards</p>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedCareerId}
            onChange={(e) => handleCareerChange(Number(e.target.value))}
            className="w-full bg-[#0D1020] text-xs font-semibold text-gray-200 rounded-xl px-3 py-2 border border-[#252A40] focus:border-violet-500 focus:outline-none"
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm" className="bg-[#111426]">
          <span className="text-[11px] text-gray-400 font-medium">Readiness Index</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400 mt-1">
            {gapData?.readiness_score}%
          </div>
          <span className="text-[10px] text-gray-500 block mt-0.5">Weighted capability match</span>
        </Card>

        <Card padding="sm" className="bg-[#111426]">
          <span className="text-[11px] text-gray-400 font-medium">Critical Gaps</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400 mt-1">
            {gapData?.critical_gap_count}
          </div>
          <span className="text-[10px] text-rose-400/80 block mt-0.5 font-medium">Immediate intervention</span>
        </Card>

        <Card padding="sm" className="bg-[#111426]">
          <span className="text-[11px] text-gray-400 font-medium">Moderate Gaps</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-1">
            {gapData?.moderate_gap_count}
          </div>
          <span className="text-[10px] text-amber-400/80 block mt-0.5 font-medium">Continuous practice</span>
        </Card>

        <Card padding="sm" className="bg-[#111426]">
          <span className="text-[11px] text-gray-400 font-medium">Strong Skills</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1">
            {gapData?.strong_skills_count}
          </div>
          <span className="text-[10px] text-emerald-400/80 block mt-0.5 font-medium">Competency achieved</span>
        </Card>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar">
        {['all', 'critical', 'moderate', 'strong'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              filterSeverity === sev
                ? 'bg-violet-600 text-white shadow-neon-violet'
                : 'bg-[#111426] border border-[#252A40] text-gray-400 hover:text-white hover:bg-[#141829]'
            }`}
          >
            {sev === 'all'
              ? `All Skills (${items.length})`
              : `${sev} (${items.filter((i) => i.severity === sev).length})`}
          </button>
        ))}
      </div>

      {/* Detailed Gaps Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1020] text-gray-400 font-mono uppercase text-[10px] border-b border-[#252A40]">
              <tr>
                <th className="p-4">Skill & Rationale</th>
                <th className="p-4">Assessed vs Target</th>
                <th className="p-4">Calculated Gap</th>
                <th className="p-4">Weight</th>
                <th className="p-4">Priority Score</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Prerequisites</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2438]">
              {filteredItems.map((item) => (
                <tr key={item.skill_id} className="hover:bg-[#141829] transition-colors">
                  <td className="p-4 max-w-xs">
                    <p className="font-semibold text-white">{item.skill_name}</p>
                    <span className="text-[10px] text-gray-500 font-mono block">{item.category}</span>
                    {item.rationale && (
                      <p className="text-[11px] text-gray-400 mt-1 leading-snug line-clamp-2">
                        {item.rationale}
                      </p>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="w-32 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-violet-300">You: {item.current_proficiency}%</span>
                        <span className="text-cyan-300">Req: {item.required_proficiency}%</span>
                      </div>
                      <div className="w-full bg-[#0D1020] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-violet-500 h-full rounded-full"
                          style={{ width: `${item.current_proficiency}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono font-bold">
                    <span className={item.gap > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {item.gap > 0 ? `-${item.gap}%` : '0%'}
                    </span>
                  </td>

                  <td className="p-4 font-mono text-gray-300">
                    {item.importance_weight}x
                  </td>

                  <td className="p-4 font-mono font-bold text-cyan-400">
                    {item.priority_score}
                  </td>

                  <td className="p-4">
                    <Badge
                      variant={
                        item.severity === 'critical'
                          ? 'rose'
                          : item.severity === 'moderate'
                          ? 'amber'
                          : 'emerald'
                      }
                      size="sm"
                    >
                      {item.severity}
                    </Badge>
                  </td>

                  <td className="p-4">
                    {item.prerequisites_met ? (
                      <span className="text-[11px] text-emerald-400 flex items-center space-x-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 inline" />
                        <span>Met</span>
                      </span>
                    ) : (
                      <div className="text-[11px] text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                        <span>Requires: {item.missing_prerequisites.join(', ')}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom CTA Card */}
      <Card className="bg-gradient-to-r from-violet-900/20 via-[#111426] to-cyan-900/20 border-violet-500/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Ready to close these critical skill gaps?</h4>
          <p className="text-xs text-gray-400">
            Follow your personalized curriculum roadmap or practice with targeted AI quiz modules.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/courses')}
            leftIcon={<BookOpen className="w-3.5 h-3.5" />}
          >
            Course Syllabi
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/roadmap')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Roadmap
          </Button>
        </div>
      </Card>

    </div>
  );
};
