import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import ExamSimulator from "./pages/ExamSimulator";
import KnowledgeSynthesis from "./pages/Knowledge";
import VirtualPatient from "./pages/VirtualPatient";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/exam" element={<ExamSimulator />} />
          <Route path="/knowledge" element={<KnowledgeSynthesis />} />
          <Route path="/patient" element={<VirtualPatient />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}
