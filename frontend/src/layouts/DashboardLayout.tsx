import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationPopover } from '../components/NotificationPopover';
import {
  LayoutDashboard,
  User,
  FileText,
  Compass,
  CheckSquare,
  BarChart2,
  Map,
  BookOpen,
  Bot,
  HelpCircle,
  TrendingUp,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Search,
  Globe,
  GraduationCap,
  Layers,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Learning', path: '/my-learning', icon: GraduationCap, badge: 'Courses' },
    { name: 'Course Catalogue', path: '/courses', icon: BookOpen },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Resume Analysis', path: '/resume-analysis', icon: FileText },
    { name: 'Career Explorer', path: '/careers', icon: Compass },
    { name: 'Skill Assessment', path: '/skill-assessment', icon: CheckSquare },
    { name: 'Skill Gap Analysis', path: '/skill-gaps', icon: BarChart2 },
    { name: 'Learning Roadmap', path: '/roadmap', icon: Map },
    { name: 'Learning Library', path: '/learning-library', icon: Layers },
    { name: 'AI Learning Assistant', path: '/ai-tutor', icon: Bot, badge: 'RAG' },
    { name: 'AI Quiz Generator', path: '/quiz-generator', icon: HelpCircle, badge: 'AI' },
    { name: 'Progress Analytics', path: '/analytics', icon: TrendingUp },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Portal', path: '/admin', icon: ShieldAlert, badge: 'Admin' });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const getPageTitle = () => {
    const current = navItems.find((item) => location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)));
    return current ? current.name : 'Workspace';
  };

  return (
    <div className="flex min-h-screen bg-[#080912] text-gray-100 font-sans selection:bg-violet-500/30 selection:text-white">
      
      {/* Desktop Sidebar (Collapsible) */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0D1020] border-r border-[#252A40] sticky top-0 h-screen z-30 transition-all duration-300 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-[#252A40]">
          <Link to="/" className="flex items-center space-x-3 overflow-hidden group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-400 p-0.5 shadow-neon-violet shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0D1020] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                  SkillMap AI
                </h1>
                <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">
                  Workspace
                </p>
              </div>
            )}
          </Link>

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#181D33] transition-colors focus:outline-none"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links with Independent Vertical Scrolling */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-neon-violet'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#141829]'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] font-semibold font-mono px-1.5 py-0.5 rounded-full ${
                      item.badge === 'Admin'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Pill & Logout in Footer */}
        <div className="p-3 border-t border-[#252A40] bg-[#0A0C16]">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-neon-violet">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-gray-200 truncate max-w-[105px]">
                    {user?.full_name || 'Student'}
                  </p>
                  <span className="text-[10px] text-gray-500 truncate block capitalize font-mono">
                    {user?.role || 'Student'}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-[#0D1020]/95 backdrop-blur-md border-b border-[#252A40] sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
          
          {/* Left: Mobile hamburger & Breadcrumb */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#141829]"
              aria-label="Open navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Workspace
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-gray-200 font-semibold truncate max-w-[160px] sm:max-w-none">
                {getPageTitle()}
              </span>
            </nav>
          </div>

          {/* Right: Search, Public Link, Notifications, Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Global Search in Topbar */}
            <form onSubmit={handleGlobalSearch} className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search courses, skills..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-[#111426] text-xs text-gray-200 pl-9 pr-3 py-1.5 rounded-xl border border-[#252A40] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 w-44 transition-all focus:w-60"
              />
            </form>

            {/* Public Website Button */}
            <Link
              to="/"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-[#141829] border border-[#252A40] hover:border-violet-500/40 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Public Website</span>
            </Link>

            {/* Notification Popover */}
            <NotificationPopover />

            {/* User Profile Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 sm:px-2 py-1 rounded-xl hover:bg-[#141829] transition-colors focus:outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-bold text-white text-xs">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-200 truncate max-w-[90px]">
                    {user?.full_name || 'Student'}
                  </span>
                  <span className="text-[10px] text-violet-400 font-mono capitalize -mt-0.5">
                    {user?.role || 'Student'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#111426] border border-[#252A40] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-[#252A40]">
                    <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-violet-600/10"
                  >
                    <User className="w-3.5 h-3.5 text-violet-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/my-learning"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-violet-600/10"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Enrolled Courses</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-violet-600/10"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-400" />
                    <span>Account Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 text-left border-t border-[#252A40] mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0D1020] border-r border-[#252A40] p-4 z-10 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#252A40]">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-white text-base">SkillMap AI</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#181D33]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-neon-violet'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-[#141829]'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="pt-3 border-t border-[#252A40] flex items-center justify-between">
                <Link
                  to="/"
                  className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public Site</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
