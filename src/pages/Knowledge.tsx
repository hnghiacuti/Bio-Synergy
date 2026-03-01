import { useState, useEffect } from "react";
import { BrainCircuit, Search, GitMerge, Target, BookOpen, ChevronRight, Zap, Loader2, Save, Edit2, X, Check } from "lucide-react";
import { cn } from "../lib/utils";
import { GoogleGenAI } from "@google/genai";

type MindmapNode = {
  id: string;
  label: string;
  description: string;
  children?: MindmapNode[];
};

type SyllabusItem = {
  id: string;
  title: string;
  status: "locked" | "current" | "completed";
  progress: number;
};

const initialSyllabus: SyllabusItem[] = [
  { id: "1", title: "Sinh lý học thực vật", status: "completed", progress: 100 },
  { id: "2", title: "Di truyền học phân tử", status: "current", progress: 45 },
  { id: "3", title: "Sinh thái học quần thể", status: "locked", progress: 0 },
  { id: "4", title: "Tiến hóa", status: "locked", progress: 0 },
];

export default function KnowledgeSynthesis() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mindmapData, setMindmapData] = useState<MindmapNode | null>(() => {
    const saved = localStorage.getItem("savedMindmap");
    return saved ? JSON.parse(saved) : null;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(null);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [editNodeLabel, setEditNodeLabel] = useState("");
  const [editNodeDesc, setEditNodeDesc] = useState("");

  const [syllabus, setSyllabus] = useState<SyllabusItem[]>(() => {
    const saved = localStorage.getItem("savedSyllabus");
    return saved ? JSON.parse(saved) : initialSyllabus;
  });
  const [isUpdatingSyllabus, setIsUpdatingSyllabus] = useState(false);

  useEffect(() => {
    if (mindmapData) {
      localStorage.setItem("savedMindmap", JSON.stringify(mindmapData));
    }
  }, [mindmapData]);

  useEffect(() => {
    localStorage.setItem("savedSyllabus", JSON.stringify(syllabus));
  }, [syllabus]);

  const handleGenerateMindmap = async () => {
    if (!searchQuery.trim()) return;
    setIsGenerating(true);
    setSelectedNode(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Tạo một sơ đồ tư duy (mindmap) đơn giản về chủ đề: "${searchQuery}".
Trả về ĐÚNG định dạng JSON sau, không kèm markdown hay text thừa:
{
  "id": "root",
  "label": "Tên chủ đề chính",
  "description": "Mô tả ngắn gọn về chủ đề chính",
  "children": [
    {
      "id": "child_1",
      "label": "Nhánh 1",
      "description": "Mô tả nhánh 1"
    },
    {
      "id": "child_2",
      "label": "Nhánh 2",
      "description": "Mô tả nhánh 2"
    },
    {
      "id": "child_3",
      "label": "Nhánh 3",
      "description": "Mô tả nhánh 3"
    },
    {
      "id": "child_4",
      "label": "Nhánh 4",
      "description": "Mô tả nhánh 4"
    }
  ]
}
Chỉ tạo tối đa 4-5 nhánh con (children) để dễ hiển thị.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text?.replace(/```json/gi, '')?.replace(/```/g, '')?.trim() || "{}";
      const data = JSON.parse(text);
      if (data.id && data.label) {
        setMindmapData(data);
      }
    } catch (error) {
      console.error("Error generating mindmap:", error);
      alert("Có lỗi xảy ra khi tạo mindmap. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNodeClick = (node: MindmapNode) => {
    setSelectedNode(node);
    setIsEditingNode(false);
    setEditNodeLabel(node.label);
    setEditNodeDesc(node.description);
  };

  const handleSaveNodeEdit = () => {
    if (!selectedNode || !mindmapData) return;

    const updateNode = (currentNode: MindmapNode): MindmapNode => {
      if (currentNode.id === selectedNode.id) {
        return { ...currentNode, label: editNodeLabel, description: editNodeDesc };
      }
      if (currentNode.children) {
        return { ...currentNode, children: currentNode.children.map(updateNode) };
      }
      return currentNode;
    };

    const updatedMindmap = updateNode(mindmapData);
    setMindmapData(updatedMindmap);
    setSelectedNode({ ...selectedNode, label: editNodeLabel, description: editNodeDesc });
    setIsEditingNode(false);
  };

  const handleUpdateSyllabus = async () => {
    setIsUpdatingSyllabus(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const currentSyllabusStr = JSON.stringify(syllabus.map(s => ({ title: s.title, status: s.status, progress: s.progress })));
      const prompt = `Dựa trên tiến độ học tập hiện tại của học sinh: ${currentSyllabusStr}.
Hãy đóng vai trò là một gia sư AI, cập nhật tiến độ học tập một cách hợp lý (tăng progress của bài đang học, nếu đạt 100% thì chuyển sang completed và mở khóa bài tiếp theo). Hoặc thêm 1 chủ đề mới phù hợp để ôn thi HSG Quốc gia môn Sinh học.
Trả về ĐÚNG định dạng JSON mảng các chủ đề:
[
  { "id": "1", "title": "Tên bài", "status": "completed", "progress": 100 },
  { "id": "2", "title": "Tên bài", "status": "current", "progress": 75 },
  ...
]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text?.replace(/```json/gi, '')?.replace(/```/g, '')?.trim() || "[]";
      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0) {
        // Ensure IDs are strings
        const updatedData = data.map((item, index) => ({
          ...item,
          id: item.id ? String(item.id) : String(index + 1)
        }));
        setSyllabus(updatedData);
      }
    } catch (error) {
      console.error("Error updating syllabus:", error);
    } finally {
      setIsUpdatingSyllabus(false);
    }
  };

  const totalProgress = Math.round(syllabus.reduce((acc, curr) => acc + curr.progress, 0) / (syllabus.length || 1));

  return (
    <div className="space-y-6 h-full flex flex-col relative">
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
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateMindmap()}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            
            <button 
              onClick={handleGenerateMindmap}
              disabled={isGenerating || !searchQuery.trim()}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitMerge className="w-4 h-4 mr-2" />}
              {isGenerating ? "Đang tạo Mindmap..." : "Tạo Dynamic Mindmap"}
            </button>
          </div>

          {/* Personalized Syllabus */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-500" />
                Personalized Syllabus
              </h3>
              <button 
                onClick={handleUpdateSyllabus} 
                disabled={isUpdatingSyllabus}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="AI Cập nhật tiến độ"
              >
                {isUpdatingSyllabus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-md">Mục tiêu: Thi HSG Quốc gia</span>
                  <span className="text-xs text-blue-600 font-medium">Hoàn thành {totalProgress}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5 mb-4">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{width: `${totalProgress}%`}}></div>
                </div>
                
                <div className="space-y-3">
                  {syllabus.map((item) => (
                    <div key={item.id} className={cn(
                      "flex flex-col p-3 rounded-lg border text-sm transition-colors",
                      item.status === "completed" ? "bg-white border-emerald-200 text-slate-700" :
                      item.status === "current" ? "bg-blue-50 border-blue-200 text-blue-900 font-medium shadow-sm ring-1 ring-blue-500/20" :
                      "bg-slate-50 border-slate-100 text-slate-400"
                    )}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          {item.status === "completed" && <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></div>}
                          {item.status === "current" && <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 animate-pulse"></div>}
                          {item.status === "locked" && <div className="w-2 h-2 rounded-full bg-slate-300 mr-3"></div>}
                          {item.title}
                        </div>
                        {item.status === "current" && <span className="text-xs font-bold text-blue-600">{item.progress}%</span>}
                        {item.status === "completed" && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                      {item.status === "current" && (
                         <div className="w-full bg-blue-200/50 rounded-full h-1 mt-1">
                           <div className="bg-blue-500 h-1 rounded-full transition-all duration-500" style={{width: `${item.progress}%`}}></div>
                         </div>
                      )}
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
            {mindmapData && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                AI Generated
              </span>
            )}
          </div>

          <div className="flex-1 relative flex items-center justify-center p-8">
            {!mindmapData ? (
              <div className="text-center text-slate-500">
                <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Nhập từ khóa và tạo sơ đồ tư duy để bắt đầu học tập nguyên tử.</p>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Connecting Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                  {mindmapData.children?.map((child, index) => {
                    const angle = (index / (mindmapData.children?.length || 1)) * 2 * Math.PI - Math.PI / 2;
                    const radius = 35; // percentage
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);
                    return (
                      <path 
                        key={`line-${child.id}`}
                        d={`M 50% 50% L ${x}% ${y}%`} 
                        stroke="#334155" 
                        strokeWidth="2" 
                        strokeDasharray="4 4" 
                        className="animate-[dash_20s_linear_infinite]" 
                      />
                    );
                  })}
                </svg>

                {/* Center Node */}
                <div 
                  onClick={() => handleNodeClick(mindmapData)}
                  className="absolute z-20 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400 cursor-pointer hover:scale-105 transition-transform text-center max-w-[200px]"
                >
                  {mindmapData.label}
                </div>

                {/* Child Nodes */}
                {mindmapData.children?.map((child, index) => {
                  const angle = (index / (mindmapData.children?.length || 1)) * 2 * Math.PI - Math.PI / 2;
                  const radius = 35; // percentage
                  const x = 50 + radius * Math.cos(angle);
                  const y = 50 + radius * Math.sin(angle);
                  
                  return (
                    <div 
                      key={child.id}
                      onClick={() => handleNodeClick(child)}
                      className="absolute z-10 px-4 py-2 bg-slate-800 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-slate-700 transition-all cursor-pointer shadow-lg text-center max-w-[150px] -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      {child.label}
                    </div>
                  );
                })}

                {/* Floating particles */}
                <div className="absolute top-[35%] left-[35%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-ping"></div>
                <div className="absolute top-[35%] right-[35%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-ping" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute bottom-[35%] left-[50%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-ping" style={{animationDelay: '1s'}}></div>
              </div>
            )}
          </div>

          {/* Node Info Panel */}
          {selectedNode && (
            <div className="absolute bottom-4 right-4 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-emerald-400" />
                  Chi tiết Node
                </h4>
                <div className="flex items-center space-x-1">
                  {!isEditingNode ? (
                    <button onClick={() => setIsEditingNode(true)} className="p-1 text-slate-400 hover:text-emerald-400 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={handleSaveNodeEdit} className="p-1 text-slate-400 hover:text-emerald-400 transition-colors">
                      <Save className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setSelectedNode(null)} className="p-1 text-slate-400 hover:text-rose-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {isEditingNode ? (
                  <>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tiêu đề</label>
                      <input 
                        type="text" 
                        value={editNodeLabel} 
                        onChange={e => setEditNodeLabel(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Mô tả chi tiết</label>
                      <textarea 
                        value={editNodeDesc} 
                        onChange={e => setEditNodeDesc(e.target.value)}
                        className="w-full h-24 p-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <h5 className="text-base font-medium text-emerald-400">{selectedNode.label}</h5>
                    <p className="text-sm text-slate-300 leading-relaxed">{selectedNode.description}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
