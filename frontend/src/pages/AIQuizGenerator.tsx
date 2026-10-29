import React, { useState, useEffect } from 'react';
import { quizService, documentService, skillService } from '../services/api';
import type { UploadedDocument } from '../types';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ArrowRight,
  ArrowLeft,
  FileText,
  Award,
  Layers
} from 'lucide-react';

export const AIQuizGenerator: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form parameters
  const [selectedDocId, setSelectedDocId] = useState<number | ''>('');
  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);

  const fetchData = async () => {
    try {
      const [docRes, skillRes, qRes] = await Promise.all([
        documentService.listDocuments(),
        skillService.listSkills(),
        quizService.listQuizzes(),
      ]);
      setDocuments(docRes.data);
      setSkills(skillRes.data);
      setQuizzes(qRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setResult(null);

    try {
      const res = await quizService.generateQuiz({
        document_id: selectedDocId ? Number(selectedDocId) : undefined,
        skill_id: selectedSkillId ? Number(selectedSkillId) : undefined,
        total_questions: Number(questionCount),
        difficulty,
      });

      // Load full quiz
      const detailRes = await quizService.getQuiz(res.data.id);
      setActiveQuiz(detailRes.data);
      setCurrentQIndex(0);
      setAnswers({});
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const loadQuiz = async (id: number) => {
    try {
      const res = await quizService.getQuiz(id);
      setActiveQuiz(res.data);
      setCurrentQIndex(0);
      setAnswers({});
      setResult(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectOption = (qId: number, opt: string) => {
    setAnswers({ ...answers, [qId]: opt });
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const payload = activeQuiz.questions.map((q: any) => ({
        question_id: q.id,
        selected_option: answers[q.id] || '',
      }));
      const res = await quizService.submitQuiz(activeQuiz.id, payload);
      setResult(res.data);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <HelpCircle className="w-6 h-6 text-violet-400" />
          <span>AI Practice Quiz & Assessment Generator</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Synthesize personalized MCQ quizzes on-demand from your uploaded notes or specific skills. Quizzes update your proficiency metrics in real time.
        </p>
      </div>

      {!activeQuiz ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Generator Form */}
          <div className="lg:col-span-7 bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Configure New Quiz</span>
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Source Learning Document (Optional)
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="">None (Use Skill Knowledge Base)</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.filename} ({d.chunk_count} chunks)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Or Target Technical Skill
                </label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="">Auto-Detect from Context</option>
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="easy">Easy (Fundamentals)</option>
                    <option value="medium">Medium (Application)</option>
                    <option value="hard">Hard (Deep Architecture)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Question Count</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-[#080912] border border-[#1F2438] focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-xs text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 shadow-neon-violet flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generating ? 'Synthesizing Questions...' : 'Generate AI Quiz'}</span>
              </button>
            </form>
          </div>

          {/* Past Generated Quizzes */}
          <div className="lg:col-span-5 bg-[#101321] border border-[#1F2438] rounded-2xl p-6 shadow-card-glow">
            <h3 className="text-sm font-bold text-white mb-3">Your Generated Quizzes</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {quizzes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => loadQuiz(q.id)}
                  className="p-3 rounded-xl bg-[#080912] border border-[#1F2438] hover:border-violet-500/50 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-white truncate max-w-[170px]">{q.title}</p>
                    <span className="text-[10px] text-gray-400 font-mono uppercase">{q.difficulty} • {q.total_questions} Qs</span>
                  </div>
                  {q.best_score !== null && (
                    <span className="text-xs font-bold text-cyan-400 font-mono">
                      {q.best_score}%
                    </span>
                  )}
                </div>
              ))}
              {quizzes.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-8">No quizzes generated yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : result ? (
        /* Quiz Results Review */
        <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-8 shadow-card-glow space-y-6">
          <div className="text-center pb-6 border-b border-[#1F2438]">
            <Award className="w-12 h-12 text-cyan-400 mx-auto mb-2 animate-bounce" />
            <h2 className="text-xl font-bold text-white">Quiz Evaluation Completed</h2>
            <p className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">{result.score}%</p>
            <p className="text-xs text-gray-400 mt-1">
              {result.correct_count} of {result.total_questions} answered correctly
            </p>
            {result.skill_updated && (
              <p className="text-xs text-emerald-400 font-semibold mt-2">
                ✓ Updated proficiency for <span className="underline">{result.skill_updated}</span> to <span className="font-mono">{result.new_proficiency}%</span>!
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Answer Review</h4>
            {result.review?.map((item: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  item.is_correct ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-xs font-semibold text-gray-200">
                    Q{idx + 1}. {item.question_text}
                  </p>
                  {item.is_correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Selected: <strong className="text-white">{item.selected_option || 'None'}</strong> | Correct: <strong className="text-emerald-400">{item.correct_option}</strong>
                </p>
                {item.explanation && (
                  <p className="text-[11px] text-gray-300 mt-1.5 bg-[#080912] p-2 rounded-lg">
                    {item.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => { setActiveQuiz(null); setResult(null); }}
              className="py-2 px-4 rounded-xl text-xs border border-[#1F2438] text-gray-300 hover:text-white"
            >
              Exit to Generator
            </button>
            <button
              onClick={() => loadQuiz(activeQuiz.id)}
              className="py-2 px-5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-neon-violet flex items-center space-x-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Quiz</span>
            </button>
          </div>
        </div>
      ) : (
        /* Quiz Runner UI */
        <div className="bg-[#101321] border border-[#1F2438] rounded-2xl p-6 md:p-8 shadow-card-glow space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1F2438]">
            <div>
              <h3 className="text-sm font-bold text-white">{activeQuiz.title}</h3>
              <p className="text-xs text-gray-400">
                Question {currentQIndex + 1} of {activeQuiz.questions.length}
              </p>
            </div>
            <button
              onClick={() => setActiveQuiz(null)}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Cancel
            </button>
          </div>

          {activeQuiz.questions[currentQIndex] && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white leading-relaxed">
                {activeQuiz.questions[currentQIndex].question_text}
              </h3>

              <div className="space-y-2 mt-4">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const optVal = activeQuiz.questions[currentQIndex][`option_${opt.toLowerCase()}`];
                  const qId = activeQuiz.questions[currentQIndex].id;
                  const isSelected = answers[qId] === opt;
                  return (
                    <div
                      key={opt}
                      onClick={() => handleSelectOption(qId, opt)}
                      className={`p-3 rounded-xl border cursor-pointer text-xs flex items-center space-x-3 transition-all ${
                        isSelected
                          ? 'bg-violet-600/20 border-violet-500 text-white shadow-neon-violet'
                          : 'bg-[#080912] border-[#1F2438] text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-violet-600 text-white' : 'bg-[#17192B] text-gray-400'
                      }`}>
                        {opt}
                      </span>
                      <span>{optVal}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-[#1F2438]">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(currentQIndex - 1)}
              className="py-2 px-4 rounded-xl text-xs border border-[#1F2438] text-gray-400 hover:text-white disabled:opacity-30"
            >
              Previous
            </button>

            {currentQIndex < activeQuiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQIndex(currentQIndex + 1)}
                className="py-2 px-5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-neon-violet"
              >
                Next
              </button>
            ) : (
              <button
                disabled={submitting}
                onClick={handleSubmitQuiz}
                className="py-2 px-6 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 shadow-neon-cyan disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
