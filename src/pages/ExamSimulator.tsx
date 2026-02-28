import { useState, useRef, useEffect } from "react";
import { BookOpen, Clock, Award, FileText, Upload, MessageCircle, Send, Play, CheckCircle, XCircle, AlertCircle, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

type ExamMode = "select" | "solve" | "practice-config" | "practice-run" | "practice-report";

export default function ExamSimulator() {
  const [mode, setMode] = useState<ExamMode>("select");

  // --- Solve Exam State ---
  const [solveFile, setSolveFile] = useState<File | null>(null);
  const [solveText, setSolveText] = useState("");
  const [solveResult, setSolveResult] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [solveChat, setSolveChat] = useState<{sender: 'user'|'ai', text: string}[]>([]);
  const [solveChatInput, setSolveChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Practice Exam State ---
  const [practiceConfig, setPracticeConfig] = useState({
    timeLimit: 60,
    questionCount: 10,
    type: "multiple-choice", // multiple-choice, essay, mixed
    difficulty: "HSGQG" // Olympic, HSGQG, IBO, THPTQG
  });
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [practiceReport, setPracticeReport] = useState<any>(null);

  // Timer Effect
  useEffect(() => {
    let timer: any;
    if (mode === "practice-run" && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitPractice();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, timeRemaining]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [solveChat]);

  // --- Handlers for Solve Exam ---
  const handleSolveSubmit = async () => {
    if (!solveFile && !solveText.trim()) return;
    setIsSolving(true);
    setSolveResult(null);
    setSolveChat([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let contents: any = [];

      if (solveFile) {
        // Convert file to base64
        const reader = new FileReader();
        reader.readAsDataURL(solveFile);
        await new Promise((resolve) => (reader.onload = resolve));
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = solveFile.type;

        contents.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }

      if (solveText.trim()) {
        contents.push({ text: solveText });
      }

      contents.push({ text: "Hãy giải chi tiết bài tập/đề thi này. Giải thích từng bước rõ ràng, dễ hiểu." });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: contents },
        config: {
          systemInstruction: "Bạn là một giáo viên Sinh học xuất sắc. Hãy giải bài tập chi tiết, từng bước một, giải thích cặn kẽ lý do tại sao lại có kết quả đó. Trình bày bằng Markdown rõ ràng.",
        }
      });

      setSolveResult(response.text || "Không thể giải quyết yêu cầu này.");
      setSolveChat([{ sender: 'ai', text: "Tôi đã giải xong bài tập. Bạn có câu hỏi nào thêm không?" }]);
    } catch (error) {
      console.error(error);
      setSolveResult("Đã xảy ra lỗi khi giải đề. Vui lòng thử lại.");
    } finally {
      setIsSolving(false);
    }
  };

  const handleSolveChatSend = async () => {
    if (!solveChatInput.trim() || !solveResult) return;
    
    const userMsg = solveChatInput;
    setSolveChat(prev => [...prev, { sender: 'user', text: userMsg }]);
    setSolveChatInput("");
    setIsChatting(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const historyText = solveChat.map(m => `${m.sender === 'user' ? 'Học sinh' : 'Giáo viên'}: ${m.text}`).join('\n');
      
      const prompt = `Bạn là giáo viên Sinh học. Bạn vừa giải bài tập sau:
${solveResult}

Lịch sử trò chuyện:
${historyText}
Học sinh: ${userMsg}
Giáo viên:`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setSolveChat(prev => [...prev, { sender: 'ai', text: response.text || "Xin lỗi, tôi không hiểu ý bạn." }]);
    } catch (error) {
      setSolveChat(prev => [...prev, { sender: 'ai', text: "Đã xảy ra lỗi kết nối." }]);
    } finally {
      setIsChatting(false);
    }
  };

  // --- Handlers for Practice Exam ---
  const handleGeneratePractice = async () => {
    setIsGeneratingExam(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Tạo một đề thi Sinh học với các cấu hình sau:
- Số lượng câu hỏi: ${practiceConfig.questionCount}
- Loại câu hỏi: ${practiceConfig.type === 'multiple-choice' ? 'Trắc nghiệm (4 đáp án A, B, C, D)' : practiceConfig.type === 'essay' ? 'Tự luận' : 'Hỗn hợp (cả trắc nghiệm và tự luận)'}
- Độ khó: ${practiceConfig.difficulty} (Mức độ tương đương đề thi ${practiceConfig.difficulty} những năm gần đây)
- Yêu cầu: Kiến thức phải cập nhật, chính xác.

Trả về kết quả dưới dạng JSON với cấu trúc:
[
  {
    "id": 1,
    "type": "multiple-choice" hoặc "essay",
    "question": "Nội dung câu hỏi",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."] (nếu là trắc nghiệm, nếu tự luận thì để mảng rỗng),
    "correctAnswer": "A" (nếu trắc nghiệm) hoặc "Hướng dẫn chấm/Đáp án chi tiết" (nếu tự luận),
    "explanation": "Giải thích chi tiết tại sao đáp án đó đúng"
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const questions = JSON.parse(response.text || "[]");
      setPracticeQuestions(questions);
      setUserAnswers({});
      setCurrentQuestionIdx(0);
      setTimeRemaining(practiceConfig.timeLimit * 60);
      setMode("practice-run");
    } catch (error) {
      console.error("Error generating exam:", error);
      alert("Không thể tạo đề thi lúc này. Vui lòng thử lại.");
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const handleSubmitPractice = () => {
    let score = 0;
    let correctCount = 0;
    const totalMCQ = practiceQuestions.filter(q => q.type === 'multiple-choice').length;

    practiceQuestions.forEach((q, idx) => {
      if (q.type === 'multiple-choice') {
        const userAnswer = userAnswers[idx];
        // Extract just the letter (A, B, C, D) from the correct answer if it contains full text
        const correctLetter = q.correctAnswer.charAt(0);
        if (userAnswer === correctLetter) {
          correctCount++;
        }
      }
    });

    score = totalMCQ > 0 ? Math.round((correctCount / totalMCQ) * 100) : 0;

    setPracticeReport({
      score,
      correctCount,
      totalMCQ,
      timeSpent: practiceConfig.timeLimit * 60 - timeRemaining,
      questions: practiceQuestions,
      userAnswers
    });
    setMode("practice-report");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Exam Simulator</h1>
          <p className="text-sm text-slate-500 mt-1">Hệ thống Giải đề & Luyện thi Sinh học thông minh</p>
        </div>
        {mode !== "select" && (
          <button 
            onClick={() => setMode("select")}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Quay lại Menu
          </button>
        )}
      </div>

      {mode === "select" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div 
            onClick={() => setMode("solve")}
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Giải Đề (Solve Exam)</h2>
            <p className="text-slate-600 mb-4">Tải lên hình ảnh, file PDF hoặc nhập văn bản câu hỏi. AI sẽ phân tích và đưa ra lời giải chi tiết từng bước.</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Hỗ trợ PDF, PNG, JPG</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Giải thích cặn kẽ</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Chat trực tiếp với AI để hỏi thêm</li>
            </ul>
          </div>

          <div 
            onClick={() => setMode("practice-config")}
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:blue-300 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Luyện Đề (Practice Exam)</h2>
            <p className="text-slate-600 mb-4">Tạo đề thi tùy chỉnh dựa trên nguồn dữ liệu các kỳ thi lớn (Olympic, HSGQG, IBO). Thi thử với áp lực thời gian thực.</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Tùy chỉnh thời gian, số lượng</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Đa dạng độ khó (HSGQG, IBO...)</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Chấm điểm & Phân tích kết quả</li>
            </ul>
          </div>
        </div>
      )}

      {/* --- SOLVE EXAM MODE --- */}
      {mode === "solve" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-12rem)]">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Nhập câu hỏi / Đề thi</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Tải lên tệp (PDF, Hình ảnh)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                <input 
                  type="file" 
                  accept=".pdf,image/png,image/jpeg,image/jpg" 
                  onChange={(e) => setSolveFile(e.target.files?.[0] || null)}
                  className="hidden" 
                  id="file-upload" 
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600 font-medium">
                    {solveFile ? solveFile.name : "Nhấn để chọn tệp hoặc kéo thả vào đây"}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">Hỗ trợ: PDF, PNG, JPG, JPEG</span>
                </label>
              </div>
            </div>

            <div className="flex-1 flex flex-col mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Hoặc nhập văn bản câu hỏi</label>
              <textarea 
                value={solveText}
                onChange={(e) => setSolveText(e.target.value)}
                className="flex-1 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                placeholder="Nhập nội dung câu hỏi sinh học vào đây..."
              ></textarea>
            </div>

            <button 
              onClick={handleSolveSubmit}
              disabled={isSolving || (!solveFile && !solveText.trim())}
              className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isSolving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang giải...</> : "Giải Đề Ngay"}
            </button>
          </div>

          {/* Output & Chat Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
            {solveResult ? (
              <>
                <div className="flex-1 overflow-y-auto p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Lời giải chi tiết</h3>
                  <div className="prose prose-slate max-w-none text-sm whitespace-pre-wrap">
                    {solveResult}
                  </div>
                  
                  {/* Chat History */}
                  {solveChat.length > 1 && (
                    <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                      <h4 className="font-semibold text-slate-900 flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2" /> Thảo luận thêm
                      </h4>
                      {solveChat.slice(1).map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                      {isChatting && (
                        <div className="flex items-center text-slate-500 text-sm">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> AI đang trả lời...
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Chat Input */}
                <div className="p-4 bg-slate-50">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      value={solveChatInput}
                      onChange={(e) => setSolveChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSolveChatSend()}
                      disabled={isChatting}
                      placeholder="Hỏi thêm về lời giải này..."
                      className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <button 
                      onClick={handleSolveChatSend}
                      disabled={isChatting || !solveChatInput.trim()}
                      className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p>Lời giải chi tiết sẽ hiển thị ở đây sau khi bạn gửi yêu cầu.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PRACTICE CONFIG MODE --- */}
      {mode === "practice-config" && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Cấu hình Đề thi</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Thời gian làm bài (phút)</label>
              <input 
                type="number" 
                value={practiceConfig.timeLimit}
                onChange={(e) => setPracticeConfig({...practiceConfig, timeLimit: Number(e.target.value)})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Số lượng câu hỏi</label>
              <input 
                type="number" 
                value={practiceConfig.questionCount}
                onChange={(e) => setPracticeConfig({...practiceConfig, questionCount: Number(e.target.value)})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Loại câu hỏi</label>
              <select 
                value={practiceConfig.type}
                onChange={(e) => setPracticeConfig({...practiceConfig, type: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="multiple-choice">Trắc nghiệm</option>
                <option value="essay">Tự luận</option>
                <option value="mixed">Hỗn hợp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Độ khó / Nguồn đề</label>
              <select 
                value={practiceConfig.difficulty}
                onChange={(e) => setPracticeConfig({...practiceConfig, difficulty: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="THPTQG">THPT Quốc Gia</option>
                <option value="HSGQG">Học Sinh Giỏi Quốc Gia (HSGQG)</option>
                <option value="Olympic">Olympic Sinh học (KHTN, 30/4)</option>
                <option value="IBO">Olympic Sinh học Quốc tế (IBO)</option>
              </select>
            </div>

            <button 
              onClick={handleGeneratePractice}
              disabled={isGeneratingExam}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center text-lg"
            >
              {isGeneratingExam ? <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Đang tạo đề thi từ AI...</> : "Bắt đầu làm bài"}
            </button>
          </div>
        </div>
      )}

      {/* --- PRACTICE RUN MODE --- */}
      {mode === "practice-run" && (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
          {/* Left: Question Content */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Câu hỏi {currentQuestionIdx + 1} / {practiceQuestions.length}</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase tracking-wider">
                {practiceQuestions[currentQuestionIdx]?.type === 'multiple-choice' ? 'Trắc nghiệm' : 'Tự luận'}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="prose prose-slate max-w-none mb-8">
                <p className="text-lg font-medium text-slate-900 leading-relaxed">
                  {practiceQuestions[currentQuestionIdx]?.question}
                </p>
              </div>

              {practiceQuestions[currentQuestionIdx]?.type === 'multiple-choice' ? (
                <div className="space-y-3">
                  {practiceQuestions[currentQuestionIdx]?.options?.map((opt: string, i: number) => {
                    const letter = opt.charAt(0);
                    const isSelected = userAnswers[currentQuestionIdx] === letter;
                    return (
                      <div 
                        key={i}
                        onClick={() => setUserAnswers({...userAnswers, [currentQuestionIdx]: letter})}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-slate-800">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <textarea 
                  value={userAnswers[currentQuestionIdx] || ""}
                  onChange={(e) => setUserAnswers({...userAnswers, [currentQuestionIdx]: e.target.value})}
                  className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder="Nhập câu trả lời tự luận của bạn vào đây..."
                ></textarea>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex justify-between">
              <button 
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
                className="px-6 py-2 flex items-center text-slate-600 font-medium hover:bg-slate-100 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Trước
              </button>
              <button 
                onClick={() => setCurrentQuestionIdx(prev => Math.min(practiceQuestions.length - 1, prev + 1))}
                disabled={currentQuestionIdx === practiceQuestions.length - 1}
                className="px-6 py-2 flex items-center text-slate-600 font-medium hover:bg-slate-100 rounded-lg disabled:opacity-50"
              >
                Tiếp <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>

          {/* Right: Question List & Timer */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
              <div className="flex items-center justify-center text-slate-500 mb-2">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-medium uppercase tracking-wider text-sm">Thời gian còn lại</span>
              </div>
              <div className={`text-4xl font-mono font-bold ${timeRemaining < 300 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
              <h3 className="font-bold text-slate-900 mb-4">Danh sách câu hỏi</h3>
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-5 gap-2">
                  {practiceQuestions.map((_, idx) => {
                    const isAnswered = !!userAnswers[idx];
                    const isCurrent = currentQuestionIdx === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`w-10 h-10 rounded-lg font-medium text-sm flex items-center justify-center transition-all ${
                          isCurrent 
                            ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-100 text-blue-700' 
                            : isAnswered 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button 
                onClick={() => {
                  if(window.confirm("Bạn có chắc chắn muốn nộp bài?")) {
                    handleSubmitPractice();
                  }
                }}
                className="w-full mt-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Nộp Bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PRACTICE REPORT MODE --- */}
      {mode === "practice-report" && practiceReport && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
            <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Kết quả bài làm</h2>
            <div className="flex justify-center gap-8 mt-6">
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wider font-medium">Điểm Trắc nghiệm</p>
                <p className="text-4xl font-bold text-blue-600">{practiceReport.score}/100</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wider font-medium">Số câu đúng</p>
                <p className="text-4xl font-bold text-emerald-600">{practiceReport.correctCount}/{practiceReport.totalMCQ}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wider font-medium">Thời gian</p>
                <p className="text-4xl font-bold text-slate-700">{formatTime(practiceReport.timeSpent)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Chi tiết đáp án & Giải thích</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {practiceReport.questions.map((q: any, idx: number) => {
                const userAnswer = practiceReport.userAnswers[idx];
                const isMCQ = q.type === 'multiple-choice';
                const correctLetter = isMCQ ? q.correctAnswer.charAt(0) : null;
                const isCorrect = isMCQ && userAnswer === correctLetter;

                return (
                  <div key={idx} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        !isMCQ ? 'bg-slate-400' : isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 mb-4">{q.question}</p>
                        
                        {isMCQ ? (
                          <div className="space-y-2 mb-4">
                            {q.options.map((opt: string, i: number) => {
                              const letter = opt.charAt(0);
                              const isUserChoice = userAnswer === letter;
                              const isActualCorrect = correctLetter === letter;
                              
                              let bgClass = "bg-slate-50 border-slate-200";
                              if (isActualCorrect) bgClass = "bg-emerald-50 border-emerald-500 text-emerald-800 font-medium";
                              else if (isUserChoice && !isCorrect) bgClass = "bg-rose-50 border-rose-500 text-rose-800";

                              return (
                                <div key={i} className={`p-3 rounded-lg border ${bgClass}`}>
                                  {opt}
                                  {isActualCorrect && <CheckCircle className="w-4 h-4 inline ml-2 text-emerald-600" />}
                                  {isUserChoice && !isCorrect && <XCircle className="w-4 h-4 inline ml-2 text-rose-600" />}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mb-4 space-y-4">
                            <div>
                              <p className="text-sm font-medium text-slate-500 mb-1">Câu trả lời của bạn:</p>
                              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-wrap">
                                {userAnswer || <span className="text-slate-400 italic">Không có câu trả lời</span>}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-emerald-600 mb-1">Hướng dẫn chấm / Đáp án:</p>
                              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 whitespace-pre-wrap text-emerald-900">
                                {q.correctAnswer}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                          <p className="text-sm font-semibold text-blue-900 mb-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> Giải thích chi tiết:
                          </p>
                          <p className="text-sm text-blue-800 whitespace-pre-wrap">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
