import { useState } from "react";
import { BrainCircuit, Search, GitMerge, Target, BookOpen, ChevronRight, Zap } from "lucide-react";
import { cn } from "../lib/utils";

export default function KnowledgeSynthesis() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMindmap, setShowMindmap] = useState(false);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Synthesis</h1>
          <p className="text-sm text-slate-500 mt-1">Hệ thống hóa Kiến thức Khổng lồ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Search & Atomic Learning */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-amber-500" />
              Atomic Learning
            </h3>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Nhập hạt nhân kiến thức (VD: Hormone Insulin)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            
            <button 
              onClick={() => setShowMindmap(true)}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center"
            >
              <GitMerge className="w-4 h-4 mr-2" />
              Tạo Dynamic Mindmap
            </button>
          </div>

          {/* Personalized Syllabus */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-500" />
              Personalized Syllabus
            </h3>
            <div className="space-y-4">
              <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-md">Mục tiêu: Thi HSG Quốc gia</span>
                  <span className="text-xs text-blue-600 font-medium">Hoàn thành 45%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5 mb-4"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: '45%'}}></div></div>
                
                <div className="space-y-3">
                  {[
                    { title: "Sinh lý học thực vật", status: "completed" },
                    { title: "Di truyền học phân tử", status: "current" },
                    { title: "Sinh thái học quần thể", status: "locked" },
                  ].map((item, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-between p-3 rounded-lg border text-sm transition-colors",
                      item.status === "completed" ? "bg-white border-emerald-200 text-slate-700" :
                      item.status === "current" ? "bg-blue-50 border-blue-200 text-blue-900 font-medium shadow-sm ring-1 ring-blue-500/20" :
                      "bg-slate-50 border-slate-100 text-slate-400"
                    )}>
                      <div className="flex items-center">
                        {item.status === "completed" && <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></div>}
                        {item.status === "current" && <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 animate-pulse"></div>}
                        {item.status === "locked" && <div className="w-2 h-2 rounded-full bg-slate-300 mr-3"></div>}
                        {item.title}
                      </div>
                      {item.status === "current" && <ChevronRight className="w-4 h-4 text-blue-500" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Mindmap Area */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl shadow-sm border border-slate-800 relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="p-4 border-b border-slate-800 flex items-center justify-between relative z-10 bg-slate-900/80 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-slate-300 flex items-center">
              <BrainCircuit className="w-4 h-4 mr-2 text-emerald-400" />
              Dynamic Mindmap Viewer
            </h3>
            {showMindmap && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                AI Generated
              </span>
            )}
          </div>

          <div className="flex-1 relative flex items-center justify-center p-8">
            {!showMindmap ? (
              <div className="text-center text-slate-500">
                <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Nhập từ khóa và tạo sơ đồ tư duy để bắt đầu học tập nguyên tử.</p>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Center Node */}
                <div className="absolute z-20 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400">
                  Hormone Insulin
                </div>

                {/* Connecting Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                  <path d="M 50% 50% L 25% 25%" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                  <path d="M 50% 50% L 75% 25%" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                  <path d="M 50% 50% L 50% 80%" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                </svg>

                {/* Child Nodes */}
                <div className="absolute top-[20%] left-[20%] z-10 px-4 py-2 bg-slate-800 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-slate-700 transition-colors cursor-pointer shadow-lg">
                  Cơ chế vận chuyển qua màng
                </div>
                <div className="absolute top-[20%] right-[20%] z-10 px-4 py-2 bg-slate-800 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-slate-700 transition-colors cursor-pointer shadow-lg">
                  Bệnh tiểu đường Type 1 & 2
                </div>
                <div className="absolute bottom-[15%] left-[50%] -translate-x-1/2 z-10 px-4 py-2 bg-slate-800 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-slate-700 transition-colors cursor-pointer shadow-lg">
                  Cấu trúc Protein (Chuỗi A, B)
                </div>

                {/* Floating particles */}
                <div className="absolute top-[35%] left-[35%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-ping"></div>
                <div className="absolute top-[35%] right-[35%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-ping" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute bottom-[35%] left-[50%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-ping" style={{animationDelay: '1s'}}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
