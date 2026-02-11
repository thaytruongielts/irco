
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { READING_PASSAGES } from './constants';
import { Question, QuizState, PassageQuizState } from './types';
import { generate26Questions } from './geminiService';
import { 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  ClipboardCheck, 
  RotateCcw, 
  Loader2,
  Award,
  AlertCircle,
  LayoutDashboard
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [quiz, setQuiz] = useState<QuizState>({
    questions: [],
    tabStates: {
      0: { userAnswers: {}, isSubmitted: false },
      1: { userAnswers: {}, isSubmitted: false },
    },
    isLoading: true,
  });

  const initQuiz = useCallback(async () => {
    setQuiz(prev => ({ ...prev, isLoading: true }));
    try {
      const generated = await generate26Questions();
      setQuiz({
        questions: generated,
        tabStates: {
          0: { userAnswers: {}, isSubmitted: false },
          1: { userAnswers: {}, isSubmitted: false },
        },
        isLoading: false,
      });
    } catch (err) {
      console.error(err);
      setQuiz(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    initQuiz();
  }, [initQuiz]);

  const handleAnswer = (questionId: number, answer: string) => {
    if (quiz.tabStates[activeTab].isSubmitted) return;
    setQuiz(prev => ({
      ...prev,
      tabStates: {
        ...prev.tabStates,
        [activeTab]: {
          ...prev.tabStates[activeTab],
          userAnswers: { ...prev.tabStates[activeTab].userAnswers, [questionId]: answer }
        }
      }
    }));
  };

  const calculateScore = (passageId: number) => {
    const passageQuestions = quiz.questions.filter(q => q.passageId === passageId);
    if (passageQuestions.length === 0) return 0;
    
    let correct = 0;
    passageQuestions.forEach(q => {
      const userAns = (quiz.tabStates[passageId].userAnswers[q.id] || "").toLowerCase().trim();
      const correctAns = q.correctAnswer.toLowerCase().trim();
      if (userAns === correctAns) {
        correct++;
      }
    });
    return (10 * correct) / passageQuestions.length;
  };

  const handleSubmit = (passageId: number) => {
    const passageQuestions = quiz.questions.filter(q => q.passageId === passageId);
    const answeredCount = Object.keys(quiz.tabStates[passageId].userAnswers).length;
    
    if (answeredCount < passageQuestions.length) {
      if (!confirm(`Bạn mới trả lời ${answeredCount}/${passageQuestions.length} câu của bài này. Bạn có chắc muốn nộp bài?`)) return;
    }
    
    setQuiz(prev => ({
      ...prev,
      tabStates: {
        ...prev.tabStates,
        [passageId]: { ...prev.tabStates[passageId], isSubmitted: true }
      }
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetPassage = (passageId: number) => {
    if (!confirm("Bạn có muốn xóa kết quả của bài này và làm lại?")) return;
    setQuiz(prev => ({
      ...prev,
      tabStates: {
        ...prev.tabStates,
        [passageId]: { userAnswers: {}, isSubmitted: false }
      }
    }));
  };

  const currentPassage = READING_PASSAGES[activeTab];
  const currentQuestions = useMemo(() => 
    quiz.questions.filter(q => q.passageId === activeTab), 
    [quiz.questions, activeTab]
  );
  const currentTabState = quiz.tabStates[activeTab];

  if (quiz.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-xl flex flex-col items-center max-w-lg">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Đang soạn thảo 26 câu hỏi...</h2>
          <p className="text-slate-500 leading-relaxed">
            Hệ thống đang chuẩn bị 13 câu hỏi cho mỗi bài đọc. Đang hoàn thiện dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">IELTS Reading Tabs</h1>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">26 Questions Practice</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Tiến độ bài này</span>
              <span className="text-sm font-bold text-indigo-600">
                {Object.keys(currentTabState.userAnswers).length} / {currentQuestions.length} câu
              </span>
            </div>
            
            {!currentTabState.isSubmitted ? (
              <button
                onClick={() => handleSubmit(activeTab)}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center space-x-2"
              >
                <ClipboardCheck className="w-5 h-5" />
                <span>Nộp Bài</span>
              </button>
            ) : (
              <button
                onClick={() => resetPassage(activeTab)}
                className="bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-300 active:scale-95 transition-all flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Làm Lại Bài Này</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8">
            {READING_PASSAGES.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`
                  py-4 px-2 text-sm font-bold border-b-2 transition-all relative
                  ${activeTab === p.id 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'}
                `}
              >
                {p.title}
                {quiz.tabStates[p.id].isSubmitted && (
                  <span className="ml-2 bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full">
                    {calculateScore(p.id).toFixed(1)}/10
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Reading Passage */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden sticky top-36 h-[calc(100vh-180px)] flex flex-col">
            <div className="p-6 border-b bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" /> Nội Dung Bài Đọc
              </h2>
            </div>
            <div className="p-8 overflow-y-auto flex-grow">
              <h3 className="text-lg font-black text-indigo-900 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                {currentPassage.title}
              </h3>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-justify text-sm">
                {currentPassage.content}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Questions */}
        <div className="lg:col-span-7 space-y-8">
          
          {currentTabState.isSubmitted && (
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden mb-6">
              <div className="relative z-10 flex flex-col items-center text-center">
                <Award className="w-10 h-10 mb-4 text-yellow-300" />
                <h2 className="text-xl font-bold mb-1">Kết Quả Bài Làm</h2>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-6xl font-black">{calculateScore(activeTab).toFixed(1)}</span>
                  <span className="text-xl font-bold opacity-60">/ 10</span>
                </div>
                <p className="text-indigo-50 text-sm">
                  Bạn trả lời đúng <strong>{currentQuestions.filter(q => currentTabState.userAnswers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()).length}</strong> / {currentQuestions.length} câu.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {currentQuestions.map((q, qIdx) => {
              const userAnswer = currentTabState.userAnswers[q.id];
              const isCorrect = userAnswer?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();

              return (
                <div 
                  key={q.id} 
                  className={`
                    bg-white rounded-2xl shadow-sm border p-6 transition-all duration-300
                    ${currentTabState.isSubmitted 
                      ? (isCorrect ? 'border-green-200 bg-green-50/20' : 'border-red-200 bg-red-50/20') 
                      : 'border-slate-100 hover:border-indigo-100'}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs">
                      {qIdx + 1}
                    </span>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {q.type.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-slate-800 mb-4 leading-snug">
                        {q.question}
                      </p>
                      
                      {/* Interaction Area */}
                      <div className="space-y-2">
                        {q.options && q.options.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((option, optIdx) => (
                              <button
                                key={optIdx}
                                disabled={currentTabState.isSubmitted}
                                onClick={() => handleAnswer(q.id, option)}
                                className={`
                                  text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium
                                  ${userAnswer === option 
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-50' 
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50'}
                                  ${currentTabState.isSubmitted && userAnswer === option 
                                    ? (isCorrect ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') 
                                    : ''}
                                `}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="text"
                              disabled={currentTabState.isSubmitted}
                              placeholder="Nhập câu trả lời..."
                              value={userAnswer || ''}
                              onChange={(e) => handleAnswer(q.id, e.target.value)}
                              className={`
                                w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none text-sm font-medium
                                ${currentTabState.isSubmitted 
                                  ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                                  : 'border-slate-100 focus:border-indigo-500 focus:bg-white'}
                              `}
                            />
                            {currentTabState.isSubmitted && !isCorrect && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <AlertCircle className="w-4 h-4 text-red-400" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Feedback: Only Right/Wrong */}
                      {currentTabState.isSubmitted && (
                        <div className="mt-4 flex items-center animate-in fade-in slide-in-from-top-2">
                          {isCorrect ? (
                            <div className="flex items-center gap-1.5 text-green-700 bg-green-100/50 px-3 py-1.5 rounded-lg font-bold text-xs border border-green-200">
                              <CheckCircle className="w-3.5 h-3.5" /> Đúng
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-red-700 bg-red-100/50 px-3 py-1.5 rounded-lg font-bold text-xs border border-red-200">
                              <XCircle className="w-3.5 h-3.5" /> Sai
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-10 text-center">
        <p className="text-slate-400 text-xs font-medium">IELTS Intensive Training: 2 Bài - 26 Câu Hỏi - Chấm Điểm Riêng.</p>
      </footer>
    </div>
  );
};

export default App;
