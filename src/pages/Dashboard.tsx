import { useState, useRef, useEffect } from "react";
import { Activity, Heart, Droplet, Scale, AlertTriangle, Video, Calendar, MessageCircle, X, Play, Send, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Model3D from "../components/Model3D";
import { GoogleGenAI } from "@google/genai";

const healthData = [
  { time: "00:00", heartRate: 65, glucose: 90 },
  { time: "04:00", heartRate: 62, glucose: 85 },
  { time: "08:00", heartRate: 75, glucose: 110 },
  { time: "12:00", heartRate: 82, glucose: 125 },
  { time: "16:00", heartRate: 78, glucose: 105 },
  { time: "20:00", heartRate: 70, glucose: 95 },
  { time: "24:00", heartRate: 68, glucose: 92 },
];

const organInfo: Record<string, { name: string, status: string, desc: string }> = {
  brain: { name: "Não bộ", status: "Bình thường", desc: "Hoạt động thần kinh ổn định. Không có dấu hiệu căng thẳng quá mức." },
  heart: { name: "Tim", status: "Cảnh báo nhẹ", desc: "Nhịp tim có dấu hiệu tăng nhẹ trong 2 giờ qua. Khuyến nghị nghỉ ngơi." },
  lungs: { name: "Phổi", status: "Bình thường", desc: "Độ bão hòa oxy (SpO2) ở mức 98%. Hô hấp ổn định." },
  stomach: { name: "Dạ dày", status: "Bình thường", desc: "Tiêu hóa bình thường. Không phát hiện trào ngược." },
  liver: { name: "Gan", status: "Bình thường", desc: "Chức năng gan ổn định. Men gan trong giới hạn bình thường." },
  kidneys: { name: "Thận", status: "Bình thường", desc: "Chức năng lọc máu tốt. Lượng nước tiểu bình thường." },
  intestines: { name: "Ruột", status: "Cảnh báo nhẹ", desc: "Nhu động ruột hơi chậm. Khuyến nghị bổ sung thêm chất xơ và nước." }
};

export default function Dashboard() {
  const [healthStatus, setHealthStatus] = useState<"normal" | "warning" | "critical">("warning");
  const [showARModal, setShowARModal] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState<{name: string, type: 'chat' | 'calendar'} | null>(null);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<{sender: 'user' | 'doctor', text: string, time: string}[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showDoctorModal?.type === 'chat' && chatMessages.length === 0) {
      setChatMessages([
        { sender: 'doctor', text: `Chào bạn, tôi là ${showDoctorModal.name} (AI Assistant). Tôi có thể giúp gì cho bạn hôm nay?`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
      ]);
    }
  }, [showDoctorModal]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userText = currentMessage;
    const newUserMsg = { sender: 'user' as const, text: userText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setChatMessages(prev => [...prev, newUserMsg]);
    setCurrentMessage("");
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Build conversation history for context
      const historyText = chatMessages.map(m => `${m.sender === 'user' ? 'Bệnh nhân' : 'Bác sĩ'}: ${m.text}`).join('\n');
      const prompt = `Bạn là một bác sĩ AI tên là ${showDoctorModal?.name}. Bạn đang tư vấn sức khỏe cho bệnh nhân.
Lịch sử trò chuyện:
${historyText}
Bệnh nhân: ${userText}
Bác sĩ:`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "Bạn là một bác sĩ AI chuyên nghiệp, tận tâm và thấu hiểu. Hãy trả lời ngắn gọn, súc tích, đưa ra lời khuyên y tế cơ bản và luôn khuyên bệnh nhân đến cơ sở y tế nếu có triệu chứng nghiêm trọng. Trả lời bằng tiếng Việt.",
        }
      });

      const aiText = response.text || "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.";
      
      setChatMessages(prev => [...prev, { 
        sender: 'doctor', 
        text: aiText, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setChatMessages(prev => [...prev, { 
        sender: 'doctor', 
        text: "Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau.", 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Modals */}
      {showARModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center">
                <Video className="w-5 h-5 mr-2 text-emerald-600" />
                Hướng dẫn Sơ cứu AR
              </h3>
              <button onClick={() => {setShowARModal(false); setIsVideoPlaying(false);}} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="aspect-video bg-black relative flex items-center justify-center w-full">
              {!isVideoPlaying ? (
                <>
                  <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/ar/800/450')] opacity-50 bg-cover bg-center"></div>
                  <div className="relative z-10 text-center">
                    <button 
                      onClick={() => setIsVideoPlaying(true)}
                      className="w-16 h-16 rounded-full bg-emerald-600/80 backdrop-blur-md flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-emerald-500 transition-colors"
                    >
                      <Play className="w-8 h-8 text-white ml-1" />
                    </button>
                    <p className="text-white font-medium">Bấm để bắt đầu video hướng dẫn</p>
                  </div>
                </>
              ) : (
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/hizCbIWXMAQ?autoplay=1" 
                  title="CPR Training Video" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              )}
            </div>
            <div className="p-4 bg-slate-50">
              <p className="text-sm text-slate-600">Video hướng dẫn ép tim ngoài lồng ngực (CPR) chuẩn y khoa. Hãy làm theo nhịp điệu trong video.</p>
            </div>
          </div>
        </div>
      )}

      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {showDoctorModal.type === 'chat' ? 'Nhắn tin trực tiếp' : 'Đặt lịch khám'}
                </h3>
                <p className="text-xs text-slate-500">{showDoctorModal.name} (AI)</p>
              </div>
              <button onClick={() => setShowDoctorModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            {showDoctorModal.type === 'chat' ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 mx-1">{msg.time}</span>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex flex-col items-start">
                      <div className="max-w-[80%] p-3 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span className="text-sm text-slate-500">Bác sĩ đang trả lời...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={isTyping}
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50" 
                      placeholder="Nhập tin nhắn..." 
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={isTyping || !currentMessage.trim()}
                      className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 flex-1">
                <p className="text-slate-600 mb-4">Chọn thời gian để đặt lịch khám trực tuyến với bác sĩ.</p>
                <input type="datetime-local" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                <button onClick={() => {
                  alert("Đã đặt lịch thành công!");
                  setShowDoctorModal(null);
                }} className="w-full mt-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors">
                  Xác nhận đặt lịch
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bio-Digital Twin</h1>
          <p className="text-sm text-slate-500 mt-1">Bản sao số & Định hướng Y khoa</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <span className="w-2 h-2 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Đồng bộ IoT: Đang hoạt động
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Model Placeholder */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white z-0"></div>
          <div className="relative z-10 w-full h-full flex flex-col">
            <div className="flex-1 w-full h-full relative">
              <Model3D healthStatus={healthStatus} onPartClick={setSelectedOrgan} />
              
              {/* Organ Info Overlay */}
              {selectedOrgan && organInfo[selectedOrgan] && (
                <div className="absolute top-4 right-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 animate-in fade-in slide-in-from-top-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900">{organInfo[selectedOrgan].name}</h4>
                    <button onClick={() => setSelectedOrgan(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                    organInfo[selectedOrgan].status.includes("Cảnh báo") ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {organInfo[selectedOrgan].status}
                  </span>
                  <p className="text-sm text-slate-600">{organInfo[selectedOrgan].desc}</p>
                </div>
              )}
            </div>
            <div className="p-4 text-center bg-white/80 backdrop-blur-sm border-t border-slate-100 absolute bottom-0 w-full">
              <h3 className="text-lg font-semibold text-slate-900">Mô hình 3D Cơ thể</h3>
              <p className="text-sm text-slate-500 mb-3">Phản ánh sức khỏe thời gian thực. Click vào các cơ quan để xem chi tiết.</p>
              <div className="flex justify-center gap-2 flex-wrap">
                <button onClick={() => setHealthStatus("normal")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${healthStatus === "normal" ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Bình thường</button>
                <button onClick={() => setHealthStatus("warning")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${healthStatus === "warning" ? "bg-amber-100 text-amber-700 ring-1 ring-amber-500" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Cảnh báo</button>
                <button onClick={() => setHealthStatus("critical")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${healthStatus === "critical" ? "bg-rose-100 text-rose-700 ring-1 ring-rose-500" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Nguy hiểm</button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <Heart className="w-5 h-5 text-rose-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Nhịp tim</span>
                </div>
                <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">+2%</span>
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">72</span>
                <span className="ml-1 text-sm text-slate-500">bpm</span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Droplet className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Đường huyết</span>
                </div>
                <span className="text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-full">Ổn định</span>
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">95</span>
                <span className="ml-1 text-sm text-slate-500">mg/dL</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Scale className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">BMI</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">21.5</span>
                <span className="ml-1 text-sm text-slate-500">Bình thường</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Biến thiên sinh học 24h</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="heartRate" stroke="#e11d48" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Nhịp tim" />
                  <Line yAxisId="right" type="monotone" dataKey="glucose" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Đường huyết" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Early Warning & First Aid */}
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900">Cảnh báo sớm (Early Warning)</h3>
              <p className="text-sm text-amber-700 mt-1">Nhịp tim có dấu hiệu tăng nhẹ trong 2 giờ qua. Khuyến nghị nghỉ ngơi.</p>
              
              <div className="mt-4 bg-white rounded-xl p-4 border border-amber-100 shadow-sm">
                <h4 className="text-sm font-medium text-slate-900 flex items-center">
                  <Video className="w-4 h-4 mr-2 text-slate-500" />
                  Quy trình sơ cứu chuẩn y khoa (AR/Video)
                </h4>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></span>
                    Bài tập thở sâu giảm nhịp tim (3 phút)
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></span>
                    Tư thế ngồi chuẩn khi tim đập nhanh
                  </li>
                </ul>
                <button onClick={() => setShowARModal(true)} className="mt-3 w-full py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors">
                  Mở hướng dẫn AR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Doctors */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Cầu nối Bác sĩ (Verified Doctors)</h3>
            <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">AI Đề xuất</span>
          </div>
          <p className="text-sm text-slate-500 mb-4">Dựa trên phân tích Bản sao số, AI đề xuất chuyên khoa Tim mạch & Nội tiết.</p>
          
          <div className="space-y-3">
            {[
              { name: "PGS.TS Nguyễn Văn A", spec: "Chuyên khoa Tim mạch", exp: "20 năm kinh nghiệm", avatar: "https://picsum.photos/seed/doc1/100/100" },
              { name: "ThS.BS Trần Thị B", spec: "Chuyên khoa Nội tiết", exp: "15 năm kinh nghiệm", avatar: "https://picsum.photos/seed/doc2/100/100" }
            ].map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <img src={doc.avatar} alt={doc.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">{doc.name}</h4>
                    <p className="text-xs text-slate-500">{doc.spec} • {doc.exp}</p>
                  </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setShowDoctorModal({name: doc.name, type: 'chat'})} className="p-2 bg-white text-slate-600 rounded-lg shadow-sm hover:text-emerald-600">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowDoctorModal({name: doc.name, type: 'calendar'})} className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700">
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
