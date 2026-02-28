import { useState } from "react";
import { Stethoscope, FileText, Activity, AlertTriangle, Play, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

export default function VirtualPatient() {
  const [scenarioStarted, setScenarioStarted] = useState(false);
  const [testsOrdered, setTestsOrdered] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);

  const handleOrderTest = (test: string) => {
    if (!testsOrdered.includes(test)) {
      setTestsOrdered([...testsOrdered, test]);
    }
  };

  const handleSubmitDiagnosis = () => {
    if (diagnosis.toLowerCase().includes("viêm ruột thừa")) {
      setFeedback("success");
    } else {
      setFeedback("error");
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Virtual Patient Simulator</h1>
          <p className="text-sm text-slate-500 mt-1">Giả lập Bệnh nhân ảo - Dành riêng cho Y sinh</p>
        </div>
      </div>

      {!scenarioStarted ? (
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 shadow-inner">
            <Stethoscope className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Bắt đầu Ca lâm sàng mới</h2>
          <p className="text-slate-500 max-w-lg mb-8">
            AI sẽ tạo ra một kịch bản bệnh nhân với các biến số ngẫu nhiên (tiền sử, triệu chứng, chỉ số sinh tồn). Bạn cần chỉ định xét nghiệm và đưa ra phác đồ điều trị.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-left">
              <Activity className="w-5 h-5 text-blue-500 mb-2" />
              <h3 className="font-medium text-slate-900 text-sm">Biến thiên liên tục</h3>
              <p className="text-xs text-slate-500 mt-1">Hàng ngàn kịch bản không lặp lại</p>
            </div>
            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-left">
              <FileText className="w-5 h-5 text-amber-500 mb-2" />
              <h3 className="font-medium text-slate-900 text-sm">Thực hành tư duy</h3>
              <p className="text-xs text-slate-500 mt-1">Chỉ định xét nghiệm, đọc kết quả ảo</p>
            </div>
            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-left">
              <AlertTriangle className="w-5 h-5 text-rose-500 mb-2" />
              <h3 className="font-medium text-slate-900 text-sm">Hệ quả tức thì</h3>
              <p className="text-xs text-slate-500 mt-1">Sai lầm dẫn đến suy giảm sinh tồn ảo</p>
            </div>
          </div>

          <button 
            onClick={() => setScenarioStarted(true)}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-md flex items-center"
          >
            <Play className="w-5 h-5 mr-2" />
            Khởi tạo Bệnh nhân ảo
          </button>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info & Vitals */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-emerald-400" />
                  Monitor Sinh tồn
                </h3>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400">Nhịp tim (HR)</span>
                  <div className={cn("text-2xl font-mono font-bold mt-1", feedback === "error" ? "text-rose-400 animate-pulse" : "text-emerald-400")}>
                    {feedback === "error" ? "115" : "98"}
                  </div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400">Huyết áp (BP)</span>
                  <div className={cn("text-2xl font-mono font-bold mt-1", feedback === "error" ? "text-rose-400" : "text-emerald-400")}>
                    {feedback === "error" ? "90/60" : "110/70"}
                  </div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400">SpO2</span>
                  <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">98%</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400">Nhiệt độ</span>
                  <div className="text-2xl font-mono font-bold text-amber-400 mt-1">38.5°C</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Hồ sơ Bệnh án</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Bệnh nhân:</span> Nam, 24 tuổi
                </div>
                <div>
                  <span className="font-medium text-slate-700">Lý do vào viện:</span> Đau bụng vùng hố chậu phải
                </div>
                <div>
                  <span className="font-medium text-slate-700">Bệnh sử:</span> Cách nhập viện 12 giờ, bệnh nhân đột ngột đau âm ỉ vùng quanh rốn, sau đó khu trú về hố chậu phải. Đau tăng khi vận động. Kèm buồn nôn, không nôn. Sốt nhẹ.
                </div>
                <div>
                  <span className="font-medium text-slate-700">Tiền sử:</span> Chưa ghi nhận bệnh lý nội/ngoại khoa.
                </div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">1. Chỉ định Cận lâm sàng</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Công thức máu (CBC)", "Siêu âm ổ bụng", "X-quang bụng đứng", "CT Scanner", "Sinh hóa máu"].map((test) => (
                  <button
                    key={test}
                    onClick={() => handleOrderTest(test)}
                    disabled={testsOrdered.includes(test)}
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
                  <h4 className="text-sm font-medium text-slate-700">Kết quả trả về (AI Generated):</h4>
                  {testsOrdered.includes("Công thức máu (CBC)") && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                      <strong className="text-slate-900">CBC:</strong> Bạch cầu (WBC) tăng cao 15.000/mm3, Neutrophil chiếm 85%. Hồng cầu, tiểu cầu bình thường.
                    </div>
                  )}
                  {testsOrdered.includes("Siêu âm ổ bụng") && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                      <strong className="text-slate-900">Siêu âm:</strong> Hình ảnh ruột thừa đường kính 8mm, ấn không xẹp, thâm nhiễm mỡ xung quanh. Có ít dịch hố chậu phải.
                    </div>
                  )}
                  {testsOrdered.includes("X-quang bụng đứng") && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                      <strong className="text-slate-900">X-quang:</strong> Không thấy liềm hơi dưới cơ hoành. Không thấy mức nước hơi.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">2. Chẩn đoán & Phác đồ</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nhập chẩn đoán xác định (VD: Viêm ruột thừa cấp)..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  onClick={handleSubmitDiagnosis}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Xác nhận Chẩn đoán & Chuyển điều trị
                </button>
              </div>

              {feedback && (
                <div className={cn(
                  "mt-6 p-4 rounded-xl border flex items-start space-x-3",
                  feedback === "success" ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                )}>
                  {feedback === "success" ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className={cn("text-sm font-bold", feedback === "success" ? "text-emerald-900" : "text-rose-900")}>
                      {feedback === "success" ? "Chẩn đoán chính xác!" : "Chẩn đoán chưa phù hợp!"}
                    </h4>
                    <p className={cn("text-sm mt-1", feedback === "success" ? "text-emerald-700" : "text-rose-700")}>
                      {feedback === "success" 
                        ? "Bệnh nhân được chuyển mổ cấp cứu nội soi cắt ruột thừa. Tiên lượng tốt." 
                        : "Bệnh nhân ảo đang có dấu hiệu suy giảm sinh tồn (Nhịp tim tăng, HA giảm). Hãy xem kỹ lại kết quả Siêu âm và Công thức máu để chẩn đoán lại!"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
