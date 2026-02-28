import { useState } from "react";
import { BookOpen, Clock, Play, FileText, CheckCircle, AlertTriangle, FileBarChart, Lock } from "lucide-react";
import { cn } from "../lib/utils";

export default function ExamSimulator() {
  const [examMode, setExamMode] = useState<"list" | "real-exam" | "report">("list");

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Exam-Solver & Simulator</h1>
          <p className="text-sm text-slate-500 mt-1">Hệ thống Khảo thí Thông minh Y sinh</p>
        </div>
      </div>

      {examMode === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Đề thi HSG Quốc gia Sinh học 2023", type: "HSG", time: "180 phút", questions: 50 },
            { title: "Đề thi Nội trú Y khoa - Nội khoa", type: "Nội trú", time: "120 phút", questions: 100 },
            { title: "Olympic Sinh học Quốc tế (IBO) 2022", type: "Olympic", time: "240 phút", questions: 80 },
            { title: "Đề thi Đại học môn Sinh 2023", type: "Đại học", time: "50 phút", questions: 40 },
          ].map((exam, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                  {exam.type}
                </span>
                <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">{exam.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-slate-500 mb-6">
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {exam.time}</span>
                <span className="flex items-center"><FileText className="w-4 h-4 mr-1.5" /> {exam.questions} câu</span>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setExamMode("real-exam")}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Real-Exam
                </button>
                <button 
                  onClick={() => setExamMode("report")}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Luyện tập
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {examMode === "real-exam" && (
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-medium text-slate-700">Chế độ Real-Exam (Đã khóa tab)</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <Clock className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="text-lg font-mono font-bold text-slate-900">179:58</span>
            </div>
            <button 
              onClick={() => setExamMode("report")}
              className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-200 transition-colors"
            >
              Nộp bài
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-slate-900 flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center mr-3 font-bold">1</span>
                    Trong quá trình dịch mã, kháng sinh Tetracycline gắn vào tiểu phần 30S của ribosome vi khuẩn. Cơ chế tác động chính của nó là gì?
                  </h2>
                  <div className="space-y-3 pl-11">
                    {["Ngăn cản sự gắn của aminoacyl-tRNA vào vị trí A", "Ức chế enzyme peptidyl transferase", "Gây đọc sai mã di truyền", "Ngăn cản sự di chuyển của ribosome trên mRNA"].map((ans, i) => (
                      <label key={i} className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <input type="radio" name="q1" className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500" />
                        <span className="ml-3 text-slate-700">{ans}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-slate-900 flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center mr-3 font-bold">2</span>
                    Trình bày cơ chế bệnh sinh của đái tháo đường type 1 và type 2. (Tự luận)
                  </h2>
                  <div className="pl-11">
                    <textarea 
                      className="w-full h-40 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                      placeholder="Nhập câu trả lời của bạn..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-64 border-l border-slate-100 bg-slate-50/50 p-4 overflow-y-auto hidden md:block">
              <h3 className="text-sm font-medium text-slate-900 mb-4">Danh sách câu hỏi</h3>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({length: 50}).map((_, i) => (
                  <button key={i} className={cn(
                    "w-8 h-8 rounded-md text-xs font-medium flex items-center justify-center border",
                    i === 0 ? "bg-emerald-100 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                  )}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {examMode === "report" && (
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Báo cáo Năng lực & AI Grader</h2>
              <p className="text-sm text-slate-500 mt-1">Đánh giá chi tiết từ AI</p>
            </div>
            <button 
              onClick={() => setExamMode("list")}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
              <span className="text-sm font-medium text-emerald-800">Điểm số</span>
              <div className="mt-2 text-4xl font-bold text-emerald-600">8.5<span className="text-xl text-emerald-400">/10</span></div>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
              <span className="text-sm font-medium text-blue-800">Thời gian hoàn thành</span>
              <div className="mt-2 text-4xl font-bold text-blue-600">142<span className="text-xl text-blue-400">p</span></div>
            </div>
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center">
              <span className="text-sm font-medium text-purple-800">Độ chính xác</span>
              <div className="mt-2 text-4xl font-bold text-purple-600">85<span className="text-xl text-purple-400">%</span></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 border border-slate-200 rounded-2xl">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <FileBarChart className="w-5 h-5 mr-2 text-emerald-600" />
                Phân tích Năng lực
              </h3>
              <p className="text-slate-700 mb-4">
                "Bạn mạnh về <strong className="text-emerald-600">Di truyền học phân tử</strong> (Đúng 95%), nhưng cần bổ sung kiến thức về <strong className="text-rose-600">Sinh lý người - Hệ nội tiết</strong> (Đúng 60%)."
              </p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">Di truyền học</span>
                    <span className="text-emerald-600 font-medium">95%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{width: '95%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">Tế bào học</span>
                    <span className="text-emerald-600 font-medium">85%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{width: '85%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">Sinh lý người</span>
                    <span className="text-rose-600 font-medium">60%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-rose-500 h-2 rounded-full" style={{width: '60%'}}></div></div>
                </div>
              </div>
            </div>

            <div className="p-6 border border-slate-200 rounded-2xl">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                AI Grader - Chấm điểm Tự luận
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl mb-4">
                <p className="text-sm font-medium text-slate-900 mb-2">Câu 2: Trình bày cơ chế bệnh sinh của đái tháo đường type 1 và type 2.</p>
                <p className="text-sm text-slate-600 italic">Bài làm của bạn: "Type 1 là do tuyến tụy không tiết insulin do bị phá hủy. Type 2 là do cơ thể kháng insulin..."</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">Đã nêu được ý chính: Type 1 (thiếu hụt insulin tuyệt đối), Type 2 (kháng insulin).</p>
                </div>
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">
                    <strong>Thiếu sót thuật ngữ chuyên môn:</strong> Cần bổ sung "tế bào beta đảo tụy bị phá hủy qua trung gian miễn dịch" cho Type 1, và "suy giảm chức năng tế bào beta tương đối" cho Type 2.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
