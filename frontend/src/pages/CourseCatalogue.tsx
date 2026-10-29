import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { courseService } from '../services/api';
import type { CourseCard, CourseCategory } from '../types';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Layers,
  Star,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

export const CourseCatalogue: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    fetchCoursesAndCategories();
  }, []);

  // Update query params when search or category changes
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory !== 'All') params.category = selectedCategory;
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory]);

  const fetchCoursesAndCategories = async () => {
    try {
      setLoading(true);
      const [coursesRes, catRes] = await Promise.all([
        courseService.listCourses(),
        courseService.getCategories(),
      ]);
      setCourses(coursesRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load course catalogue', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSortBy('featured');
    setSearchParams({}, { replace: true });
  };

  // Filter & Sort Logic
  const filteredCourses = courses.filter((course) => {
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = course.title.toLowerCase().includes(q);
      const matchDesc = course.short_description.toLowerCase().includes(q);
      const matchCat = course.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    // Category match
    if (selectedCategory !== 'All' && course.category !== selectedCategory) {
      return false;
    }

    // Difficulty match
    if (selectedDifficulty !== 'All' && course.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Sort
  filteredCourses.sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'duration_asc') return a.duration_hours - b.duration_hours;
    if (sortBy === 'duration_desc') return b.duration_hours - a.duration_hours;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
  });

  return (
    <div className="min-h-screen bg-[#080912] text-gray-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white">
      <PublicNavbar />

      {/* Catalogue Header */}
      <div className="bg-gradient-to-b from-[#101321] to-[#080912] border-b border-[#1F2438] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Full Curriculum Catalogue</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Explore All Courses & Syllabi
            </h1>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Master the foundational algorithms, full stack engineering, artificial intelligence, and cloud systems required to crack top engineering positions.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by course name, topic, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#101321] text-xs text-gray-200 placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 border border-[#1F2438] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter courses by category"
                className="w-full bg-[#101321] text-xs text-gray-200 rounded-xl px-3.5 py-3 border border-[#1F2438] focus:border-violet-500 focus:outline-none"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Dropdown */}
            <div className="md:col-span-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                aria-label="Filter courses by difficulty level"
                className="w-full bg-[#101321] text-xs text-gray-200 rounded-xl px-3.5 py-3 border border-[#1F2438] focus:border-violet-500 focus:outline-none"
              >
                <option value="All">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort courses"
                className="w-full bg-[#101321] text-xs text-gray-200 rounded-xl px-3.5 py-3 border border-[#1F2438] focus:border-violet-500 focus:outline-none"
              >
                <option value="featured">Featured First</option>
                <option value="rating">Highest Rated</option>
                <option value="duration_desc">Longest Duration</option>
                <option value="duration_asc">Shortest Duration</option>
                <option value="title">Course Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Course List */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Results summary and reset */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1F2438]">
          <div className="text-xs text-gray-400 font-medium">
            Showing <span className="text-white font-bold">{filteredCourses.length}</span> of {courses.length} courses
            {selectedCategory !== 'All' && <span> in <strong className="text-violet-300">{selectedCategory}</strong></span>}
            {selectedDifficulty !== 'All' && <span> • <strong className="text-cyan-300 capitalize">{selectedDifficulty}</strong></span>}
          </div>

          {(searchQuery || selectedCategory !== 'All' || selectedDifficulty !== 'All' || sortBy !== 'featured') && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 bg-[#101321] rounded-2xl border border-[#1F2438] animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-[#101321] rounded-3xl border border-[#1F2438] p-8 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Courses Found</h3>
            <p className="text-xs text-gray-400 mb-6">
              We couldn't find any courses matching your current search criteria. Try modifying your keywords or filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-neon-violet transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-[#101321] rounded-2xl border border-[#1F2438] hover:border-violet-500/50 hover:shadow-neon-violet transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
                      {course.category}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                      {course.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-2">
                    {course.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                    {course.short_description}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 py-3 border-y border-[#1F2438]">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>{course.duration_hours}h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-gray-500" />
                      <span>{course.lesson_count} lessons</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-white font-medium">{course.rating.toFixed(1)}</span>
                    </div>
                    <div className="ml-auto">
                      <span className="capitalize text-[10px] px-2 py-0.5 rounded bg-[#181D33] text-gray-300">
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#0D0F1B] border-t border-[#1F2438] flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium truncate max-w-[140px]">
                    {course.instructor_name || 'SkillMap Team'}
                  </span>
                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      to={`/courses/${course.slug}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white bg-[#141829] hover:bg-[#1C223D] border border-[#1F2438] transition-colors"
                    >
                      Syllabus
                    </Link>
                    <Link
                      to={`/learn/${course.id}`}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-all flex items-center space-x-1"
                    >
                      <span>Start</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
