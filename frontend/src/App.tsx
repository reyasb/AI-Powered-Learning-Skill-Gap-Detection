import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { Home } from './pages/Home';
import { CourseCatalogue } from './pages/CourseCatalogue';
import { CourseDetail } from './pages/CourseDetail';
import { CourseLearn } from './pages/CourseLearn';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Protected Student Pages
import { Onboarding } from './pages/Onboarding';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { MyLearning } from './pages/MyLearning';
import { ResumeAnalysis } from './pages/ResumeAnalysis';
import { CareerExplorer } from './pages/CareerExplorer';
import { SkillAssessment } from './pages/SkillAssessment';
import { SkillGapAnalysis } from './pages/SkillGapAnalysis';
import { LearningRoadmap } from './pages/LearningRoadmap';
import { LearningLibrary } from './pages/LearningLibrary';
import { AILearningAssistant } from './pages/AILearningAssistant';
import { AIQuizGenerator } from './pages/AIQuizGenerator';
import { ProgressAnalytics } from './pages/ProgressAnalytics';
import { Settings } from './pages/Settings';
import { AdminPortal } from './pages/AdminPortal';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080912] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080912] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<CourseCatalogue />} />
      <Route path="/courses/:courseId" element={<CourseDetail />} />
      <Route path="/learn/:courseId" element={<CourseLearn />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* 2. ONBOARDING */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* 3. PROTECTED STUDENT WORKSPACE (Inside DashboardLayout) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<OverviewDashboard />} />
        <Route path="/my-learning" element={<MyLearning />} />
        <Route path="/profile" element={<Settings />} />

        {/* Resume Analysis */}
        <Route path="/resume-analysis" element={<ResumeAnalysis />} />
        <Route path="/resume" element={<ResumeAnalysis />} />

        {/* Career Explorer */}
        <Route path="/careers" element={<CareerExplorer />} />

        {/* Skill Assessments */}
        <Route path="/skill-assessment" element={<SkillAssessment />} />
        <Route path="/assessments" element={<SkillAssessment />} />

        {/* Skill Gaps & Roadmap */}
        <Route path="/skill-gaps" element={<SkillGapAnalysis />} />
        <Route path="/roadmap" element={<LearningRoadmap />} />

        {/* Learning Library */}
        <Route path="/learning-library" element={<LearningLibrary />} />
        <Route path="/library" element={<LearningLibrary />} />

        {/* AI Learning Assistant */}
        <Route path="/ai-tutor" element={<AILearningAssistant />} />
        <Route path="/assistant" element={<AILearningAssistant />} />

        {/* AI Quiz Generator */}
        <Route path="/quiz-generator" element={<AIQuizGenerator />} />
        <Route path="/quizzes" element={<AIQuizGenerator />} />
        <Route path="/quiz/:quizId" element={<AIQuizGenerator />} />

        {/* Analytics & Settings */}
        <Route path="/analytics" element={<ProgressAnalytics />} />
        <Route path="/settings" element={<Settings />} />

        {/* 4. PROTECTED ADMIN PORTAL */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/skills"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/careers"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
