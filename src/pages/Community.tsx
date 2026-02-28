import { useState } from "react";
import { MessageSquare, ThumbsUp, CheckCircle, Shield, AlertCircle, Users, Search, Filter, BookOpen, Heart, MessageCircle, Plus, X, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";

const tabs = [
  { id: "academic", name: "Phân khu Học thuật", icon: BookOpen },
  { id: "patient", name: "Patient Hub", icon: Heart },
  { id: "chat", name: "Chat Trực tiếp", icon: MessageCircle },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState("academic");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showHiddenPost, setShowHiddenPost] = useState(false);
  const [expandedThread, setExpandedThread] = useState<number | null>(null);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-emerald-600" />
                Tạo câu hỏi mới
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
                <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Nhập tiêu đề câu hỏi..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                <textarea className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" placeholder="Mô tả chi tiết câu hỏi của bạn..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nhãn phân loại (Tags)</label>
                <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Ví dụ: Sinh lý học, Di truyền học..." />
              </div>
              <button onClick={() => setShowCreateModal(false)} className="w-full mt-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors">
                Đăng câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-emerald-600" />
                Lọc bài viết
              </h3>
              <button onClick={() => setShowFilterModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái kiểm duyệt</label>
                <div className="space-y-2">
                  <label className="flex items-center"><input type="checkbox" className="mr-2 rounded text-emerald-600 focus:ring-emerald-500" /> Đã được Peer Review</label>
                  <label className="flex items-center"><input type="checkbox" className="mr-2 rounded text-emerald-600 focus:ring-emerald-500" /> Chưa có câu trả lời</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Chuyên mục</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option>Tất cả</option>
                  <option>Sinh lý học</option>
                  <option>Di truyền học</option>
                  <option>Tế bào học</option>
                </select>
              </div>
              <button onClick={() => setShowFilterModal(false)} className="w-full mt-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors">
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-emerald-600" />
                Tạo phòng thảo luận
              </h3>
              <button onClick={() => setShowCreateRoomModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên phòng</label>
                <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="VD: Thảo luận ca lâm sàng viêm ruột thừa..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chế độ</label>
                <select className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option>Công khai (Ai cũng có thể tham gia)</option>
                  <option>Riêng tư (Cần mã mời)</option>
                </select>
              </div>
              <button onClick={() => setShowCreateRoomModal(false)} className="w-full mt-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors">
                Tạo phòng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bio-Threads & Peer Review</h1>
          <p className="text-sm text-slate-500 mt-1">Mạng xã hội đa tầng Y sinh</p>
        </div>
        {activeTab === "academic" && (
          <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Tạo câu hỏi
          </button>
        )}
      </div>

      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-xl w-full sm:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
              activeTab === tab.id
                ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <tab.icon className={cn("w-4 h-4 mr-2", activeTab === tab.id ? "text-emerald-600" : "text-slate-400")} />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {activeTab === "academic" && (
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi, cơ chế sinh học..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <button onClick={() => setShowFilterModal(true)} className="ml-4 flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100">
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 1,
                  title: "Cơ chế hoạt động của bơm Na+/K+ ATPase trong tế bào thần kinh?",
                  author: "Học sinh Nguyễn Văn A",
                  time: "2 giờ trước",
                  tags: ["Sinh lý học", "Tế bào"],
                  replies: 5,
                  peerReviewed: true,
                  content: "Cho em hỏi tại sao bơm Na+/K+ lại cần ATP để hoạt động ngược gradient nồng độ, và nếu thiếu ATP thì điện thế nghỉ của màng sẽ thay đổi như thế nào ạ?"
                },
                {
                  id: 2,
                  title: "Phân biệt đột biến gen và đột biến NST trong chẩn đoán trước sinh",
                  author: "Sinh viên Y khoa B",
                  time: "5 giờ trước",
                  tags: ["Di truyền học", "Chẩn đoán"],
                  replies: 12,
                  peerReviewed: false,
                  content: "Mọi người cho mình hỏi các phương pháp hiện nay để phân biệt nhanh hai loại đột biến này trên lâm sàng với ạ."
                }
              ].map((thread) => (
                <div key={thread.id} className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:shadow-sm transition-all bg-slate-50/50">
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedThread(expandedThread === thread.id ? null : thread.id)}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium text-slate-500">{thread.author}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-400">{thread.time}</span>
                        {thread.peerReviewed && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Peer Reviewed
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-2">{thread.title}</h3>
                      <p className={cn("text-sm text-slate-600 mb-3", expandedThread !== thread.id && "line-clamp-2")}>{thread.content}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          {thread.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center text-slate-500 text-sm">
                          <MessageSquare className="w-4 h-4 mr-1.5" />
                          {thread.replies} trả lời
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {thread.peerReviewed && expandedThread === thread.id && (
                    <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start space-x-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 mt-0.5">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-900 mb-1">Đã được kiểm chứng bởi TS.BS Lê Văn C</p>
                        <p className="text-sm text-blue-800">"Câu trả lời của bạn @SinhVienY rất chính xác về cơ chế tiêu tốn năng lượng. Bơm Na+/K+ ATPase sử dụng năng lượng từ ATP để đưa 3 Na+ ra ngoài và 2 K+ vào trong tế bào, ngược chiều gradient nồng độ, nhằm duy trì điện thế nghỉ của màng. Nếu thiếu ATP, bơm ngừng hoạt động, Na+ sẽ tràn vào tế bào và K+ đi ra ngoài theo gradient nồng độ, làm mất điện thế nghỉ, tế bào sẽ bị khử cực và không thể truyền xung động thần kinh."</p>
                        <div className="mt-3 flex items-center space-x-4">
                          <button className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-700">
                            <ThumbsUp className="w-3 h-3 mr-1" /> Hữu ích (24)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {expandedThread === thread.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">YG</div>
                        <input type="text" className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Thêm câu trả lời của bạn..." />
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Gửi</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "patient" && (
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center overflow-y-auto">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-4 flex-shrink-0">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Patient Hub - Không gian an toàn</h3>
            <p className="text-sm text-slate-500 max-w-md mt-2 mb-6">
              Nơi chia sẻ kinh nghiệm điều trị. AI tự động kiểm duyệt để ngăn chặn thông tin sai lệch và thuốc không rõ nguồn gốc.
            </p>
            
            <div className="w-full max-w-2xl text-left space-y-4">
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">Kinh nghiệm sống chung với Tiểu đường Type 2</span>
                  <span className="text-xs text-slate-500">Bệnh nhân D • 1 ngày trước</span>
                </div>
                <p className="text-sm text-slate-600">Mình đã duy trì đường huyết ổn định nhờ chế độ ăn Địa Trung Hải và tập thể dục nhẹ nhàng mỗi ngày. Ban đầu rất khó khăn nhưng sau 3 tháng, chỉ số HbA1c của mình đã giảm từ 8.5 xuống 6.8. Bác sĩ cũng rất bất ngờ.</p>
                <div className="mt-3 flex items-center space-x-4 text-slate-500">
                  <button className="flex items-center text-xs font-medium hover:text-rose-600">
                    <Heart className="w-4 h-4 mr-1" /> 128
                  </button>
                  <button className="flex items-center text-xs font-medium hover:text-slate-700">
                    <MessageSquare className="w-4 h-4 mr-1" /> 24 Bình luận
                  </button>
                </div>
              </div>

              <div className={cn("p-4 rounded-2xl border transition-all", showHiddenPost ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200 opacity-80")}>
                {!showHiddenPost ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                    <p className="text-sm font-medium text-slate-900">Bài viết bị ẩn bởi AI</p>
                    <p className="text-xs text-slate-500 mb-3">Chứa thông tin y khoa chưa kiểm chứng hoặc nguy hiểm.</p>
                    <button onClick={() => setShowHiddenPost(true)} className="flex items-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      <Eye className="w-3 h-3 mr-1.5" /> Hiển thị nội dung (Cảnh báo)
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-rose-100 pb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 text-xs font-bold">
                        <AlertTriangle className="w-3 h-3 mr-1.5" />
                        CẢNH BÁO: THÔNG TIN CHƯA KIỂM CHỨNG
                      </span>
                      <button onClick={() => setShowHiddenPost(false)} className="text-slate-400 hover:text-slate-600">
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">Bài thuốc gia truyền chữa dứt điểm...</span>
                      <span className="text-xs text-slate-500">Người dùng ẩn danh</span>
                    </div>
                    <p className="text-sm text-slate-600">Ai bị bệnh này cứ uống lá này là khỏi hẳn 100% không cần đi viện. Mình đã thử và thấy rất hiệu quả, mọi người mua ở link này nhé...</p>
                    <div className="mt-3 p-3 bg-white rounded-xl border border-rose-100 text-xs text-rose-700">
                      <strong>AI Phân tích:</strong> Bài viết chứa cam kết chữa khỏi 100% không có cơ sở khoa học và có dấu hiệu quảng cáo thuốc không rõ nguồn gốc. Khuyến cáo người dùng tuyệt đối không làm theo để tránh hậu quả đáng tiếc.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Phòng thảo luận đang mở</h3>
                <p className="text-sm text-slate-500">Tham gia trao đổi trực tiếp với cộng đồng</p>
              </div>
              <button onClick={() => setShowCreateRoomModal(true)} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center text-sm">
                <Plus className="w-4 h-4 mr-2" />
                Tạo phòng
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Giải phẫu học - Ôn thi giữa kỳ", users: 15, active: true, tags: ["Sinh viên Y", "Giải phẫu"] },
                { name: "Hỏi đáp ca lâm sàng: Sốc phản vệ", users: 8, active: true, tags: ["Cấp cứu", "Lâm sàng"] },
                { name: "Nhóm học tập Sinh học 12", users: 32, active: true, tags: ["THPT", "Ôn thi ĐH"] },
                { name: "Thảo luận bài báo Nature mới nhất", users: 5, active: false, tags: ["Nghiên cứu", "Sinh học phân tử"] },
              ].map((room, i) => (
                <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{room.name}</h4>
                    <span className={cn("flex items-center text-xs font-medium px-2 py-1 rounded-full", room.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                      <Users className="w-3 h-3 mr-1" /> {room.users}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {room.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      <img src={`https://picsum.photos/seed/${i}1/32/32`} className="w-6 h-6 rounded-full border-2 border-white" alt="user" referrerPolicy="no-referrer" />
                      <img src={`https://picsum.photos/seed/${i}2/32/32`} className="w-6 h-6 rounded-full border-2 border-white" alt="user" referrerPolicy="no-referrer" />
                      <img src={`https://picsum.photos/seed/${i}3/32/32`} className="w-6 h-6 rounded-full border-2 border-white" alt="user" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-xs text-slate-500">đang thảo luận...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
