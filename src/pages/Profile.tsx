import { useState, useRef, useEffect } from "react";
import { User, Mail, Award, Shield, Settings, LogOut, BookOpen, Activity, Camera, Key, X } from "lucide-react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("userProfile");
    return saved ? JSON.parse(saved) : {
      name: "Young Guru",
      email: "young.guru@example.com",
      role: "Học sinh THPT",
      school: "THPT Trọng điểm",
      goal: "Thi HSG Quốc gia Sinh học",
      joinDate: "Tháng 9, 2023",
      avatar: "",
      banner: ""
    };
  });

  const [editData, setEditData] = useState({ ...profileData });
  const [settingsData, setSettingsData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    newEmail: profileData.email
  });

  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(profileData));
  }, [profileData]);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditData({ ...editData, avatar: base64String });
        if (!isEditing) {
          setProfileData({ ...profileData, avatar: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditData({ ...editData, banner: base64String });
        if (!isEditing) {
          setProfileData({ ...profileData, banner: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      navigate("/");
    }
  };

  const handleSaveSettings = () => {
    if (settingsData.newPassword && settingsData.newPassword !== settingsData.confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }
    
    const updatedProfile = { ...profileData, email: settingsData.newEmail };
    setProfileData(updatedProfile);
    setEditData({ ...editData, email: settingsData.newEmail });
    setShowSettings(false);
    alert("Đã cập nhật cài đặt tài khoản thành công!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý thông tin và chứng nhận của bạn</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div 
          className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 relative group"
          style={profileData.banner ? { backgroundImage: `url(${profileData.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <button 
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
            title="Thay đổi ảnh bìa"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={bannerInputRef} 
            onChange={handleBannerChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
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
                title="Thay đổi ảnh đại diện"
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
                      <span className="text-slate-600">{profileData.email}</span>
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
                <button 
                  onClick={() => setShowSettings(true)}
                  className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-slate-500" />
                Cài đặt tài khoản
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={settingsData.newEmail}
                    onChange={(e) => setSettingsData({...settingsData, newEmail: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center">
                  <Key className="w-4 h-4 mr-2 text-slate-500" />
                  Đổi mật khẩu
                </h4>
                <div className="space-y-3">
                  <input 
                    type="password" 
                    placeholder="Mật khẩu hiện tại"
                    value={settingsData.currentPassword}
                    onChange={(e) => setSettingsData({...settingsData, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <input 
                    type="password" 
                    placeholder="Mật khẩu mới"
                    value={settingsData.newPassword}
                    onChange={(e) => setSettingsData({...settingsData, newPassword: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <input 
                    type="password" 
                    placeholder="Xác nhận mật khẩu mới"
                    value={settingsData.confirmPassword}
                    onChange={(e) => setSettingsData({...settingsData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
