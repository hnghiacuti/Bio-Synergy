import { Link, useLocation } from "react-router-dom";
import { Activity, Users, BookOpen, BrainCircuit, Stethoscope, Menu, X } from "lucide-react";
import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

const navigation = [
  { name: "Bio-Digital Twin", href: "/", icon: Activity },
  { name: "Bio-Threads", href: "/community", icon: Users },
  { name: "Exam-Solver", href: "/exam", icon: BookOpen },
  { name: "Knowledge Synthesis", href: "/knowledge", icon: BrainCircuit },
  { name: "Virtual Patient", href: "/patient", icon: Stethoscope },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden block">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/80" 
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
                <span className="text-xl font-bold text-emerald-600">BIO-SYNERGY</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon
                        className={cn("mr-3 flex-shrink-0 h-5 w-5", isActive ? "text-emerald-600" : "text-slate-400")}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white">
        <div className="flex items-center h-16 px-6 border-b border-slate-100">
          <Activity className="w-6 h-6 text-emerald-600 mr-2" />
          <span className="text-xl font-bold text-slate-900 tracking-tight">BIO-SYNERGY</span>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                      isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 w-1 h-8 bg-emerald-600 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-100">
            <Link to="/profile" className="flex items-center px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm group-hover:bg-emerald-200 transition-colors">
                YG
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">Young Guru</p>
                <p className="text-xs text-slate-500">Học sinh THPT</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-72 min-h-screen">
        <div className="sticky top-0 z-10 flex items-center h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-600 rounded-lg hover:bg-slate-50"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold text-slate-900">BIO-SYNERGY</span>
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
