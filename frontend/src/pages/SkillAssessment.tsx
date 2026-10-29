import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentService, careerService, skillService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/EmptyState';
import {
  CheckSquare,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  SlidersHorizontal,
  Compass,
  Layers,
  ChevronRight,
  Send,
  TrendingUp
} from 'lucide-react';

export const SkillAssessment: React.FC = () => {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [viewTab, setViewTab] = useState<'take' | 'history'>('take');

  // Active Assessment State
  const [activeAssessment, setActiveAssessment] = useState<any | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Custom Setup Modal State
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<number | ''>('');
  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [creatingCustom, setCreatingCustom] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Live Timer
  useEffect(() => {
    let interval: any = null;
    if (activeAssessment && !result) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeAssessment, result]);

  const fetchInitialData = async () => {
    try {
      const [assRes, histRes, careersRes, skillsRes] = await Promise.all([
        assessmentService.listAssessments(),
        assessmentService.getHistory(),
        careerService.listCareers(),
        skillService.listSkills(),
      ]);
      setAssessments(assRes.data);
      setHistory(histRes.data);
      setCareers(careersRes.data);
      setSkills(skillsRes.data);
      if (careersRes.data.length > 0) {
        setSelectedCareerId(careersRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load assessment data', err);
    }
  };

  const startPredefinedAssessment = async (id: number) => {
    try {
      const res = await assessmentService.getAssessment(id);
      setActiveAssessment(res.data);
      setCurrentQIndex(0);
      setUserAnswers({});
      setTimeSpent(0);
      setResult(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartCustomAssessment = async () => {
    try {
      setCreatingCustom(true);
      const res = await assessmentService.createCustomAssessment({
        career_id: selectedCareerId ? Number(selectedCareerId) : undefined,
        skill_id: selectedSkillId ? Number(selectedSkillId) : undefined,
        difficulty: selectedDifficulty,
        question_count: selectedCount,
      });
      setCustomModalOpen(false);
      setActiveAssessment(res.data);
      setCurrentQIndex(0);
      setUserAnswers({});
      setTimeSpent(0);
      setResult(null);
    } catch (err) {
      console.error('Failed to create custom assessment', err);
    } finally {
      setCreatingCustom(false);
    }
  };

  const handleSelectOption = (questionId: number, optionLetter: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionLetter }));
  };

  const confirmAndSubmit = async () => {
    if (!activeAssessment) return;
    setShowReviewModal(false);
    setIsSubmitting(true);

    try {
      const formattedAnswers = activeAssessment.questions.map((q: any) => ({
        question_id: q.id,
        selected_option: userAnswers[q.id] || '',
      }));

      const res = await assessmentService.submitAssessment(
        activeAssessment.id,
        formattedAnswers,
        timeSpent
      );
      setResult(res.data);

      // Refresh attempts history
      const histRes = await assessmentService.getHistory();
      setHistory(histRes.data);
    } catch (err) {
      console.error('Failed to submit assessment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = activeAssessment?.questions?.length || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2.5">
            <CheckSquare className="w-6 h-6 text-violet-400" />
            <span>Standardized Skill Assessment Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Evaluate your competencies across verified benchmarks. Scores update your Bayesian proficiency models automatically.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#111426] border border-[#252A40] p-1 rounded-xl shrink-0">
          <button
            onClick={() => { setViewTab('take'); setResult(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewTab === 'take'
                ? 'bg-violet-600 text-white shadow-neon-violet'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Assessments
          </button>
          <button
            onClick={() => { setViewTab('history'); setActiveAssessment(null); setResult(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewTab === 'history'
                ? 'bg-violet-600 text-white shadow-neon-violet'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Attempt History ({history.length})
          </button>
        </div>
      </div>

      {/* VIEW: Take Assessment Catalog or Live Test or Results */}
      {viewTab === 'take' && (
        <>
          {!activeAssessment ? (
            /* Catalog & Custom Setup Launcher */
            <div className="space-y-6">
              
              {/* Custom Evaluation Hero Banner */}
              <Card className="bg-gradient-to-r from-violet-900/30 via-[#111426] to-cyan-900/20 border-violet-500/40 shadow-neon-violet p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <Badge variant="cyan" size="sm">Diagnostic Evaluation</Badge>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Create Custom Role-Specific Diagnostic Assessment
                  </h2>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Target your specific career path, focus on individual topics, choose difficulty, and test your knowledge against real database benchmarks.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCustomModalOpen(true)}
                  leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                >
                  Configure Assessment
                </Button>
              </Card>

              {/* Standard Assessment Grid */}
              <div>
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Curated Standard Assessments</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assessments.map((ass) => (
                    <Card
                      key={ass.id}
                      className="hover:border-violet-500/50 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="cyan" size="sm">{ass.difficulty}</Badge>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{ass.duration_minutes} min</span>
                          </div>
                        </div>

                        <h4 className="text-base font-bold text-white">{ass.title}</h4>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {ass.description}
                        </p>

                        <div className="flex items-center space-x-2 text-[11px] font-mono text-violet-300 pt-1">
                          <Layers className="w-3.5 h-3.5 text-violet-400" />
                          <span>{ass.total_questions} Questions in Question Bank</span>
                        </div>
                      </div>

                      <div className="pt-6">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          onClick={() => startPredefinedAssessment(ass.id)}
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          Start Assessment
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
          ) : result ? (
            /* Result Review Screen */
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Score Overview Card */}
              <Card className="bg-gradient-to-br from-[#111426] via-[#141829] to-[#111426] border-violet-500/40 shadow-neon-violet text-center p-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 p-0.5 shadow-neon-violet mx-auto">
                  <div className="w-full h-full bg-[#111426] rounded-[14px] flex items-center justify-center">
                    <Award className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>

                <h2 className="text-2xl font-black text-white">Assessment Completed</h2>
                
                <div className="text-4xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400">
                  {result.score}%
                </div>

                <p className="text-xs text-gray-300">
                  You answered <strong className="text-white">{result.correct_count}</strong> of {result.total_questions} questions correctly in {formatTimer(timeSpent)}.
                </p>

                {result.updated_readiness > 0 && (
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Target Role Readiness: {result.updated_readiness}%</span>
                  </div>
                )}
              </Card>

              {/* Strengths & Areas to Improve */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <Card className="space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Demonstrated Strengths</span>
                  </h4>
                  {result.strengths && result.strengths.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.strengths.map((s: string, idx: number) => (
                        <Badge key={idx} variant="emerald" size="sm">{s}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Keep practicing to establish high proficiency in tested topics.</p>
                  )}
                </Card>

                {/* Areas to Improve */}
                <Card className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Areas to Improve</span>
                  </h4>
                  {result.areas_to_improve && result.areas_to_improve.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.areas_to_improve.map((a: string, idx: number) => (
                        <Badge key={idx} variant="amber" size="sm">{a}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-400">Exceptional work! No critical weaknesses detected in this set.</p>
                  )}
                </Card>
              </div>

              {/* Bayesian Skill Proficiency Recalculations */}
              <Card className="space-y-4">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Bayesian Skill Proficiency Recalculations</span>
                  </CardTitle>
                  <CardDescription>
                    Updated your persistent skill proficiency using probabilistic Bayesian updates based on performance.
                  </CardDescription>
                </CardHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(result.skill_breakdown || {}).map(([skillName, stat]: [string, any]) => (
                    <div key={skillName} className="p-3 bg-[#0D1020] border border-[#252A40] rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-white">{skillName}</span>
                        <span className="text-[10px] text-gray-400 block font-mono">Score: {stat.tested_score}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block font-mono">Updated Proficiency</span>
                        <span className="text-xs font-bold text-cyan-400 font-mono">{stat.updated_proficiency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recommended Courses to Close Identified Gaps */}
              {result.recommended_courses && result.recommended_courses.length > 0 && (
                <Card className="space-y-4">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-violet-400">
                      <BookOpen className="w-4 h-4" />
                      <span>Recommended Courses Based on Your Results</span>
                    </CardTitle>
                    <CardDescription>
                      Handpicked curriculums to strengthen your specific weak areas.
                    </CardDescription>
                  </CardHeader>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.recommended_courses.map((c: any) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-xl bg-[#0D1020] border border-[#252A40] hover:border-violet-500/40 transition-colors flex items-center justify-between"
                      >
                        <div className="overflow-hidden pr-2">
                          <h5 className="font-semibold text-xs text-white truncate">{c.title}</h5>
                          <span className="text-[10px] text-gray-500 font-mono mt-0.5 block capitalize">
                            {c.difficulty} • {c.duration_hours}h
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/courses/${c.slug}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Detailed Question Review */}
              <Card className="space-y-4">
                <CardHeader>
                  <CardTitle>Detailed Question Review & Explanations</CardTitle>
                  <CardDescription>Inspect correct answers and rationale for each question.</CardDescription>
                </CardHeader>

                <div className="space-y-3">
                  {result.review?.map((item: any, idx: number) => (
                    <div
                      key={item.question_id}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        item.is_correct
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-gray-200">
                          Q{idx + 1}. {item.question_text}
                        </span>
                        {item.is_correct ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center space-x-4 pt-1 font-mono text-[11px]">
                        <span className="text-gray-400">
                          Your Answer: <strong className="text-white">{item.selected_option || 'None'}</strong>
                        </span>
                        <span className="text-emerald-400 font-semibold">
                          Correct: {item.correct_option}
                        </span>
                      </div>

                      {item.explanation && (
                        <p className="text-[11px] text-gray-300 bg-[#0D1020] p-2.5 rounded-lg border border-[#252A40]">
                          💡 <strong className="text-violet-300">Explanation:</strong> {item.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Bottom Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => { setActiveAssessment(null); setResult(null); }}
                >
                  Return to Assessments
                </Button>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => navigate('/skill-gaps')}
                  >
                    View Skill Gaps
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => startPredefinedAssessment(activeAssessment.id)}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Retake
                  </Button>
                </div>
              </div>

            </div>
          ) : (
            /* Live Question Taking View */
            <Card className="space-y-6">
              
              {/* Question Header & Live Timer */}
              <div className="flex items-center justify-between pb-4 border-b border-[#252A40]">
                <div>
                  <h3 className="text-sm font-bold text-white">{activeAssessment.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Question {currentQIndex + 1} of {totalQuestions} • {answeredCount} Answered
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-[#0D1020] border border-[#252A40] px-3 py-1.5 rounded-xl text-cyan-400 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>{formatTimer(timeSpent)}</span>
                </div>
              </div>

              {/* Question Stepper Progress Bar */}
              <ProgressBar
                progress={((currentQIndex + 1) / totalQuestions) * 100}
                showPercentage={false}
                size="sm"
              />

              {/* Question Number Stepper Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                {activeAssessment.questions.map((q: any, i: number) => {
                  const isCurrent = i === currentQIndex;
                  const isAnswered = !!userAnswers[q.id];
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIndex(i)}
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-bold shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-violet-600 text-white shadow-neon-violet'
                          : isAnswered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-[#181D33] text-gray-400 hover:text-white'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {/* Current Question */}
              {activeAssessment.questions[currentQIndex] && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-start space-x-2 text-sm sm:text-base font-semibold text-white leading-relaxed">
                    <span className="text-violet-400 font-mono">Q{currentQIndex + 1}.</span>
                    <span>{activeAssessment.questions[currentQIndex].question_text}</span>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5 pt-2">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const optText = activeAssessment.questions[currentQIndex][`option_${opt.toLowerCase()}`];
                      const qId = activeAssessment.questions[currentQIndex].id;
                      const isSelected = userAnswers[qId] === opt;
                      return (
                        <div
                          key={opt}
                          onClick={() => handleSelectOption(qId, opt)}
                          className={`p-4 rounded-xl border cursor-pointer text-xs sm:text-sm flex items-center space-x-3 transition-all ${
                            isSelected
                              ? 'bg-violet-600/20 border-violet-500 text-white shadow-neon-violet'
                              : 'bg-[#0D1020] border-[#252A40] text-gray-300 hover:border-gray-600 hover:bg-[#141829]'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                              isSelected ? 'bg-violet-600 text-white' : 'bg-[#181D33] text-gray-400'
                            }`}
                          >
                            {opt}
                          </span>
                          <span className="leading-snug">{optText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stepper Navigation Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-[#252A40]">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex((prev) => prev - 1)}
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-2">
                  {currentQIndex < totalQuestions - 1 ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentQIndex((prev) => prev + 1)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Next
                    </Button>
                  ) : null}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowReviewModal(true)}
                    isLoading={isSubmitting}
                    rightIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Submit Assessment
                  </Button>
                </div>
              </div>

            </Card>
          )}
        </>
      )}

      {/* VIEW: Attempt History */}
      {viewTab === 'history' && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Assessment Attempt History</CardTitle>
            <CardDescription>Track your benchmark scores and proficiency progression over time.</CardDescription>
          </CardHeader>

          {history.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No previous attempts recorded yet. Take an assessment to start tracking your progress.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((att) => (
                <div
                  key={att.id}
                  className="p-4 rounded-xl bg-[#0D1020] border border-[#252A40] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{att.title}</h4>
                    <p className="text-xs text-gray-400 font-mono">
                      {new Date(att.completed_at).toLocaleDateString()} • {att.total_questions} Questions • Time: {formatTimer(att.time_spent_seconds || 0)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-black font-mono text-cyan-400">{att.score}%</span>
                      <span className="text-[10px] text-gray-500 block font-mono">
                        {att.correct_count}/{att.total_questions} Correct
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Custom Assessment Setup Modal */}
      <Modal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        title="Configure Diagnostic Assessment"
      >
        <div className="space-y-4">
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

          <Select
            label="Filter by Topic / Skill (Optional)"
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">All Career Skills</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#111426] text-gray-200">
                {s.name} ({s.category})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Difficulty"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>

            <Select
              label="Number of Questions"
              value={selectedCount}
              onChange={(e) => setSelectedCount(Number(e.target.value))}
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
            </Select>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-2 border-t border-[#252A40]">
            <Button variant="ghost" size="sm" onClick={() => setCustomModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartCustomAssessment}
              isLoading={creatingCustom}
            >
              Start Diagnostic Test
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Before Submit Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Confirm Assessment Submission"
      >
        <div className="space-y-4 text-xs text-gray-300">
          <p>
            You have answered <strong className="text-white">{answeredCount}</strong> of{' '}
            <strong className="text-white">{totalQuestions}</strong> questions.
          </p>

          {answeredCount < totalQuestions && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You have {totalQuestions - answeredCount} unanswered questions remaining.</span>
            </div>
          )}

          <p className="text-gray-400">
            Once submitted, your answers will be graded server-side and your Bayesian proficiency models will update.
          </p>

          <div className="pt-4 flex items-center justify-end space-x-2 border-t border-[#252A40]">
            <Button variant="ghost" size="sm" onClick={() => setShowReviewModal(false)}>
              Back to Questions
            </Button>
            <Button variant="primary" size="sm" onClick={confirmAndSubmit}>
              Confirm & Submit
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
