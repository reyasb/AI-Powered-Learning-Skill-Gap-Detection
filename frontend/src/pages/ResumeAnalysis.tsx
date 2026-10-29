import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resumeService, careerService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Select } from '../components/ui/Select';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  BookOpen,
  Compass,
  RotateCcw,
  Clock,
  Layers,
  ChevronRight,
  Check,
  X
} from 'lucide-react';

export const ResumeAnalysis: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<number | ''>('');
  const [resumes, setResumes] = useState<any[]>([]);
  const [activeResume, setActiveResume] = useState<any | null>(null);

  // File upload state
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Skill editing state
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [savingSkills, setSavingSkills] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [careersRes, resumesRes] = await Promise.all([
        careerService.listCareers(),
        resumeService.listResumes(),
      ]);
      setCareers(careersRes.data);
      if (careersRes.data.length > 0 && selectedCareerId === '') {
        setSelectedCareerId(careersRes.data[0].id);
      }
      setResumes(resumesRes.data);
      if (resumesRes.data.length > 0) {
        loadResumeDetails(resumesRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load resume analysis data', err);
    }
  };

  const loadResumeDetails = async (id: number) => {
    try {
      const res = await resumeService.getResume(id);
      setActiveResume(res.data);
      const skills = res.data.confirmed_skills?.length > 0
        ? res.data.confirmed_skills
        : res.data.extracted_skills || [];
      setCurrentSkills(skills);
      if (res.data.analysis?.career_id) {
        setSelectedCareerId(res.data.analysis.career_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setError('Please select a PDF or DOCX file.');
      setStagedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      setStagedFile(null);
      return;
    }

    setError(null);
    setStagedFile(file);
  };

  const handleAnalyzeResume = async () => {
    if (!stagedFile) return;

    setError(null);
    setSuccess(null);
    setAnalyzing(true);

    try {
      const careerIdNum = selectedCareerId ? Number(selectedCareerId) : undefined;
      const res = await resumeService.uploadResume(stagedFile, careerIdNum);
      setSuccess(`Resume "${stagedFile.name}" analyzed successfully!`);
      setStagedFile(null);

      // Refresh list and display active result
      const listRes = await resumeService.listResumes();
      setResumes(listRes.data);
      await loadResumeDetails(res.data.id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReanalyzeForCareer = async (newCareerId: number) => {
    if (!activeResume) return;
    setReanalyzing(true);
    setError(null);
    try {
      const res = await resumeService.reanalyzeResume(activeResume.id, newCareerId);
      setSelectedCareerId(newCareerId);
      await loadResumeDetails(activeResume.id);
      setSuccess(`Analysis updated for target career!`);
    } catch (err) {
      setError('Failed to reanalyze for selected career.');
    } finally {
      setReanalyzing(false);
    }
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !currentSkills.includes(trimmed)) {
      setCurrentSkills([...currentSkills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setCurrentSkills(currentSkills.filter((s) => s !== skillToRemove));
  };

  const handleConfirmSkills = async () => {
    if (!activeResume) return;
    setSavingSkills(true);
    setError(null);
    try {
      await resumeService.confirmSkills(activeResume.id, currentSkills);
      setSuccess('Confirmed skills successfully synced to your profile!');
      await loadResumeDetails(activeResume.id);
    } catch (err) {
      setError('Failed to sync skills.');
    } finally {
      setSavingSkills(false);
    }
  };

  const handleDeleteResume = async (id: number) => {
    if (!window.confirm('Delete this resume analysis record?')) return;
    try {
      await resumeService.deleteResume(id);
      const listRes = await resumeService.listResumes();
      setResumes(listRes.data);
      if (listRes.data.length > 0) {
        await loadResumeDetails(listRes.data[0].id);
      } else {
        setActiveResume(null);
        setCurrentSkills([]);
      }
      setSuccess('Resume record deleted.');
    } catch (err) {
      setError('Failed to delete resume.');
    }
  };

  const analysis = activeResume?.analysis || {};
  const matchPct = analysis.match_percentage || 0;
  const matchingSkills = analysis.matching_skills || [];
  const missingSkills = analysis.missing_skills || [];
  const suggestedCourses = analysis.suggested_courses || [];
  const recommendations = analysis.recommendations || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2.5">
            <FileText className="w-6 h-6 text-violet-400" />
            <span>AI Resume Skill Extraction & Gap Detection</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Upload your resume to extract verified skills, compare against target career benchmarks, and generate learning roadmaps.
          </p>
        </div>

        {activeResume && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/roadmap')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Go to Roadmap
          </Button>
        )}
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center space-x-3 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-white">✕</button>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center space-x-3 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Section: Upload Box & Career Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Zone (2 Cols) */}
        <Card className="lg:col-span-2 space-y-4">
          <CardHeader>
            <CardTitle>Upload Resume Document</CardTitle>
            <CardDescription>
              Select your target role and upload a PDF or DOCX resume to run the extraction engine.
            </CardDescription>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Career Selector */}
            <Select
              label="Target Career Benchmark"
              value={selectedCareerId}
              onChange={(e) => setSelectedCareerId(Number(e.target.value))}
            >
              {careers.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#111426] text-gray-200">
                  {c.title}
                </option>
              ))}
            </Select>

            {/* File Format Badge */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-300">Accepted Formats</label>
              <div className="flex items-center space-x-2 pt-1.5">
                <Badge variant="cyan" size="sm">PDF (.pdf)</Badge>
                <Badge variant="violet" size="sm">DOCX (.docx)</Badge>
                <span className="text-[11px] text-gray-500">Max 10MB</span>
              </div>
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div className="relative border-2 border-dashed border-[#252A40] hover:border-violet-500/60 rounded-2xl p-6 text-center transition-all bg-[#0D1020]/60">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              aria-label="Upload resume file"
            />
            <div className="flex flex-col items-center pointer-events-none space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center shadow-neon-violet">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-200">
                {stagedFile ? stagedFile.name : 'Click or drag resume here to upload'}
              </p>
              <p className="text-[11px] text-gray-500">
                {stagedFile ? `${(stagedFile.size / 1024).toFixed(1)} KB` : 'PDF and Word documents supported'}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              {stagedFile ? 'File ready for analysis' : 'No file selected yet'}
            </span>
            <Button
              variant="primary"
              size="md"
              onClick={handleAnalyzeResume}
              disabled={!stagedFile || analyzing}
              isLoading={analyzing}
              leftIcon={<Sparkles className="w-4 h-4 text-cyan-400" />}
            >
              Analyze Resume
            </Button>
          </div>
        </Card>

        {/* Saved Resume History (1 Col) */}
        <Card className="lg:col-span-1 space-y-3 flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Saved Analyses</CardTitle>
              <CardDescription>Reopen previous resume runs</CardDescription>
            </CardHeader>

            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
              {resumes.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  No previous resumes uploaded yet.
                </div>
              ) : (
                resumes.map((r) => {
                  const isSelected = activeResume?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => loadResumeDetails(r.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-violet-600/20 border-violet-500 text-white shadow-neon-violet'
                          : 'bg-[#0D1020] border-[#252A40] text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="overflow-hidden pr-2">
                        <p className="font-semibold truncate">{r.filename}</p>
                        <span className="text-[10px] text-gray-500 font-mono block">
                          {new Date(r.created_at).toLocaleDateString()} • {r.confirmed_skills?.length || r.extracted_skills?.length || 0} skills
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResume(r.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-rose-400 transition-opacity"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {activeResume && (
            <div className="pt-3 border-t border-[#252A40] text-[11px] text-gray-500 font-mono flex items-center justify-between">
              <span>Active: {activeResume.filename}</span>
              <Badge variant="emerald" size="sm">Loaded</Badge>
            </div>
          )}
        </Card>

      </div>

      {/* Analysis Results View */}
      {activeResume && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Results Card: Match Overview */}
          <Card className="bg-gradient-to-br from-[#111426] via-[#141829] to-[#111426] border-violet-500/40 shadow-neon-violet">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Target career & date */}
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <Badge variant="violet" size="sm">
                    {analysis.career_title || 'Target Role'}
                  </Badge>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Parsed: {new Date(activeResume.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Skill Match: {analysis.career_title}
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Based on skills verified from your uploaded document versus current industry competency requirements.
                </p>

                {/* Switch career benchmark dropdown on the fly */}
                <div className="pt-2 flex items-center space-x-3">
                  <span className="text-xs text-gray-400">Re-evaluate against:</span>
                  <select
                    value={selectedCareerId}
                    onChange={(e) => handleReanalyzeForCareer(Number(e.target.value))}
                    disabled={reanalyzing}
                    className="bg-[#0D1020] text-xs text-gray-200 rounded-xl px-3 py-1.5 border border-[#252A40] focus:border-violet-500 focus:outline-none"
                  >
                    {careers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Radial / Progress Visual */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#0D1020] border border-[#252A40] rounded-2xl min-w-[180px] shrink-0 text-center">
                <div className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400">
                  {matchPct}%
                </div>
                <span className="text-xs font-semibold text-gray-300 mt-1">Role Coverage</span>
                <span className="text-[10px] text-gray-500 mt-0.5">
                  {matchingSkills.length} of {matchingSkills.length + missingSkills.length} required skills
                </span>
                <div className="w-full mt-3">
                  <ProgressBar progress={matchPct} showPercentage={false} size="sm" />
                </div>
              </div>

            </div>
          </Card>

          {/* Middle Row: Matching Required vs Missing Required */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Matching Skills */}
            <Card className="space-y-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-emerald-400 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matching Skills ({matchingSkills.length})</span>
                  </CardTitle>
                  <Badge variant="emerald" size="sm">Verified in Resume</Badge>
                </div>
                <CardDescription>
                  Skills detected in your resume that fulfill target career benchmarks. Baseline estimated at 50% until tested.
                </CardDescription>
              </CardHeader>

              {matchingSkills.length === 0 ? (
                <p className="text-xs text-gray-500 p-4 bg-[#0D1020] rounded-xl text-center">
                  No matching skills detected for this specific role yet.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                  {matchingSkills.map((s: any) => (
                    <div
                      key={s.skill_id}
                      className="p-3 rounded-xl bg-[#0D1020] border border-[#252A40] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{s.name}</span>
                        <span className="text-[10px] text-gray-500 block font-mono">{s.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-semibold font-mono">Matched</span>
                        <span className="text-[10px] text-gray-500 block">Req: {s.required_proficiency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Missing Required Skills */}
            <Card className="space-y-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-rose-400 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Missing Skills ({missingSkills.length})</span>
                  </CardTitle>
                  <Badge variant="rose" size="sm">Skill Gap</Badge>
                </div>
                <CardDescription>
                  Critical skills required for {analysis.career_title} not detected in your resume.
                </CardDescription>
              </CardHeader>

              {missingSkills.length === 0 ? (
                <p className="text-xs text-emerald-400 p-4 bg-emerald-950/20 rounded-xl text-center font-medium">
                  🎉 All required benchmark skills detected in your resume!
                </p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                  {missingSkills.map((s: any) => (
                    <div
                      key={s.skill_id}
                      className="p-3 rounded-xl bg-[#0D1020] border border-rose-500/20 flex items-center justify-between text-xs"
                    >
                      <div className="overflow-hidden pr-2">
                        <span className="font-semibold text-rose-200">{s.name}</span>
                        <p className="text-[10px] text-gray-400 truncate max-w-xs">{s.rationale || s.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-rose-400 font-mono font-semibold">Priority: {s.importance_weight}x</span>
                        <span className="text-[10px] text-gray-500 block">Req: {s.required_proficiency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>

          {/* Extracted Skills Editor & Confirmation */}
          <Card className="space-y-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Extracted Skills ({currentSkills.length})</CardTitle>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmSkills}
                  isLoading={savingSkills}
                >
                  Sync Skills to Profile
                </Button>
              </div>
              <CardDescription>
                Verify and edit skills detected from your resume text. Confirming adds them as baseline evidence to your profile estimates.
              </CardDescription>
            </CardHeader>

            {/* Add new skill input */}
            <div className="flex items-center space-x-2 max-w-md">
              <input
                type="text"
                placeholder="Add missing skill (e.g. Docker, GraphQL)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                className="w-full bg-[#0D1020] text-xs text-gray-200 placeholder-gray-500 rounded-xl px-3.5 py-2 border border-[#252A40] focus:border-violet-500 focus:outline-none"
              />
              <Button variant="secondary" size="sm" onClick={handleAddSkill}>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </Button>
            </div>

            {/* Skill chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {currentSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-violet-600/15 text-violet-300 border border-violet-500/30 text-xs font-mono group"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-gray-400 hover:text-rose-400 transition-colors"
                    title={`Remove ${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </Card>

          {/* Actionable Recommendations & Suggested Courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Recommendations */}
            <Card className="space-y-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Actionable Recommendations</span>
                </CardTitle>
                <CardDescription>Tailored next steps to close role gaps</CardDescription>
              </CardHeader>

              <ul className="space-y-2.5 text-xs text-gray-300">
                {recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-[#0D1020] border border-[#252A40]">
                    <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/roadmap')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Generate Personalized Roadmap
                </Button>
              </div>
            </Card>

            {/* Suggested Courses */}
            <Card className="space-y-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-violet-400">
                  <BookOpen className="w-4 h-4" />
                  <span>Recommended Courses to Close Gaps</span>
                </CardTitle>
                <CardDescription>Syllabi covering your missing skills</CardDescription>
              </CardHeader>

              {suggestedCourses.length === 0 ? (
                <p className="text-xs text-gray-500 p-4 bg-[#0D1020] rounded-xl text-center">
                  Browse the Course Catalogue for more technical subjects.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {suggestedCourses.map((c: any) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-[#0D1020] border border-[#252A40] hover:border-violet-500/40 transition-colors flex items-center justify-between"
                    >
                      <div className="overflow-hidden pr-2">
                        <Link to={`/courses/${c.slug}`} className="font-semibold text-xs text-white hover:text-cyan-300 transition-colors truncate block">
                          {c.title}
                        </Link>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-500 font-mono mt-0.5">
                          <span>{c.duration_hours}h</span>
                          <span>•</span>
                          <span className="capitalize">{c.difficulty}</span>
                        </div>
                      </div>
                      <Link
                        to={`/courses/${c.slug}`}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 shrink-0"
                      >
                        Syllabus
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>

        </div>
      )}

    </div>
  );
};
