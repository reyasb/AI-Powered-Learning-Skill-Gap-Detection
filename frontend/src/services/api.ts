
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://skillmap-ai-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillmap_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional auto-redirect to login if unauthorized
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        localStorage.removeItem('skillmap_token');
        localStorage.removeItem('skillmap_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

export const profileService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: any) => api.put('/profile', data),
  completeOnboarding: (data: any) => api.post('/profile/onboard', data),
  deleteAccount: () => api.delete('/profile/account'),
};

export const resumeService = {
  uploadResume: (file: File, career_id?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (career_id) {
      formData.append('career_id', career_id.toString());
    }
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  reanalyzeResume: (id: number, career_id: number) =>
    api.post(`/resumes/${id}/analyze`, null, { params: { career_id } }),
  listResumes: () => api.get('/resumes'),
  getResume: (id: number) => api.get(`/resumes/${id}`),
  confirmSkills: (id: number, skills: string[]) =>
    api.post(`/resumes/${id}/confirm`, { skills }),
  deleteResume: (id: number) => api.delete(`/resumes/${id}`),
};

export const careerService = {
  listCareers: () => api.get('/careers'),
  getCareer: (id: number) => api.get(`/careers/${id}`),
  selectTargetCareer: (id: number) =>
    api.post(`/careers/${id}/select-target`),
};

export const skillService = {
  listSkills: (category?: string) =>
    api.get('/skills', { params: { category } }),
  getMySkills: () => api.get('/skills/my-skills'),
  getSkillGaps: (career_id?: number) =>
    api.get('/skills/gaps', { params: { career_id } }),
  getReadiness: (career_id?: number) =>
    api.get('/skills/readiness', { params: { career_id } }),
};

export const assessmentService = {
  listAssessments: () => api.get('/assessments'),
  getAssessment: (id: number) => api.get(`/assessments/${id}`),
  createCustomAssessment: (data: {
    career_id?: number;
    skill_id?: number;
    difficulty?: string;
    question_count?: number;
  }) => api.post('/assessments/custom', data),
  submitAssessment: (
    id: number,
    answers: Array<{ question_id: number; selected_option: string }>,
    time_spent_seconds: number
  ) => api.post(`/assessments/${id}/submit`, { answers, time_spent_seconds }),
  getHistory: () => api.get('/assessments/history'),
};

export const roadmapService = {
  getRoadmap: (career_id?: number) =>
    api.get('/roadmap', { params: { career_id } }),
  recalculateRoadmap: (career_id?: number) =>
    api.post('/roadmap/recalculate', null, { params: { career_id } }),
  updateActivityStatus: (id: number, status: string) =>
    api.patch(`/roadmap/activities/${id}`, { status }),
};

export const resourceService = {
  listResources: (params?: {
    skill_id?: number;
    difficulty?: string;
    search?: string;
  }) => api.get('/resources', { params }),
};

export const documentService = {
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  listDocuments: () => api.get('/documents'),
  deleteDocument: (id: number) => api.delete(`/documents/${id}`),
};

export const learningService = {
  sendChatMessage: (
    message: string,
    conversation_id?: number,
    document_ids?: number[]
  ) => api.post('/learning/chat', { message, conversation_id, document_ids }),
  listConversations: () => api.get('/learning/conversations'),
  getConversation: (id: number) => api.get(`/learning/conversations/${id}`),
};

export const quizService = {
  generateQuiz: (data: {
    document_id?: number;
    skill_id?: number;
    topic?: string;
    total_questions?: number;
    difficulty?: string;
  }) => api.post('/quizzes/generate', data),
  listQuizzes: () => api.get('/quizzes'),
  getQuiz: (id: number) => api.get(`/quizzes/${id}`),
  submitQuiz: (
    id: number,
    answers: Array<{ question_id: number; selected_option: string }>
  ) => api.post(`/quizzes/${id}/submit`, { answers }),
  getHistory: () => api.get('/quizzes/history'),
};

export const analyticsService = {
  getDashboardAnalytics: (career_id?: number) =>
    api.get('/analytics/dashboard', { params: { career_id } }),
  downloadCsvReport: (career_id?: number) =>
    api.get('/analytics/report/csv', {
      params: { career_id },
      responseType: 'blob',
    }),
};

export const adminService = {
  getMetrics: () => api.get('/admin/metrics'),
  createCareer: (data: any) => api.post('/admin/careers', data),
  createSkill: (data: any) => api.post('/admin/skills', data),
  updateRequirement: (data: any) => api.post('/admin/requirements', data),
};

export const courseService = {
  listCourses: (params?: {
    category?: string;
    difficulty?: string;
    search?: string;
    sort_by?: string;
  }) => api.get('/courses', { params }),
  getFeaturedCourses: () => api.get('/courses/featured'),
  getCategories: () => api.get('/courses/categories'),
  getMyLearning: () => api.get('/courses/my-learning'),
  getCourse: (id_or_slug: string | number) =>
    api.get(`/courses/${id_or_slug}`),
  enrollCourse: (id: number) => api.post(`/courses/${id}/enroll`),
  getCourseLearn: (id: number) => api.get(`/courses/${id}/learn`),
  completeLesson: (courseId: number, lessonId: number) =>
    api.post(`/courses/${courseId}/lessons/${lessonId}/complete`),
};

export default api;
