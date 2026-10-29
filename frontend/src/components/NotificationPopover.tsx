import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, BookOpen, Award, FileText, X } from 'lucide-react';
import { assessmentService, courseService, resumeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface NotificationItem {
  id: string;
  type: 'course' | 'assessment' | 'resume';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export const NotificationPopover: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const items: NotificationItem[] = [];

      // Fetch enrolled courses
      try {
        const myLearningRes = await courseService.getMyLearning();
        myLearningRes.data.slice(0, 2).forEach((c: any) => {
          items.push({
            id: `course-${c.course_id}`,
            type: 'course',
            title: `Enrolled: ${c.title}`,
            description: `Progress: ${c.progress_percentage}% completed (${c.completed_lessons_count}/${c.lesson_count} lessons)`,
            time: 'Active',
            read: false,
          });
        });
      } catch (e) {
        // quiet ignore
      }

      // Fetch assessment history
      try {
        const historyRes = await assessmentService.getHistory();
        historyRes.data.slice(0, 2).forEach((h: any) => {
          items.push({
            id: `ass-${h.id}`,
            type: 'assessment',
            title: `Assessment Attempt`,
            description: `Scored ${h.score}% (${h.correct_count}/${h.total_questions}) on ${new Date(h.completed_at).toLocaleDateString()}`,
            time: 'Evaluated',
            read: false,
          });
        });
      } catch (e) {
        // quiet ignore
      }

      // Fetch resumes
      try {
        const resumeRes = await resumeService.listResumes();
        if (resumeRes.data.length > 0) {
          const r = resumeRes.data[0];
          items.push({
            id: `resume-${r.id}`,
            type: 'resume',
            title: `Resume Parsed: ${r.filename}`,
            description: `${(r.confirmed_skills?.length || r.extracted_skills?.length || 0)} skills detected in profile`,
            time: 'Verified',
            read: false,
          });
        }
      } catch (e) {
        // quiet ignore
      }

      setNotifications(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-[#141829] rounded-xl transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500/40"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-neon-cyan animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111426] border border-[#252A40] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-4 border-b border-[#252A40] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-[#1F2438] custom-scrollbar">
            {loading ? (
              <div className="p-6 text-center text-xs text-gray-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center">
                <Bell className="w-8 h-8 text-gray-600 mb-2" />
                <p className="font-semibold text-gray-300">All caught up!</p>
                <p className="text-[11px] text-gray-500 mt-1">No pending alerts or notifications.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start space-x-3 hover:bg-[#141829] transition-colors ${
                    !item.read ? 'bg-violet-950/10' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[#181D33] text-gray-300 shrink-0 mt-0.5">
                    {item.type === 'course' && <BookOpen className="w-3.5 h-3.5 text-cyan-400" />}
                    {item.type === 'assessment' && <Award className="w-3.5 h-3.5 text-violet-400" />}
                    {item.type === 'resume' && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                    <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{item.description}</p>
                    <span className="text-[10px] text-gray-500 font-mono mt-1 block">{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
