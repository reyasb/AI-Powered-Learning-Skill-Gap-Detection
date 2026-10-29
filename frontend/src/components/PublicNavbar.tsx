import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Search,
  BookOpen,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  Shield,
  Compass
} from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/courses');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#080912]/95 backdrop-blur-md border-b border-[#252A40]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: SkillMap AI Brand */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-400 p-0.5 shadow-neon-violet group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-[#0D1020] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent leading-none">
                  SkillMap<span className="text-white font-mono text-xs ml-1 px-1 py-0.5 rounded bg-violet-600/30 border border-violet-500/30">AI</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">
                  AI-Powered Learning
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Search Field + Primary Nav Links (Courses | Career Paths | Assessments | About) */}
          <div className="hidden lg:flex items-center space-x-6 flex-1 max-w-2xl mx-8">
            {/* Global Search Field */}
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search courses, skills, careers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111426] text-xs text-gray-200 placeholder-gray-500 rounded-xl pl-9 pr-3 py-2 border border-[#252A40] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all"
              />
            </form>

            {/* 4 Navigation Labels */}
            <nav className="flex items-center space-x-1 shrink-0">
              <Link
                to="/courses"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/courses')
                    ? 'text-violet-400 bg-violet-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-[#141829]'
                }`}
              >
                Courses
              </Link>
              <Link
                to="/careers"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/careers')
                    ? 'text-violet-400 bg-violet-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-[#141829]'
                }`}
              >
                Career Paths
              </Link>
              <Link
                to="/skill-assessment"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/skill-assessment')
                    ? 'text-violet-400 bg-violet-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-[#141829]'
                }`}
              >
                Assessments
              </Link>
              <Link
                to="/about"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/about')
                    ? 'text-violet-400 bg-violet-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-[#141829]'
                }`}
              >
                About
              </Link>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="hidden sm:flex items-center space-x-3 shrink-0">
            {user ? (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/my-learning"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-500/50 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>My Learning</span>
                </Link>

                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-neon-violet transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-[#111426] border border-[#252A40] hover:border-violet-500/50 text-gray-200 text-xs focus:outline-none"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 text-white flex items-center justify-center font-bold text-[11px] uppercase">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <span className="max-w-[80px] truncate text-xs font-medium">{user.full_name || user.email}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#111426] border border-[#252A40] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3.5 py-2 border-b border-[#252A40]">
                        <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-violet-600/30 text-violet-300 border border-violet-500/30">
                          {user.role}
                        </span>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-violet-600/10"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-violet-400" />
                        <span>Student Dashboard</span>
                      </Link>
                      <Link
                        to="/my-learning"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-violet-600/10"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Enrolled Courses</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3.5 py-2 text-xs text-gray-300 hover:text-white hover:bg-violet-600/10"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span>Settings</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-3.5 py-2 text-xs text-amber-300 hover:text-white hover:bg-amber-600/10"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
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
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl shadow-neon-violet transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#141829] focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D1020] border-b border-[#252A40] px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses, skills, careers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111426] text-xs text-gray-200 placeholder-gray-500 rounded-xl pl-9 pr-4 py-2 border border-[#252A40] focus:outline-none focus:border-violet-500"
            />
          </form>

          <Link
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#141829]"
          >
            Courses
          </Link>
          <Link
            to="/careers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#141829]"
          >
            Career Paths
          </Link>
          <Link
            to="/skill-assessment"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#141829]"
          >
            Assessments
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#141829]"
          >
            About
          </Link>

          <div className="pt-4 border-t border-[#252A40] space-y-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-neon-violet"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Student Dashboard</span>
                </Link>
                <Link
                  to="/my-learning"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>My Learning</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 text-xs text-rose-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-gray-300 bg-[#141829] rounded-xl border border-[#252A40]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-white bg-violet-600 rounded-xl shadow-neon-violet"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
