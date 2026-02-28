import { useState, useRef, useEffect } from "react";
import { MessageSquare, ThumbsUp, CheckCircle, Shield, AlertCircle, Users, Search, Filter, BookOpen, Heart, MessageCircle, Plus, X, Eye, EyeOff, AlertTriangle, Send, ArrowLeft, Trash2, Settings, Lock, Loader2, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";
import { GoogleGenAI } from "@google/genai";

// --- DATA MODELS ---
type Comment = { id: number; author: string; content: string; time: string; upvotes: number; isPeerReviewed?: boolean; };
type Post = { id: number; title: string; author: string; time: string; tags: string[]; content: string; upvotes: number; views: number; peerReviewed?: boolean; comments: Comment[]; isHidden?: boolean; aiWarning?: string; category?: string; };
type ChatMessage = { id: string; sender: string; text: string; time: string; isSelf: boolean; isNPC?: boolean; };
type ChatRoom = { id: number; name: string; users: number; maxUsers: number; active: boolean; tags: string[]; messages: ChatMessage[]; password?: string; creator: string; };

// --- INITIAL DATA ---
const initialAcademicPosts: Post[] = [
  {
    id: 1, title: "Cơ chế hoạt động của bơm Na+/K+ ATPase trong tế bào thần kinh?", author: "Học sinh Nguyễn Văn A", time: "2 giờ trước", tags: ["Sinh lý học", "Tế bào"], category: "Sinh lý học", upvotes: 45, views: 120, peerReviewed: true,
    content: "Cho em hỏi tại sao bơm Na+/K+ lại cần ATP để hoạt động ngược gradient nồng độ, và nếu thiếu ATP thì điện thế nghỉ của màng sẽ thay đổi như thế nào ạ?",
    comments: [
      { id: 1, author: "TS.BS Lê Văn C", content: "Bơm Na+/K+ ATPase sử dụng năng lượng từ ATP để đưa 3 Na+ ra ngoài và 2 K+ vào trong tế bào, ngược chiều gradient nồng độ, nhằm duy trì điện thế nghỉ của màng. Nếu thiếu ATP, bơm ngừng hoạt động, Na+ sẽ tràn vào tế bào và K+ đi ra ngoài theo gradient nồng độ, làm mất điện thế nghỉ, tế bào sẽ bị khử cực và không thể truyền xung động thần kinh.", time: "1 giờ trước", upvotes: 24, isPeerReviewed: true }
    ]
  },
  {
    id: 2, title: "Phân biệt đột biến gen và đột biến NST trong chẩn đoán trước sinh", author: "Sinh viên Y khoa B", time: "5 giờ trước", tags: ["Di truyền học", "Chẩn đoán"], category: "Di truyền học", upvotes: 12, views: 85, peerReviewed: false,
    content: "Mọi người cho mình hỏi các phương pháp hiện nay để phân biệt nhanh hai loại đột biến này trên lâm sàng với ạ.",
    comments: []
  }
];

const initialPatientPosts: Post[] = [
  { id: 101, title: "Kinh nghiệm sống chung với Tiểu đường Type 2", author: "Bệnh nhân D", time: "1 ngày trước", tags: ["Tiểu đường", "Dinh dưỡng"], content: "Mình đã duy trì đường huyết ổn định nhờ chế độ ăn Địa Trung Hải và tập thể dục nhẹ nhàng mỗi ngày. Ban đầu rất khó khăn nhưng sau 3 tháng, chỉ số HbA1c của mình đã giảm từ 8.5 xuống 6.8.", upvotes: 128, views: 500, comments: [{ id: 1, author: "Người dùng 1", content: "Tuyệt vời quá, bạn chia sẻ thực đơn chi tiết được không?", time: "20 giờ trước", upvotes: 5 }] },
  { id: 102, title: "Bài thuốc gia truyền chữa dứt điểm ung thư", author: "Người dùng ẩn danh", time: "2 ngày trước", tags: ["Ung thư", "Thuốc nam"], content: "Ai bị bệnh này cứ uống lá này là khỏi hẳn 100% không cần đi viện. Mình đã thử và thấy rất hiệu quả, mọi người mua ở link này nhé...", upvotes: 2, views: 100, isHidden: true, aiWarning: "Bài viết chứa cam kết chữa khỏi 100% không có cơ sở khoa học và có dấu hiệu quảng cáo thuốc không rõ nguồn gốc.", comments: [] },
  { id: 103, title: "Vượt qua trầm cảm sau sinh", author: "Mẹ Bỉm Sữa", time: "3 ngày trước", tags: ["Tâm lý", "Sản khoa"], content: "Đừng ngại nhờ sự giúp đỡ. Mình đã từng nghĩ mình là người mẹ tồi, nhưng nhờ đi khám tâm lý và sự hỗ trợ của chồng, mình đã ổn hơn rất nhiều.", upvotes: 342, views: 1200, comments: [] },
  { id: 104, title: "Phục hồi sau mổ dây chằng chéo trước (ACL)", author: "Thể thao VN", time: "4 ngày trước", tags: ["Chấn thương", "Phục hồi chức năng"], content: "Tháng đầu tiên cực kỳ đau đớn và nản chí. Nhưng kiên trì tập vật lý trị liệu mỗi ngày, giờ tháng thứ 6 mình đã có thể chạy nhẹ nhàng rồi.", upvotes: 89, views: 300, comments: [] },
  { id: 105, title: "Chữa đau dạ dày HP+ bằng tỏi ngâm mật ong", author: "Người dùng ẩn danh", time: "5 ngày trước", tags: ["Dạ dày", "Mẹo vặt"], content: "Bỏ phác đồ kháng sinh đi, cứ sáng ra làm 1 thìa tỏi ngâm mật ong là diệt sạch vi khuẩn HP trong 1 tuần.", upvotes: 5, views: 150, isHidden: true, aiWarning: "Vi khuẩn HP cần được điều trị bằng phác đồ kháng sinh chuẩn y khoa. Tỏi mật ong chỉ hỗ trợ, không thể tiêu diệt HP và việc bỏ thuốc có thể gây kháng kháng sinh.", comments: [] },
  { id: 106, title: "Hành trình trị mụn nội tiết", author: "Skincare Lover", time: "5 ngày trước", tags: ["Da liễu", "Làm đẹp"], content: "Sau bao năm bôi thoa không hết, mình đi khám nội tiết phát hiện PCOS. Uống thuốc theo đơn bác sĩ kết hợp skincare tối giản, da mình đã sạch mụn 90%.", upvotes: 210, views: 800, comments: [] },
  { id: 107, title: "Thuốc giảm cân thần tốc giảm 5kg/tuần", author: "Shop Online", time: "6 ngày trước", tags: ["Giảm cân", "Làm đẹp"], content: "Thuốc giảm cân nhập khẩu, không cần ăn kiêng, không cần tập thể dục, đảm bảo giảm 5kg trong 1 tuần không mệt mỏi.", upvotes: 1, views: 50, isHidden: true, aiWarning: "Sản phẩm giảm cân cấp tốc thường chứa chất cấm (Sibutramine) gây suy tim, suy thận. Giảm cân an toàn tối đa 0.5-1kg/tuần.", comments: [] },
  { id: 108, title: "Sống chung với Hội chứng ruột kích thích (IBS)", author: "Bụng Yếu", time: "1 tuần trước", tags: ["Tiêu hóa", "IBS"], content: "Mình áp dụng chế độ ăn Low FODMAP và thấy cải thiện rõ rệt. Các bạn bị IBS nên thử ghi chép lại nhật ký ăn uống để tìm ra thực phẩm kích thích nhé.", upvotes: 156, views: 600, comments: [] },
  { id: 109, title: "Chăm sóc người nhà bị Alzheimer", author: "Gia đình yêu thương", time: "1 tuần trước", tags: ["Thần kinh", "Người cao tuổi"], content: "Chăm sóc người bệnh Alzheimer cần sự kiên nhẫn khổng lồ. Đừng tranh cãi với họ khi họ nhớ sai, hãy hùa theo và chuyển hướng sự chú ý.", upvotes: 420, views: 1500, comments: [] },
  { id: 110, title: "Mẹo chữa bỏng bằng kem đánh răng", author: "Người dùng ẩn danh", time: "1 tuần trước", tags: ["Sơ cứu", "Bỏng"], content: "Bị bỏng nước sôi cứ bôi ngay kem đánh răng hoặc nước mắm lên là mát ngay, không bị phồng rộp đâu.", upvotes: 12, views: 200, isHidden: true, aiWarning: "Bôi kem đánh răng/nước mắm lên vết bỏng gây nhiễm trùng và làm vết bỏng sâu hơn. Sơ cứu chuẩn: xả dưới vòi nước mát 15-20 phút.", comments: [] },
  { id: 111, title: "Kinh nghiệm nhổ 4 răng khôn cùng lúc", author: "Dũng Sĩ Diệt Răng", time: "2 tuần trước", tags: ["Nha khoa", "Phẫu thuật"], content: "Mình gây mê nhổ 4 cái 1 lúc. 3 ngày đầu mặt sưng như cái mâm, húp cháo loãng. Nhớ chườm đá liên tục 24h đầu và uống thuốc đúng giờ nhé.", upvotes: 315, views: 1100, comments: [] },
  { id: 112, title: "Tự chữa gãy xương bằng đắp lá", author: "Thầy Lang", time: "2 tuần trước", tags: ["Chấn thương", "Cơ xương khớp"], content: "Gãy xương không cần bó bột, đắp lá thuốc nhà mình 1 tháng là xương tự liền, đi lại bình thường.", upvotes: 3, views: 80, isHidden: true, aiWarning: "Gãy xương cần được nắn chỉnh và cố định bằng bột/nẹp y tế. Đắp lá có thể gây nhiễm trùng hoại tử, can xương lệch dẫn đến tàn phế.", comments: [] },
  { id: 113, title: "Kiểm soát cơn hen suyễn khi giao mùa", author: "Hơi Thở", time: "2 tuần trước", tags: ["Hô hấp", "Hen suyễn"], content: "Luôn mang theo bình xịt cắt cơn (Ventolin). Khi trời lạnh, nhớ quàng khăn ấm cổ và đeo khẩu trang để tránh không khí lạnh kích ứng đường thở.", upvotes: 189, views: 750, comments: [] },
  { id: 114, title: "Vượt qua rối loạn lo âu lan tỏa (GAD)", author: "Tâm An", time: "3 tuần trước", tags: ["Tâm lý", "Lo âu"], content: "Thiền chánh niệm (Mindfulness) và liệu pháp nhận thức hành vi (CBT) đã cứu rỗi mình. Đừng lạm dụng thuốc an thần nếu không có chỉ định.", upvotes: 275, views: 900, comments: [] },
  { id: 115, title: "Chữa cận thị bằng cách nhìn mặt trời", author: "Người dùng ẩn danh", time: "3 tuần trước", tags: ["Mắt", "Cận thị"], content: "Mỗi sáng nhìn thẳng vào mặt trời 15 phút, tập thể dục cho mắt sẽ hết cận thị, không cần đeo kính.", upvotes: 0, views: 40, isHidden: true, aiWarning: "Nhìn trực tiếp vào mặt trời gây bỏng võng mạc, có thể dẫn đến mù lòa vĩnh viễn. Cận thị là tật khúc xạ do thay đổi trục nhãn cầu, không thể chữa khỏi bằng bài tập mắt.", comments: [] },
  { id: 116, title: "Hành trình niềng răng Invisalign", author: "Nụ Cười Mới", time: "3 tuần trước", tags: ["Nha khoa", "Thẩm mỹ"], content: "Thẩm mỹ tốt, dễ vệ sinh nhưng phải cực kỳ kỷ luật đeo đủ 22h/ngày. Ai lười thì nên niềng mắc cài kim loại cho chắc ăn.", upvotes: 142, views: 650, comments: [] },
  { id: 117, title: "Đau mỏi vai gáy dân văn phòng", author: "Coder 99", time: "1 tháng trước", tags: ["Cơ xương khớp", "Văn phòng"], content: "Đầu tư một chiếc ghế công thái học và màn hình phụ đặt ngang tầm mắt. Cứ 45 phút đứng dậy vươn vai 1 lần. Đỡ hẳn đau mỏi cổ vai gáy.", upvotes: 450, views: 2000, comments: [] },
  { id: 118, title: "Thuốc tăng chiều cao tuổi 25", author: "Shop Online", time: "1 tháng trước", tags: ["Xương khớp", "Thực phẩm chức năng"], content: "Viên uống kích thích hormone tăng trưởng, cam kết cao thêm 3-5cm dù đã qua tuổi dậy thì.", upvotes: 5, views: 120, isHidden: true, aiWarning: "Sụn sườn đã cốt hóa hoàn toàn ở độ tuổi 20-25. Không có bất kỳ loại thuốc nào có thể làm tăng chiều cao sau khi sụn đã đóng.", comments: [] },
  { id: 119, title: "Kinh nghiệm chăm sóc da Viêm da cơ địa", author: "Da Nhạy Cảm", time: "1 tháng trước", tags: ["Da liễu", "Dị ứng"], content: "Quy tắc sống còn: Dưỡng ẩm, dưỡng ẩm và dưỡng ẩm. Tắm nước ấm vừa phải, bôi kem dưỡng ẩm ngay trong vòng 3 phút sau khi tắm.", upvotes: 230, views: 850, comments: [] },
  { id: 120, title: "Phục hồi chức năng sau đột quỵ", author: "Người nhà bệnh nhân", time: "1 tháng trước", tags: ["Thần kinh", "Phục hồi chức năng"], content: "Thời gian vàng là 6 tháng đầu. Gia đình phải kiên trì tập cùng bệnh nhân mỗi ngày, dù chỉ là những cử động nhỏ nhất.", upvotes: 380, views: 1400, comments: [] },
];

const initialChatRooms: ChatRoom[] = [
  { id: 1, name: "Giải phẫu học - Ôn thi giữa kỳ", users: 15, maxUsers: 999, active: true, tags: ["Sinh viên Y", "Giải phẫu"], creator: "Admin", messages: [{ id: "m1", sender: "Admin", text: "Chào mừng các bạn đến phòng ôn thi!", time: "08:00", isSelf: false }] },
  { id: 2, name: "Hỏi đáp ca lâm sàng: Sốc phản vệ", users: 8, maxUsers: 50, active: true, tags: ["Cấp cứu", "Lâm sàng"], creator: "Admin", messages: [] },
  { id: 3, name: "Nhóm học tập Sinh học 12", users: 32, maxUsers: 100, active: true, tags: ["THPT", "Ôn thi ĐH"], creator: "Admin", messages: [] },
  { id: 4, name: "Thảo luận bài báo Nature mới nhất", users: 5, maxUsers: 20, active: false, tags: ["Nghiên cứu", "Sinh học phân tử"], creator: "Admin", messages: [] },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState("academic");
  
  // State for data
  const [academicPosts, setAcademicPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem("academicPosts");
    return saved ? JSON.parse(saved) : initialAcademicPosts;
  });
  const [patientPosts, setPatientPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem("patientPosts");
    return saved ? JSON.parse(saved) : initialPatientPosts;
  });
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(() => {
    const saved = localStorage.getItem("chatRooms");
    return saved ? JSON.parse(saved) : initialChatRooms;
  });
  
  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("academicPosts", JSON.stringify(academicPosts));
  }, [academicPosts]);

  useEffect(() => {
    localStorage.setItem("patientPosts", JSON.stringify(patientPosts));
  }, [patientPosts]);

  useEffect(() => {
    localStorage.setItem("chatRooms", JSON.stringify(chatRooms));
  }, [chatRooms]);
  
  // UI States
  const [expandedThread, setExpandedThread] = useState<number | null>(null);
  const [showHiddenPosts, setShowHiddenPosts] = useState<Record<number, boolean>>({});
  const [activeChatRoom, setActiveChatRoom] = useState<number | null>(null);
  const [roomPasswordInput, setRoomPasswordInput] = useState("");
  const [roomToJoin, setRoomToJoin] = useState<ChatRoom | null>(null);
  
  // Modals & Forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "", category: "Khác" });
  const [newComment, setNewComment] = useState("");
  const [newRoom, setNewRoom] = useState({ name: "", maxUsers: 999, password: "" });
  const [chatMessage, setChatMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [isNPCTyping, setIsNPCTyping] = useState(false);
  
  // Filters
  const [academicFilter, setAcademicFilter] = useState({ category: 'Tất cả', peerReviewedOnly: false, unansweredOnly: false });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeChatRoom !== null && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatRooms, activeChatRoom, isNPCTyping]);

  // Handlers
  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) return;
    const post: Post = {
      id: Date.now(),
      title: newPost.title,
      author: "Young Guru (Bạn)",
      time: "Vừa xong",
      tags: newPost.tags.split(",").map(t => t.trim()).filter(t => t),
      category: newPost.category,
      content: newPost.content,
      upvotes: 0,
      views: 0,
      peerReviewed: false,
      comments: []
    };
    setAcademicPosts([post, ...academicPosts]);
    setShowCreateModal(false);
    setNewPost({ title: "", content: "", tags: "", category: "Khác" });
  };

  const handleGenerateAIPost = async () => {
    setIsGeneratingPost(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Hãy tạo một bài đăng hỏi đáp học thuật về Sinh học (ví dụ: Di truyền, Sinh lý, Tế bào).
Trả về JSON với cấu trúc:
{
  "title": "Tiêu đề câu hỏi",
  "content": "Nội dung chi tiết câu hỏi",
  "tags": ["Tag1", "Tag2"],
  "category": "Di truyền học" (hoặc Sinh lý học, Tế bào học, Giải phẫu học, Khác),
  "author": "Tên người hỏi ngẫu nhiên"
}`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text || "{}");
      if (data.title && data.content) {
        const post: Post = {
          id: Date.now(),
          title: data.title,
          author: data.author || "AI Student",
          time: "Vừa xong",
          tags: data.tags || ["Sinh học"],
          category: data.category || "Khác",
          content: data.content,
          upvotes: Math.floor(Math.random() * 20),
          views: Math.floor(Math.random() * 100),
          peerReviewed: Math.random() > 0.5,
          comments: []
        };
        setAcademicPosts([post, ...academicPosts]);
      }
    } catch (error) {
      console.error("Error generating post:", error);
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleAddComment = (postId: number, isPatient: boolean) => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now(),
      author: "Young Guru (Bạn)",
      content: newComment,
      time: "Vừa xong",
      upvotes: 0
    };
    
    if (isPatient) {
      setPatientPosts(posts => posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
    } else {
      setAcademicPosts(posts => posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
    }
    setNewComment("");
  };

  const handleUpvote = (postId: number, isPatient: boolean) => {
    if (isPatient) {
      setPatientPosts(posts => posts.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p));
    } else {
      setAcademicPosts(posts => posts.map(p => p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p));
    }
  };

  const handleCreateRoom = () => {
    if (!newRoom.name) return;
    const room: ChatRoom = {
      id: Date.now(),
      name: newRoom.name,
      users: 1,
      maxUsers: newRoom.maxUsers || 999,
      active: true,
      tags: ["Mới tạo"],
      password: newRoom.password,
      creator: "Young Guru (Bạn)",
      messages: []
    };
    setChatRooms([room, ...chatRooms]);
    setShowCreateRoomModal(false);
    setActiveChatRoom(room.id);
    setNewRoom({ name: "", maxUsers: 999, password: "" });
  };

  const handleDeleteRoom = (roomId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này?")) {
      setChatRooms(rooms => rooms.filter(r => r.id !== roomId));
      if (activeChatRoom === roomId) setActiveChatRoom(null);
    }
  };

  const handleJoinRoom = (room: ChatRoom) => {
    if (room.password) {
      setRoomToJoin(room);
    } else {
      setActiveChatRoom(room.id);
    }
  };

  const confirmJoinRoom = () => {
    if (roomToJoin && roomPasswordInput === roomToJoin.password) {
      setActiveChatRoom(roomToJoin.id);
      setRoomToJoin(null);
      setRoomPasswordInput("");
    } else {
      alert("Mật khẩu không đúng!");
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || activeChatRoom === null) return;
    
    const msgId = Date.now().toString();
    const userText = chatMessage;
    const msg: ChatMessage = {
      id: msgId,
      sender: "Young Guru",
      text: userText,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isSelf: true
    };
    
    setChatRooms(rooms => rooms.map(r => r.id === activeChatRoom ? { ...r, messages: [...r.messages, msg] } : r));
    setChatMessage("");
    setIsNPCTyping(true);

    // AI NPC Response
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const room = chatRooms.find(r => r.id === activeChatRoom);
      const historyText = room?.messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n') || "";
      
      const prompt = `Bạn là một NPC (trợ lý AI) trong phòng chat "${room?.name}". Hãy trả lời tin nhắn của người dùng một cách tự nhiên, ngắn gọn và hữu ích.
Lịch sử:
${historyText}
Young Guru: ${userText}
NPC:`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const npcMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "NPC",
        text: response.text || "Xin chào!",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isSelf: false,
        isNPC: true
      };

      setChatRooms(rooms => rooms.map(r => r.id === activeChatRoom ? { ...r, messages: [...r.messages, npcMsg] } : r));
    } catch (error) {
      console.error("NPC Error:", error);
    } finally {
      setIsNPCTyping(false);
    }
  };

  const handleRecallMessage = (roomId: number, msgId: string) => {
    if (window.confirm("Thu hồi tin nhắn này?")) {
      setChatRooms(rooms => rooms.map(r => {
        if (r.id === roomId) {
          return { ...r, messages: r.messages.filter(m => m.id !== msgId) };
        }
        return r;
      }));
    }
  };

  // Filter Logic
  const filteredAcademicPosts = academicPosts.filter(post => {
    if (academicFilter.category !== 'Tất cả' && post.category !== academicFilter.category) return false;
    if (academicFilter.peerReviewedOnly && !post.peerReviewed) return false;
    if (academicFilter.unansweredOnly && post.comments.length > 0) return false;
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) && !post.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeRoomData = chatRooms.find(r => r.id === activeChatRoom);

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
                <input type="text" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Nhập tiêu đề câu hỏi..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chuyên mục</label>
                <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option>Sinh lý học</option>
                  <option>Di truyền học</option>
                  <option>Tế bào học</option>
                  <option>Giải phẫu học</option>
                  <option>Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                <textarea value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" placeholder="Mô tả chi tiết câu hỏi của bạn..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nhãn phân loại (Tags - cách nhau bởi dấu phẩy)</label>
                <input type="text" value={newPost.tags} onChange={e => setNewPost({...newPost, tags: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Ví dụ: Sinh lý học, Di truyền học..." />
              </div>
              <button onClick={handleCreatePost} className="w-full mt-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors">
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
                  <label className="flex items-center"><input type="checkbox" checked={academicFilter.peerReviewedOnly} onChange={e => setAcademicFilter({...academicFilter, peerReviewedOnly: e.target.checked})} className="mr-2 rounded text-emerald-600 focus:ring-emerald-500" /> Đã được Peer Review</label>
                  <label className="flex items-center"><input type="checkbox" checked={academicFilter.unansweredOnly} onChange={e => setAcademicFilter({...academicFilter, unansweredOnly: e.target.checked})} className="mr-2 rounded text-emerald-600 focus:ring-emerald-500" /> Chưa có câu trả lời</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Chuyên mục</label>
                <select value={academicFilter.category} onChange={e => setAcademicFilter({...academicFilter, category: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option>Tất cả</option>
                  <option>Sinh lý học</option>
                  <option>Di truyền học</option>
                  <option>Tế bào học</option>
                  <option>Giải phẫu học</option>
                  <option>Khác</option>
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
                <input type="text" value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="VD: Thảo luận ca lâm sàng viêm ruột thừa..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số người tối đa</label>
                  <input type="number" value={newRoom.maxUsers} onChange={e => setNewRoom({...newRoom, maxUsers: Number(e.target.value)})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu (Tùy chọn)</label>
                  <input type="text" value={newRoom.password} onChange={e => setNewRoom({...newRoom, password: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Để trống nếu công khai" />
                </div>
              </div>
              <button onClick={handleCreateRoom} className="w-full mt-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors">
                Tạo phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {roomToJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center"><Lock className="w-5 h-5 mr-2 text-slate-500" /> Nhập mật khẩu phòng</h3>
            <input type="password" value={roomPasswordInput} onChange={e => setRoomPasswordInput(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 mb-4" placeholder="Mật khẩu..." />
            <div className="flex space-x-3">
              <button onClick={() => setRoomToJoin(null)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200">Hủy</button>
              <button onClick={confirmJoinRoom} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Vào phòng</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bio-Threads & Peer Review</h1>
          <p className="text-sm text-slate-500 mt-1">Mạng xã hội đa tầng Y sinh</p>
        </div>
        <div className="flex space-x-2">
          {activeTab === "academic" && (
            <button onClick={handleGenerateAIPost} disabled={isGeneratingPost} className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors shadow-sm disabled:opacity-50">
              {isGeneratingPost ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              AI Tạo bài viết
            </button>
          )}
          {activeTab === "academic" && (
            <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Tạo câu hỏi
            </button>
          )}
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-xl w-full sm:w-fit">
        {[
          { id: "academic", name: "Phân khu Học thuật", icon: BookOpen },
          { id: "patient", name: "Patient Hub", icon: Heart },
          { id: "chat", name: "Chat Trực tiếp", icon: MessageCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setActiveChatRoom(null); }}
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
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm câu hỏi, cơ chế sinh học..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <button onClick={() => setShowFilterModal(true)} className="ml-4 flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100">
                <Filter className="w-4 h-4 mr-2" />
                Lọc {(academicFilter.category !== 'Tất cả' || academicFilter.peerReviewedOnly || academicFilter.unansweredOnly) && <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500"></span>}
              </button>
            </div>

            <div className="space-y-4">
              {filteredAcademicPosts.length === 0 ? (
                <div className="text-center py-10 text-slate-500">Không tìm thấy bài viết nào phù hợp.</div>
              ) : filteredAcademicPosts.map((thread) => (
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
                          <button onClick={(e) => { e.stopPropagation(); handleUpvote(thread.id, false); }} className="flex items-center hover:text-emerald-600 mr-4">
                            <ThumbsUp className="w-4 h-4 mr-1.5" /> {thread.upvotes}
                          </button>
                          <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1.5" /> {thread.comments.length} trả lời
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {expandedThread === thread.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                      {thread.comments.map(comment => (
                        <div key={comment.id} className={cn("p-4 rounded-xl flex items-start space-x-3", comment.isPeerReviewed ? "bg-blue-50/50 border border-blue-100" : "bg-white border border-slate-100")}>
                          {comment.isPeerReviewed ? (
                            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 mt-0.5"><Shield className="w-4 h-4" /></div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">{comment.author.charAt(0)}</div>
                          )}
                          <div className="flex-1">
                            <p className={cn("text-xs font-medium mb-1", comment.isPeerReviewed ? "text-blue-900" : "text-slate-900")}>
                              {comment.isPeerReviewed ? `Đã được kiểm chứng bởi ${comment.author}` : comment.author} <span className="text-slate-400 font-normal ml-2">{comment.time}</span>
                            </p>
                            <p className={cn("text-sm", comment.isPeerReviewed ? "text-blue-800" : "text-slate-700")}>{comment.content}</p>
                            <div className="mt-2 flex items-center space-x-4">
                              <button className={cn("flex items-center text-xs font-medium", comment.isPeerReviewed ? "text-blue-600 hover:text-blue-700" : "text-slate-500 hover:text-emerald-600")}>
                                <ThumbsUp className="w-3 h-3 mr-1" /> Hữu ích ({comment.upvotes})
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex items-center space-x-3 pt-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">YG</div>
                        <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddComment(thread.id, false)} className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Thêm câu trả lời của bạn..." />
                        <button onClick={() => handleAddComment(thread.id, false)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Gửi</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "patient" && (
          <div className="p-6 flex-1 flex flex-col items-center overflow-y-auto">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-4 flex-shrink-0">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Patient Hub - Không gian an toàn</h3>
            <p className="text-sm text-slate-500 max-w-md mt-2 mb-6 text-center">
              Nơi chia sẻ kinh nghiệm điều trị. AI tự động kiểm duyệt để ngăn chặn thông tin sai lệch và thuốc không rõ nguồn gốc.
            </p>
            
            <div className="w-full max-w-2xl text-left space-y-4">
              {patientPosts.map((post) => (
                <div key={post.id} className={cn("p-4 rounded-2xl border transition-all", post.isHidden && !showHiddenPosts[post.id] ? "bg-slate-50 border-slate-200 opacity-80" : post.isHidden ? "bg-rose-50 border-rose-200" : "bg-rose-50/50 border-rose-100 hover:shadow-sm")}>
                  {post.isHidden && !showHiddenPosts[post.id] ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                      <p className="text-sm font-medium text-slate-900">Bài viết bị ẩn bởi AI</p>
                      <p className="text-xs text-slate-500 mb-3">Chứa thông tin y khoa chưa kiểm chứng hoặc nguy hiểm.</p>
                      <button onClick={() => setShowHiddenPosts({...showHiddenPosts, [post.id]: true})} className="flex items-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <Eye className="w-3 h-3 mr-1.5" /> Hiển thị nội dung (Cảnh báo)
                      </button>
                    </div>
                  ) : (
                    <div>
                      {post.isHidden && (
                        <div className="flex items-center justify-between mb-3 border-b border-rose-100 pb-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 text-xs font-bold">
                            <AlertTriangle className="w-3 h-3 mr-1.5" />
                            CẢNH BÁO: THÔNG TIN CHƯA KIỂM CHỨNG
                          </span>
                          <button onClick={() => setShowHiddenPosts({...showHiddenPosts, [post.id]: false})} className="text-slate-400 hover:text-slate-600">
                            <EyeOff className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">{post.title}</span>
                        <span className="text-xs text-slate-500">{post.author} • {post.time}</span>
                      </div>
                      <p className="text-sm text-slate-600">{post.content}</p>
                      
                      {post.isHidden && post.aiWarning && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-rose-100 text-xs text-rose-700">
                          <strong>AI Phân tích:</strong> {post.aiWarning}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-slate-500">
                        <div className="flex space-x-4">
                          <button onClick={() => handleUpvote(post.id, true)} className="flex items-center text-xs font-medium hover:text-rose-600">
                            <Heart className="w-4 h-4 mr-1" /> {post.upvotes}
                          </button>
                          <button onClick={() => setExpandedThread(expandedThread === post.id ? null : post.id)} className="flex items-center text-xs font-medium hover:text-slate-700">
                            <MessageSquare className="w-4 h-4 mr-1" /> {post.comments.length} Bình luận
                          </button>
                        </div>
                        <div className="flex space-x-1">
                          {post.tags.map(tag => <span key={tag} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">{tag}</span>)}
                        </div>
                      </div>

                      {expandedThread === post.id && (
                        <div className="mt-4 pt-4 border-t border-slate-200/50 space-y-3">
                          {post.comments.map(comment => (
                            <div key={comment.id} className="bg-white p-3 rounded-xl border border-slate-100">
                              <p className="text-xs font-medium text-slate-900 mb-1">{comment.author} <span className="text-slate-400 font-normal ml-2">{comment.time}</span></p>
                              <p className="text-sm text-slate-700">{comment.content}</p>
                            </div>
                          ))}
                          <div className="flex items-center space-x-2 pt-2">
                            <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id, true)} className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" placeholder="Viết bình luận động viên..." />
                            <button onClick={() => handleAddComment(post.id, true)} className="px-3 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600"><Send className="w-4 h-4" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeChatRoom === null ? (
              <div className="p-6 overflow-y-auto">
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
                  {chatRooms.map((room) => (
                    <div key={room.id} onClick={() => handleJoinRoom(room)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group relative">
                      {room.creator === "Young Guru (Bạn)" && (
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="flex justify-between items-start mb-3 pr-8">
                        <h4 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center">
                          {room.password && <Lock className="w-3 h-3 mr-1.5 text-slate-400" />}
                          {room.name}
                        </h4>
                        <span className={cn("flex items-center text-xs font-medium px-2 py-1 rounded-full", room.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                          <Users className="w-3 h-3 mr-1" /> {room.users}/{room.maxUsers}
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
                          <img src={`https://picsum.photos/seed/${room.id}1/32/32`} className="w-6 h-6 rounded-full border-2 border-white" alt="user" referrerPolicy="no-referrer" />
                          <img src={`https://picsum.photos/seed/${room.id}2/32/32`} className="w-6 h-6 rounded-full border-2 border-white" alt="user" referrerPolicy="no-referrer" />
                          <img src={`https://picsum.photos/seed/${room.id}3/32/32`} className="w-6 h-6 rounded-full border-2 border-white" alt="user" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-xs text-slate-500">đang thảo luận...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full bg-slate-50">
                <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center">
                    <button onClick={() => setActiveChatRoom(null)} className="mr-3 p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="font-semibold text-slate-900">{activeRoomData?.name}</h3>
                      <p className="text-xs text-emerald-600 font-medium">{activeRoomData?.users}/{activeRoomData?.maxUsers} người đang tham gia</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeRoomData?.messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chưa có tin nhắn nào. Hãy là người đầu tiên!</div>
                  ) : (
                    activeRoomData?.messages.map((msg, idx) => (
                      <div key={msg.id} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'} group`}>
                        {!msg.isSelf && <span className="text-xs text-slate-500 mb-1 ml-1 flex items-center">
                          {msg.isNPC && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] mr-1 font-bold">NPC</span>}
                          {msg.sender}
                        </span>}
                        <div className="flex items-center">
                          {msg.isSelf && (
                            <button onClick={() => handleRecallMessage(activeRoomData.id, msg.id)} className="opacity-0 group-hover:opacity-100 mr-2 p-1 text-slate-400 hover:text-rose-500 transition-opacity">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <div className={`max-w-[70%] p-3 rounded-2xl ${msg.isSelf ? 'bg-emerald-600 text-white rounded-tr-sm' : msg.isNPC ? 'bg-blue-50 border border-blue-100 text-slate-800 rounded-tl-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 mx-1">{msg.time}</span>
                      </div>
                    ))
                  )}
                  {isNPCTyping && (
                    <div className="flex flex-col items-start">
                       <span className="text-xs text-slate-500 mb-1 ml-1 flex items-center">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] mr-1 font-bold">NPC</span>
                          NPC
                        </span>
                      <div className="max-w-[70%] p-3 rounded-2xl bg-blue-50 border border-blue-100 text-slate-800 rounded-tl-sm flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-sm text-slate-500">đang trả lời...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                      placeholder="Nhập tin nhắn..." 
                    />
                    <button onClick={handleSendMessage} className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
