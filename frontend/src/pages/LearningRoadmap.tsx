import React, { useState, useEffect } from 'react';
import { roadmapService } from '../services/api';
import type { RoadmapActivity } from '../types';
import {
  Map,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  Filter
} from 'lucide-react';

export const LearningRoadmap: React.FC = () => {
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRoadmap = async () => {
    try {
      const res = await roadmapService.getRoadmap();
      setRoadmapData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await roadmapService.updateActivityStatus(id, nextStatus);
      fetchRoadmap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await roadmapService.recalculateRoadmap();
      await fetchRoadmap();
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const activities: RoadmapActivity[] = roadmapData?.activities || [];
  const filtered = activities.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Map className="w-6 h-6 text-violet-400" />
            <span>Personalized Learning Roadmap</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Dynamic milestone sequence prioritized by your largest skill gaps and prerequisite hierarchies.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 shadow-neon-violet flex items-center space-x-2 transition-all disabled:opacity-50 flex-shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Recalculating...' : 'Recalculate Roadmap'}</span>
        </button>
      </div>

      {/* Progress Metric Card */}
      <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">Roadmap Progress</span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {roadmapData?.completed_count} of {roadmapData?.total_activities} Activities Finished
            </h3>
          </div>
          <span className="text-2xl font-bold text-violet-400 font-mono">
            {roadmapData?.completion_rate}%
          </span>
        </div>

        <div className="w-full bg-[#080912] rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${roadmapData?.completion_rate || 0}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {['all', 'pending', 'completed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs capitalize font-medium transition-all ${
              statusFilter === st
                ? 'bg-violet-600 text-white shadow-neon-violet'
                : 'bg-[#101321] border border-[#1F2438] text-gray-400 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Roadmap Step Timeline */}
      <div className="space-y-4">
        {filtered.map((item, index) => {
          const isDone = item.status === 'completed';
          return (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-[#0D0F1B]/60 border-emerald-500/20 opacity-80'
                  : 'bg-[#101321] border-[#1F2438] hover:border-violet-500/40 shadow-card-glow'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  {/* Step Circle */}
                  <div
                    onClick={() => handleUpdateStatus(item.id, item.status)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-[#17192B] border border-[#1F2438] hover:border-violet-500 text-gray-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-mono text-xs">{item.recommended_order}</span>}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase bg-[#17192B] text-cyan-400 px-2 py-0.5 rounded">
                        {item.skill_name}
                      </span>
                      <span className="text-[10px] text-gray-400 bg-[#141829] px-2 py-0.5 rounded uppercase">
                        {item.difficulty}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.estimated_duration_minutes} min</span>
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                      {item.topic}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-2xl">{item.learning_objective}</p>

                    {item.resource_url && (
                      <a
                        href={item.resource_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs text-violet-400 hover:text-violet-300 mt-3 font-medium"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{item.resource_title || 'Open Curated Study Resource'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Status Toggle Action */}
                <button
                  onClick={() => handleUpdateStatus(item.id, item.status)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium transition-all flex-shrink-0 ${
                    isDone
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#17192B] border border-[#1F2438] text-gray-300 hover:text-white hover:border-violet-500'
                  }`}
                >
                  {isDone ? 'Completed' : 'Mark as Done'}
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-xs text-gray-500">
            No activities matching current filter.
          </div>
        )}
      </div>
    </div>
  );
};
