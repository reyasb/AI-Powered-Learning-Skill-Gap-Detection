import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService, careerService, skillService } from '../services/api';
import type { CareerRole } from '../types';
import { Sparkles, CheckCircle2, Compass, BookOpen, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    college: '',
    degree: 'B.Tech / B.E.',
    branch: 'Computer Science',
    graduation_year: 2026,
    bio: '',
    target_career_id: 1,
    learning_pace: 'moderate',
    weekly_learning_hours: 12,
    preferred_learning_style: 'hands-on',
  });

  useEffect(() => {
    careerService.listCareers().then((res) => {
      setCareers(res.data);
      if (res.data.length > 0) {
        setFormData((prev) => ({ ...prev, target_career_id: res.data[0].id }));
      }
    });
  }, []);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await profileService.completeOnboarding(formData);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080912] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl bg-[#101321] border border-[#1F2438] rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === s
                    ? 'bg-violet-600 text-white shadow-neon-violet'
                    : step > s
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#181C2E] text-gray-500'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === s ? 'text-violet-300' : 'text-gray-500'}`}>
                {s === 1 ? 'Target Career' : s === 2 ? 'Learning Preferences' : 'Profile Bio'}
              </span>
              {s < 3 && <div className="w-12 h-0.5 bg-[#1F2438] hidden sm:block" />}
            </div>
          ))}
        </div>

        {/* Step 1: Target Career */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Compass className="w-5 h-5 text-violet-400" />
                <span>Select Your Target Career Goal</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                SkillMap AI will calculate skill gaps and build your adaptive roadmap for this role.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {careers.map((career) => (
                <div
                  key={career.id}
                  onClick={() => setFormData({ ...formData, target_career_id: career.id })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    formData.target_career_id === career.id
                      ? 'bg-violet-600/15 border-violet-500/60 shadow-neon-violet'
                      : 'bg-[#0D0F1B] border-[#1F2438] hover:border-gray-600'
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{career.title}</p>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{career.description}</p>
                  <span className="inline-block mt-2 text-[10px] font-mono uppercase bg-[#17192B] text-cyan-400 px-2 py-0.5 rounded">
                    {career.category}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-6 rounded-xl font-medium text-xs text-white bg-violet-600 hover:bg-violet-500 shadow-neon-violet flex items-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Learning Pace & Hours */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>Learning Pace & Availability</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Customize roadmap schedules according to your weekly availability.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Weekly Available Study Hours: <span className="text-cyan-400 font-bold">{formData.weekly_learning_hours} hrs/week</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={1}
                  value={formData.weekly_learning_hours}
                  onChange={(e) => setFormData({ ...formData, weekly_learning_hours: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-[#080912] rounded-lg h-2"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>5 hrs (Part-time)</span>
                  <span>20 hrs (Balanced)</span>
                  <span>40 hrs (Full-time)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Learning Pace</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'relaxed', label: 'Relaxed', desc: 'Gentle progression' },
                    { id: 'moderate', label: 'Moderate', desc: 'Standard industry pace' },
                    { id: 'intensive', label: 'Intensive', desc: 'Accelerated bootcamp' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, learning_pace: p.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.learning_pace === p.id
                          ? 'bg-cyan-500/15 border-cyan-500/60 shadow-neon-cyan'
                          : 'bg-[#0D0F1B] border-[#1F2438] hover:border-gray-600'
                      }`}
                    >
                      <p className="text-xs font-semibold text-white">{p.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Preferred Learning Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {['hands-on', 'visual', 'conceptual'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferred_learning_style: style })}
                      className={`p-3 rounded-xl border text-center capitalize text-xs transition-all ${
                        formData.preferred_learning_style === style
                          ? 'bg-violet-600/15 border-violet-500/60 text-violet-300'
                          : 'bg-[#0D0F1B] border-[#1F2438] text-gray-400'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl text-xs text-gray-400 hover:text-white border border-[#1F2438] flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-2.5 px-6 rounded-xl font-medium text-xs text-white bg-violet-600 hover:bg-violet-500 shadow-neon-violet flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Bio & Review */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <span>Finalize Your Learning Journey</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Provide a short student bio and finalize your preferences.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Personal Bio & Aspirations</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="e.g. Aspiring developer passionate about cloud microservices, reactive frontends, and AI..."
                  className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-[#0A0C16] rounded-xl border border-[#1F2438] text-xs space-y-1.5 text-gray-300">
                <p>✓ Target Career: <span className="text-violet-400 font-semibold">{careers.find(c => c.id === formData.target_career_id)?.title}</span></p>
                <p>✓ Study Goal: <span className="text-cyan-400 font-semibold">{formData.weekly_learning_hours} hrs/week</span> ({formData.learning_pace} pace)</p>
                <p>✓ Style: <span className="text-purple-400 font-semibold">{formData.preferred_learning_style}</span></p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 rounded-xl text-xs text-gray-400 hover:text-white border border-[#1F2438] flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="py-2.5 px-6 rounded-xl font-medium text-xs text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 shadow-neon-violet flex items-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Launching Platform...' : 'Launch Dashboard'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
