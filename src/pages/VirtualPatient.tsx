import { useState, useEffect, useRef } from "react";
import { Stethoscope, FileText, Activity, AlertTriangle, Play, ChevronRight, CheckCircle, XCircle, MessageSquare, Send, Save, Image as ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";

type ChatMessage = {
  role: "user" | "patient" | "system";
  content: string;
};

type PatientRecord = {
  id: string;
  date: string;
  patientInfo: string;
  diagnosis: string;
  feedback: string;
};

export default function VirtualPatient() {
  const [scenarioStarted, setScenarioStarted] = useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  
  const [testsOrdered, setTestsOrdered] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  
  const [diagnosis, setDiagnosis] = useState("");
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);
  const [aiEvaluation, setAiEvaluation] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [savedRecords, setSavedRecords] = useState<PatientRecord[]>(() => {
    const saved = localStorage.getItem("virtualPatientRecords");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<"clinical" | "imaging">("clinical");
  const [imageUrl, setImageUrl] = useState("");
  const [imageDiagnosis, setImageDiagnosis] = useState("");
  const [imageFeedback, setImageFeedback] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    localStorage.setItem("virtualPatientRecords", JSON.stringify(savedRecords));
  }, [savedRecords]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleGenerateScenario = async () => {
    setIsGeneratingScenario(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Tạo một ca lâm sàng ngẫu nhiên cho sinh viên y khoa.
Trả về ĐÚNG định dạng JSON sau:
{
  "name": "Tên bệnh nhân (VD: Nguyễn Văn A)",
  "age": 45,
  "gender": "Nam",
  "reason": "Lý do vào viện",
  "history": "Bệnh sử chi tiết",
  "pastHistory": "Tiền sử bệnh",
  "vitals": {
    "hr": "Nhịp tim",
    "bp": "Huyết áp",
    "spo2": "SpO2",
    "temp": "Nhiệt độ"
  },
  "actualDisease": "Tên bệnh lý thực sự (ẩn với người dùng)",
  "systemPrompt": "Prompt để đóng vai bệnh nhân này khi chat (VD: Bạn là bệnh nhân nam 45 tuổi, đang bị đau bụng...)"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text?.replace(/```json/gi, '')?.replace(/```/g, '')?.trim() || "{}";
      const data = JSON.parse(text);
      setPatientData(data);
      setScenarioStarted(true);
      setTestsOrdered([]);
      setTestResults({});
      setDiagnosis("");
      setFeedback(null);
      setAiEvaluation("");
      setChatMessages([
        { role: "system", content: "Bạn có thể bắt đầu trò chuyện với bệnh nhân để khai thác thêm triệu chứng." }
      ]);
    } catch (error) {
      console.error("Error generating scenario:", error);
      alert("Lỗi khi tạo ca lâm sàng.");
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const handleOrderTest = async (test: string) => {
    if (testsOrdered.includes(test)) return;
    
    setTestsOrdered([...testsOrdered, test]);
    setIsGeneratingTest(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Bệnh nhân: ${patientData.name}, Tuổi: ${patientData.age}, Bệnh lý thực sự: ${patientData.actualDisease}.
Bác sĩ vừa chỉ định xét nghiệm: ${test}.
Hãy trả về kết quả xét nghiệm này một cách chân thực, phù hợp với bệnh lý thực sự của bệnh nhân.
Trả về đoạn văn bản ngắn gọn mô tả kết quả.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setTestResults(prev => ({ ...prev, [test]: response.text || "Không có kết quả." }));
    } catch (error) {
      console.error("Error generating test result:", error);
      setTestResults(prev => ({ ...prev, [test]: "Lỗi khi lấy kết quả xét nghiệm." }));
    } finally {
      setIsGeneratingTest(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !patientData) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setIsChatting(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const history = chatMessages.filter(m => m.role !== "system").map(m => `${m.role === 'user' ? 'Bác sĩ' : 'Bệnh nhân'}: ${m.content}`).join("\n");
      
      const prompt = `Bạn đang đóng vai bệnh nhân ảo.
Thông tin của bạn: ${patientData.systemPrompt}
Lịch sử trò chuyện:
${history}
Bác sĩ: ${userMsg}
Bệnh nhân (bạn):`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setChatMessages(prev => [...prev, { role: "patient", content: response.text || "..." }]);
    } catch (error) {
      console.error("Error chatting:", error);
    } finally {
      setIsChatting(false);
    }
  };

  const handleSubmitDiagnosis = async () => {
    if (!diagnosis.trim() || !patientData) return;
    setIsEvaluating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Bệnh lý thực sự của bệnh nhân là: ${patientData.actualDisease}.
Chẩn đoán của người dùng (bác sĩ) là: ${diagnosis}.
Hãy đánh giá xem chẩn đoán này có đúng hay không.
Trả về ĐÚNG định dạng JSON sau:
{
  "isCorrect": true/false,
  "evaluation": "Đoạn văn đánh giá chi tiết, giải thích tại sao đúng/sai, đưa ra phác đồ điều trị chuẩn và TRÍCH DẪN NGUỒN UY TÍN (VD: Theo hướng dẫn của Bộ Y tế, Harrison's Principles of Internal Medicine...)"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text?.replace(/```json/gi, '')?.replace(/```/g, '')?.trim() || "{}";
      const data = JSON.parse(text);
      setFeedback(data.isCorrect ? "success" : "error");
      setAiEvaluation(data.evaluation);
    } catch (error) {
      console.error("Error evaluating diagnosis:", error);
      alert("Lỗi khi đánh giá chẩn đoán.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveRecord = () => {
    if (!patientData || !diagnosis) return;
    const newRecord: PatientRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('vi-VN'),
      patientInfo: `${patientData.name} - ${patientData.age} tuổi - ${patientData.gender}`,
      diagnosis: diagnosis,
      feedback: feedback === "success" ? "Chính xác" : "Chưa chính xác"
    };
    setSavedRecords([newRecord, ...savedRecords]);
    alert("Đã lưu hồ sơ bệnh án!");
  };

  const handleGenerateImageCase = async () => {
    setIsGeneratingImage(true);
    setImageDiagnosis("");
    setImageFeedback("");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      // We use a prompt to get a medical image URL and its diagnosis.
      
      const prompt = `Tìm một hình ảnh y khoa thực tế (X-quang, MRI, CT, hoặc hình ảnh lâm sàng) từ một nguồn công khai (như Wikimedia Commons).
Trả về ĐÚNG định dạng JSON:
{
  "imageUrl": "URL trực tiếp đến hình ảnh (phải hợp lệ và hiển thị được)",
  "actualDiagnosis": "Chẩn đoán chính xác của hình ảnh này",
  "description": "Mô tả ngắn gọn về hình ảnh để gợi ý cho người dùng"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text?.replace(/```json/gi, '')?.replace(/```/g, '')?.trim() || "{}";
      const data = JSON.parse(text);
      // Fallback if AI fails to provide a good URL
      setImageUrl(data.imageUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Pneumonia_x-ray.jpg/800px-Pneumonia_x-ray.jpg");
      
      // Let's store the actual diagnosis in a data attribute or state
      (window as any).currentImageDiagnosis = data.actualDiagnosis || "Viêm phổi";
      
    } catch (error) {
      console.error("Error generating image case:", error);
      // Fallback
      setImageUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Pneumonia_x-ray.jpg/800px-Pneumonia_x-ray.jpg");
      (window as any).currentImageDiagnosis = "Viêm phổi";
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleEvaluateImage = async () => {
    if (!imageDiagnosis.trim()) return;
    setIsEvaluating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const actual = (window as any).currentImageDiagnosis || "Viêm phổi";
      const prompt = `Chẩn đoán thực sự của hình ảnh là: ${actual}.
Người dùng chẩn đoán là: ${imageDiagnosis}.
Hãy đánh giá xem đúng hay sai và giải thích ngắn gọn.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setImageFeedback(response.text || "Đã ghi nhận.");
    } catch (error) {
      console.error("Error evaluating image:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Virtual Patient Simulator</h1>
          <p className="text-sm text-slate-500 mt-1">Giả lập Bệnh nhân ảo - Dành riêng cho Y sinh</p>
        </div>
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("clinical")}
            className={cn("px-4 py-2 rounded-md text-sm font-medium transition-colors", activeTab === "clinical" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:bg-slate-200")}
          >
            Ca Lâm Sàng
          </button>
          <button
            onClick={() => setActiveTab("imaging")}
            className={cn("px-4 py-2 rounded-md text-sm font-medium transition-colors", activeTab === "imaging" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:bg-slate-200")}
          >
            Chẩn đoán Hình ảnh
          </button>
        </div>
      </div>

      {activeTab === "clinical" && (
        !scenarioStarted ? (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 shadow-inner">
              <Stethoscope className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Bắt đầu Ca lâm sàng mới</h2>
            <p className="text-slate-500 max-w-lg mb-8">
              AI sẽ tạo ra một kịch bản bệnh nhân với các biến số ngẫu nhiên. Bạn có thể trò chuyện, chỉ định xét nghiệm và đưa ra chẩn đoán.
            </p>
            
            <button 
              onClick={handleGenerateScenario}
              disabled={isGeneratingScenario}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-md flex items-center disabled:opacity-50"
            >
              {isGeneratingScenario ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2" />}
              {isGeneratingScenario ? "Đang tạo bệnh nhân..." : "Khởi tạo Bệnh nhân ảo"}
            </button>

            {savedRecords.length > 0 && (
              <div className="mt-12 w-full max-w-3xl text-left">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <Save className="w-5 h-5 mr-2 text-slate-500" />
                  Hồ sơ bệnh án đã lưu
                </h3>
                <div className="space-y-3">
                  {savedRecords.map(record => (
                    <div key={record.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-900">{record.patientInfo}</p>
                        <p className="text-sm text-slate-500">Chẩn đoán: {record.diagnosis}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", record.feedback === "Chính xác" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                          {record.feedback}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">{record.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Info & Chat */}
            <div className="lg:col-span-1 space-y-6 flex flex-col h-[calc(100vh-12rem)]">
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-emerald-400" />
                    Monitor Sinh tồn
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <span className="text-xs text-slate-400">Nhịp tim (HR)</span>
                    <div className="text-2xl font-mono font-bold mt-1 text-emerald-400">{patientData?.vitals?.hr}</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <span className="text-xs text-slate-400">Huyết áp (BP)</span>
                    <div className="text-2xl font-mono font-bold mt-1 text-emerald-400">{patientData?.vitals?.bp}</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <span className="text-xs text-slate-400">SpO2</span>
                    <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{patientData?.vitals?.spo2}</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <span className="text-xs text-slate-400">Nhiệt độ</span>
                    <div className="text-2xl font-mono font-bold text-amber-400 mt-1">{patientData?.vitals?.temp}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                  Trò chuyện với Bệnh nhân
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-50 rounded-lg mb-3">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                        msg.role === "user" ? "bg-emerald-600 text-white rounded-tr-none" : 
                        msg.role === "system" ? "bg-slate-200 text-slate-600 text-xs text-center w-full mx-auto" :
                        "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Hỏi bệnh nhân..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isChatting || !chatInput.trim()}
                    className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Area */}
            <div className="lg:col-span-2 space-y-6 overflow-y-auto h-[calc(100vh-12rem)] pr-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Hồ sơ Bệnh án</h3>
                  <button onClick={() => setScenarioStarted(false)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center">
                    <RefreshCw className="w-4 h-4 mr-1" /> Đổi ca khác
                  </button>
                </div>
                <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div><span className="font-medium text-slate-700">Bệnh nhân:</span> {patientData?.name}, {patientData?.gender}, {patientData?.age} tuổi</div>
                  <div><span className="font-medium text-slate-700">Lý do vào viện:</span> {patientData?.reason}</div>
                  <div><span className="font-medium text-slate-700">Bệnh sử:</span> {patientData?.history}</div>
                  <div><span className="font-medium text-slate-700">Tiền sử:</span> {patientData?.pastHistory}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">1. Chỉ định Cận lâm sàng</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Công thức máu (CBC)", "Siêu âm ổ bụng", "X-quang ngực", "CT Scanner", "Sinh hóa máu", "Điện tâm đồ (ECG)"].map((test) => (
                    <button
                      key={test}
                      onClick={() => handleOrderTest(test)}
                      disabled={testsOrdered.includes(test) || isGeneratingTest}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                        testsOrdered.includes(test)
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      )}
                    >
                      {testsOrdered.includes(test) ? "Đã chỉ định" : `+ ${test}`}
                    </button>
                  ))}
                </div>

                {testsOrdered.length > 0 && (
                  <div className="space-y-4 border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-medium text-slate-700 flex items-center">
                      Kết quả trả về:
                      {isGeneratingTest && <Loader2 className="w-4 h-4 ml-2 animate-spin text-emerald-500" />}
                    </h4>
                    {testsOrdered.map(test => (
                      <div key={test} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                        <strong className="text-slate-900">{test}:</strong> {testResults[test] || "Đang phân tích..."}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">2. Chẩn đoán & Phác đồ</h3>
                <div className="space-y-4">
                  <textarea
                    placeholder="Nhập chẩn đoán xác định và hướng xử trí..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[100px]"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSubmitDiagnosis}
                      disabled={isEvaluating || !diagnosis.trim()}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
                    >
                      {isEvaluating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                      {isEvaluating ? "Đang đánh giá..." : "Gửi Chẩn đoán cho AI Đánh giá"}
                    </button>
                    {feedback && (
                      <button
                        onClick={handleSaveRecord}
                        className="px-4 py-3 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center"
                        title="Lưu hồ sơ"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {feedback && (
                  <div className={cn(
                    "mt-6 p-6 rounded-xl border",
                    feedback === "success" ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                  )}>
                    <div className="flex items-start space-x-3 mb-4">
                      {feedback === "success" ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                      )}
                      <div>
                        <h4 className={cn("text-base font-bold", feedback === "success" ? "text-emerald-900" : "text-rose-900")}>
                          {feedback === "success" ? "Chẩn đoán phù hợp!" : "Chẩn đoán cần xem xét lại!"}
                        </h4>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-700">
                      <Markdown>{aiEvaluation}</Markdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}

      {activeTab === "imaging" && (
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center">
          <div className="w-full max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <ImageIcon className="w-6 h-6 mr-2 text-blue-500" />
                Luyện tập Chẩn đoán Hình ảnh
              </h2>
              <button 
                onClick={handleGenerateImageCase}
                disabled={isGeneratingImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                {isGeneratingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Tạo ca hình ảnh mới
              </button>
            </div>

            {imageUrl ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-100 rounded-xl p-2 border border-slate-200 flex items-center justify-center min-h-[300px]">
                  <img src={imageUrl} alt="Medical Image" className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm" />
                </div>
                <div className="space-y-4 flex flex-col justify-center">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Chẩn đoán của bạn:</label>
                    <textarea
                      value={imageDiagnosis}
                      onChange={(e) => setImageDiagnosis(e.target.value)}
                      placeholder="Mô tả tổn thương và đưa ra chẩn đoán..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px]"
                    />
                  </div>
                  <button
                    onClick={handleEvaluateImage}
                    disabled={isEvaluating || !imageDiagnosis.trim()}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
                  >
                    {isEvaluating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                    Kiểm tra kết quả
                  </button>

                  {imageFeedback && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mt-4">
                      <h4 className="text-sm font-bold text-blue-900 mb-2">Đánh giá từ AI:</h4>
                      <div className="text-sm text-blue-800 prose prose-sm">
                        <Markdown>{imageFeedback}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Nhấn "Tạo ca hình ảnh mới" để AI tìm kiếm một hình ảnh y khoa cho bạn luyện tập.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
