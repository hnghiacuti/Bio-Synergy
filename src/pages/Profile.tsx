import { useState, useRef } from "react";
import { User, Mail, Award, Shield, Settings, LogOut, BookOpen, Activity, Camera } from "lucide-react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    name: "Young Guru",
    email: "young.guru@example.com",
    role: "Học sinh THPT",
    school: "THPT Trọng điểm",
    goal: "Thi HSG Quốc gia Sinh học",
    joinDate: "Tháng 9, 2023",
    avatar: ""
  });

  const [editData, setEditData] = useState({ ...profileData });

  const handleSave = () => {
    setProfileData({ ...editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditData({ ...editData, avatar: imageUrl });
      if (!isEditing) {
        setProfileData({ ...profileData, avatar: imageUrl });
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      navigate("/");
    }
  };

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
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-emerald-100 flex items-center justify-center text-emerald-700 text-3xl font-bold shadow-md overflow-hidden">
                {(isEditing ? editData.avatar : profileData.avatar) ? (
                  <img src={isEditing ? editData.avatar : profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profileData.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleCancel}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Chỉnh sửa hồ sơ
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                {isEditing ? (
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={editData.name} 
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="text-xl font-bold text-slate-900 w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      <input 
                        type="email" 
                        value={editData.email} 
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="text-slate-600 w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-slate-900">{profileData.name}</h2>
                    <p className="text-slate-500 flex items-center mt-1">
                      <Mail className="w-4 h-4 mr-2" />
                      {profileData.email}
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">Vai trò</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editData.role} 
                        onChange={(e) => setEditData({...editData, role: e.target.value})}
                        className="font-medium text-slate-900 w-full p-1.5 border border-slate-200 rounded-md text-sm"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{profileData.role}</span>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">Trường</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editData.school} 
                        onChange={(e) => setEditData({...editData, school: e.target.value})}
                        className="font-medium text-slate-900 w-full p-1.5 border border-slate-200 rounded-md text-sm"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{profileData.school}</span>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">Mục tiêu</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editData.goal} 
                        onChange={(e) => setEditData({...editData, goal: e.target.value})}
                        className="font-medium text-slate-900 w-full p-1.5 border border-slate-200 rounded-md text-sm"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{profileData.goal}</span>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1">Ngày tham gia</span>
                    <span className="font-medium text-slate-900">{profileData.joinDate}</span>
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
                <button onClick={handleLogout} className="w-full flex items-center justify-between p-3 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors">
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
