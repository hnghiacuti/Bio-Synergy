import { useState } from "react";
import { User, Mail, Award, Shield, Settings, LogOut, BookOpen, Activity } from "lucide-react";
import { cn } from "../lib/utils";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý thông tin và chứng nhận của bạn</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
        <div className="px-6 sm:px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-emerald-100 flex items-center justify-center text-emerald-700 text-3xl font-bold shadow-md">
              YG
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              {isEditing ? "Lưu thay đổi" : "Chỉnh sửa hồ sơ"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Young Guru</h2>
                <p className="text-slate-500 flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  young.guru@example.com
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">Vai trò</span>
                    <span className="font-medium text-slate-900">Học sinh THPT</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">Trường</span>
                    <span className="font-medium text-slate-900">THPT Trọng điểm</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">Mục tiêu</span>
                    <span className="font-medium text-slate-900">Thi HSG Quốc gia Sinh học</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">Ngày tham gia</span>
                    <span className="font-medium text-slate-900">Tháng 9, 2023</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <h3 className="text-sm font-semibold text-emerald-900 mb-4 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-emerald-600" />
                  Huy hiệu & Chứng nhận
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center p-2 bg-white rounded-lg border border-emerald-100 shadow-sm">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md mr-3">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Peer Reviewer</p>
                      <p className="text-[10px] text-slate-500">Đã duyệt 50+ câu trả lời</p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-white rounded-lg border border-emerald-100 shadow-sm">
                    <div className="p-1.5 bg-amber-100 text-amber-600 rounded-md mr-3">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Top 5% Exam</p>
                      <p className="text-[10px] text-slate-500">Điểm trung bình 8.5+</p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-white rounded-lg border border-emerald-100 shadow-sm opacity-50 grayscale">
                    <div className="p-1.5 bg-rose-100 text-rose-600 rounded-md mr-3">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Master Diagnostician</p>
                      <p className="text-[10px] text-slate-500">Chẩn đoán đúng 100 ca</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="flex items-center"><Settings className="w-4 h-4 mr-2 text-slate-400" /> Cài đặt tài khoản</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors">
                  <span className="flex items-center"><LogOut className="w-4 h-4 mr-2 text-rose-500" /> Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
