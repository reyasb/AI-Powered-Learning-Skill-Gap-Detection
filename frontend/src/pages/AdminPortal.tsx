import React, { useState, useEffect } from 'react';
import { adminService, careerService, skillService } from '../services/api';
import {
  ShieldAlert,
  Users,
  Compass,
  CheckSquare,
  BookOpen,
  Plus,
  Save,
  Sparkles,
  Layers
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [careers, setCareers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // Forms
  const [careerTitle, setCareerTitle] = useState('');
  const [careerSlug, setCareerSlug] = useState('');
  const [careerDesc, setCareerDesc] = useState('');
  const [careerCategory, setCareerCategory] = useState('Software Engineering');

  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Languages');
  const [skillDesc, setSkillDesc] = useState('');

  const [reqCareerId, setReqCareerId] = useState<number>(1);
  const [reqSkillId, setReqSkillId] = useState<number>(1);
  const [reqProficiency, setReqProficiency] = useState<number>(80);
  const [reqWeight, setReqWeight] = useState<number>(4.0);

  const fetchAdminData = async () => {
    try {
      const [mRes, cRes, sRes] = await Promise.all([
        adminService.getMetrics(),
        careerService.listCareers(),
        skillService.listSkills(),
      ]);
      setMetrics(mRes.data);
      setCareers(cRes.data);
      setSkills(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createCareer({
        title: careerTitle,
        slug: careerSlug.toLowerCase().replace(/\s+/g, '-'),
        description: careerDesc,
        category: careerCategory,
      });
      setMsg(`Career role "${careerTitle}" created successfully!`);
      setCareerTitle('');
      setCareerSlug('');
      setCareerDesc('');
      fetchAdminData();
    } catch (err: any) {
      setMsg(err.response?.data?.detail || 'Failed to create career role.');
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createSkill({
        name: skillName,
        category: skillCategory,
        description: skillDesc,
      });
      setMsg(`Skill "${skillName}" added to catalogue!`);
      setSkillName('');
      setSkillDesc('');
      fetchAdminData();
    } catch (err: any) {
      setMsg(err.response?.data?.detail || 'Failed to add skill.');
    }
  };

  const handleUpdateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.updateRequirement({
        career_id: Number(reqCareerId),
        skill_id: Number(reqSkillId),
        required_proficiency: Number(reqProficiency),
        importance_weight: Number(reqWeight),
      });
      setMsg('Requirement successfully configured.');
      fetchAdminData();
    } catch (err: any) {
      setMsg(err.response?.data?.detail || 'Failed to update requirement.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <ShieldAlert className="w-6 h-6 text-rose-400" />
          <span>Platform Administration & Curricular Governance</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage career roles, calibrate skill benchmark proficiencies, and review platform usage metrics.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl text-violet-300 text-xs">
          {msg}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-[#101321] border border-[#1F2438] rounded-2xl">
          <p className="text-[10px] text-gray-400 font-mono uppercase">Total Users</p>
          <p className="text-xl font-bold text-white mt-1 font-mono">{metrics?.total_users}</p>
        </div>

        <div className="p-4 bg-[#101321] border border-[#1F2438] rounded-2xl">
          <p className="text-[10px] text-gray-400 font-mono uppercase">Career Roles</p>
          <p className="text-xl font-bold text-cyan-400 mt-1 font-mono">{metrics?.total_careers}</p>
        </div>

        <div className="p-4 bg-[#101321] border border-[#1F2438] rounded-2xl">
          <p className="text-[10px] text-gray-400 font-mono uppercase">Skills Catalog</p>
          <p className="text-xl font-bold text-violet-400 mt-1 font-mono">{metrics?.total_skills}</p>
        </div>

        <div className="p-4 bg-[#101321] border border-[#1F2438] rounded-2xl">
          <p className="text-[10px] text-gray-400 font-mono uppercase">Assessments Taken</p>
          <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">{metrics?.total_assessments_taken}</p>
        </div>

        <div className="p-4 bg-[#101321] border border-[#1F2438] rounded-2xl">
          <p className="text-[10px] text-gray-400 font-mono uppercase">RAG Documents</p>
          <p className="text-xl font-bold text-amber-400 mt-1 font-mono">{metrics?.total_documents_uploaded}</p>
        </div>

        <div className="p-4 bg-[#101321] border border-[#1F2438] rounded-2xl">
          <p className="text-[10px] text-gray-400 font-mono uppercase">Question Bank</p>
          <p className="text-xl font-bold text-rose-400 mt-1 font-mono">{metrics?.total_questions}</p>
        </div>
      </div>

      {/* Admin Action Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form 1: Add Career Role */}
        <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-4">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Add Career Role</span>
          </h3>

          <form onSubmit={handleCreateCareer} className="space-y-3">
            <div>
              <label className="block text-[11px] text-gray-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={careerTitle}
                onChange={(e) => {
                  setCareerTitle(e.target.value);
                  setCareerSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                placeholder="e.g. Site Reliability Engineer"
                className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-300 mb-1">Slug</label>
              <input
                type="text"
                required
                value={careerSlug}
                onChange={(e) => setCareerSlug(e.target.value)}
                placeholder="site-reliability-engineer"
                className="w-full bg-[#080912] border border-[#1F2438] rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-300 mb-1">Category</label>
              <select
                value={careerCategory}
                onChange={(e) => setCareerCategory(e.target.value)}
                className="w-full bg-[#080912] border border-[#1F2438] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Web Development">Web Development</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Data Analytics">Data Analytics</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-300 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={careerDesc}
                onChange={(e) => setCareerDesc(e.target.value)}
                placeholder="Role responsibilities..."
                className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-neon-violet transition-all"
            >
              Create Role
            </button>
          </form>
        </div>

        {/* Form 2: Add Skill */}
        <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-4">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Add Skill to Catalogue</span>
          </h3>

          <form onSubmit={handleCreateSkill} className="space-y-3">
            <div>
              <label className="block text-[11px] text-gray-300 mb-1">Skill Name</label>
              <input
                type="text"
                required
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g. GraphQL, Rust"
                className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-300 mb-1">Category</label>
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                className="w-full bg-[#080912] border border-[#1F2438] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="Languages">Languages</option>
                <option value="Frameworks">Frameworks</option>
                <option value="Databases">Databases</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="AI / ML">AI / ML</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Core CS">Core CS</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-300 mb-1">Description</label>
              <textarea
                rows={4}
                value={skillDesc}
                onChange={(e) => setSkillDesc(e.target.value)}
                placeholder="Competency definition..."
                className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-neon-violet transition-all"
            >
              Add Skill
            </button>
          </form>
        </div>

        {/* Form 3: Configure Role Requirement */}
        <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Configure Role Benchmark</span>
          </h3>

          <form onSubmit={handleUpdateRequirement} className="space-y-3">
            <div>
              <label className="block text-[11px] text-gray-300 mb-1">Target Role</label>
              <select
                value={reqCareerId}
                onChange={(e) => setReqCareerId(Number(e.target.value))}
                className="w-full bg-[#080912] border border-[#1F2438] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-300 mb-1">Select Skill</label>
              <select
                value={reqSkillId}
                onChange={(e) => setReqSkillId(Number(e.target.value))}
                className="w-full bg-[#080912] border border-[#1F2438] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-300 mb-1">
                Target Proficiency: <strong className="text-cyan-400 font-mono">{reqProficiency}%</strong>
              </label>
              <input
                type="range"
                min={20}
                max={100}
                value={reqProficiency}
                onChange={(e) => setReqProficiency(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-[#080912] rounded-lg h-2"
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-300 mb-1">
                Importance Weight: <strong className="text-violet-400 font-mono">{reqWeight}x</strong>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={0.5}
                value={reqWeight}
                onChange={(e) => setReqWeight(Number(e.target.value))}
                className="w-full accent-violet-400 bg-[#080912] rounded-lg h-2"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-neon-cyan transition-all"
            >
              Update Benchmark
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
