import React, { useState, useEffect } from 'react';
import { careerService } from '../services/api';
import type { CareerRole } from '../types';
import {
  Compass,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  Code2,
  Target
} from 'lucide-react';

export const CareerExplorer: React.FC = () => {
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    careerService.listCareers()
      .then((res) => {
        setCareers(res.data);
        if (res.data.length > 0) {
          loadCareerDetail(res.data[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const loadCareerDetail = async (id: number) => {
    try {
      const res = await careerService.getCareer(id);
      setSelectedCareer(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectAsTarget = async (id: number) => {
    try {
      await careerService.selectTargetCareer(id);
      setSuccessMsg(`Target role updated to "${selectedCareer?.title}". Your roadmap and skill gaps have adapted.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['All', ...Array.from(new Set(careers.map((c) => c.category)))];

  const filtered = careers.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Compass className="w-6 h-6 text-violet-400" />
          <span>Career Role Catalogue & Benchmarks</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Explore benchmark roles across modern engineering disciplines. Inspect target proficiencies, skill weights, and select your target career.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 shadow-neon-violet">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roles (e.g. AI/ML, Full Stack)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#101321] border border-[#1F2438] focus:border-violet-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-violet-600 text-white shadow-neon-violet'
                  : 'bg-[#101321] border border-[#1F2438] text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Roles Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Role Cards */}
        <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
          {filtered.map((c) => {
            const isSelected = selectedCareer?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => loadCareerDetail(c.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-950/40 to-[#14182B] border-violet-500/60 shadow-neon-violet'
                    : 'bg-[#101321] border-[#1F2438] hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{c.title}</h3>
                  <span className="text-[10px] font-mono uppercase bg-[#181C2E] text-cyan-400 px-2 py-0.5 rounded">
                    {c.category}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between mt-3 text-[11px] text-gray-500">
                  <span>{c.required_skills_count || 5} core requirements</span>
                  <span className="text-violet-400 font-medium flex items-center space-x-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Role Detail */}
        <div className="lg:col-span-7">
          {selectedCareer ? (
            <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow space-y-6 sticky top-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2438]">
                <div>
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono uppercase mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{selectedCareer.category}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedCareer.title}</h2>
                </div>

                <button
                  onClick={() => handleSelectAsTarget(selectedCareer.id)}
                  className="py-2.5 px-5 rounded-xl font-medium text-xs text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 shadow-neon-violet flex items-center justify-center space-x-2 transition-all flex-shrink-0"
                >
                  <Target className="w-4 h-4" />
                  <span>Set as My Target Role</span>
                </button>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Role Overview
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">{selectedCareer.description}</p>
              </div>

              {/* Required Skills & Benchmarks */}
              <div>
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                  Required Competencies & Benchmarks
                </h4>
                <div className="space-y-2.5">
                  {selectedCareer.required_skills?.map((sk: any) => (
                    <div
                      key={sk.skill_id}
                      className="p-3 rounded-xl bg-[#080912] border border-[#1F2438] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-white">{sk.name}</span>
                          <span className="text-[10px] text-gray-500 bg-[#141829] px-2 py-0.5 rounded">
                            {sk.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sk.rationale}</p>
                      </div>

                      <div className="flex items-center space-x-3 text-xs flex-shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 block">Target</span>
                          <span className="text-cyan-400 font-mono font-bold">{sk.required_proficiency}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 block">Weight</span>
                          <span className="text-violet-400 font-mono font-bold">{sk.importance_weight}x</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Topics & Sample Projects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#0D0F1B] border border-[#1F2438]">
                  <p className="text-xs font-semibold text-cyan-400 flex items-center space-x-1.5 mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Key Curricular Topics</span>
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {selectedCareer.suggested_topics?.map((topic: string) => (
                      <li key={topic} className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#0D0F1B] border border-[#1F2438]">
                  <p className="text-xs font-semibold text-violet-400 flex items-center space-x-1.5 mb-2">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Sample Capstone Projects</span>
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {selectedCareer.sample_projects?.map((proj: string) => (
                      <li key={proj} className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        <span>{proj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 italic">
                * Note: Initial career requirements are configurable reference values designed to adapt dynamically as industry standards evolve.
              </p>
            </div>
          ) : (
            <div className="text-center py-20 text-xs text-gray-500">
              Select a career from the catalogue to view required competencies and benchmarks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
