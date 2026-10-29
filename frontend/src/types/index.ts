export type UserRole = 'student' | 'admin';

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  onboarded?: boolean;
};

export type StudentProfile = {
  user_id: number;
  email: string;
  full_name: string;
  role: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduation_year?: number;
  bio?: string;
  target_career_id?: number;
  target_career?: {
    id: number;
    title: string;
    slug: string;
    category: string;
  };
  learning_pace: string;
  weekly_learning_hours: number;
  preferred_learning_style: string;
  onboarded: boolean;
};

export type SkillGapItem = {
  skill_id: number;
  skill_name: string;
  category: string;
  current_proficiency: number;
  required_proficiency: number;
  gap: number;
  gap_percentage: number;
  importance_weight: number;
  priority_score: number;
  severity: 'critical' | 'moderate' | 'strong';
  rationale?: string;
  prerequisites_met: boolean;
  missing_prerequisites: string[];
};

export type CareerReadiness = {
  career_id: number;
  career_title: string;
  readiness_score: number;
  total_required_skills: number;
  assessed_skills_count: number;
  strong_skills_count: number;
  moderate_gap_count: number;
  critical_gap_count: number;
  skill_gaps: SkillGapItem[];
};

export type CareerRole = {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  required_skills_count?: number;
  suggested_topics: string[];
  sample_projects: string[];
  required_skills?: Array<{
    skill_id: number;
    name: string;
    category: string;
    required_proficiency: number;
    importance_weight: number;
    rationale?: string;
  }>;
};

export type RoadmapActivity = {
  id: number;
  skill_id: number;
  skill_name: string;
  topic: string;
  learning_objective: string;
  difficulty: string;
  recommended_order: number;
  estimated_duration_minutes: number;
  resource_title?: string;
  resource_type?: string;
  resource_url?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at?: string;
};

export type LearningResource = {
  id: number;
  title: string;
  skill_id?: number;
  skill_name: string;
  topic: string;
  resource_type: string;
  url?: string;
  duration_minutes: number;
  difficulty: string;
  description?: string;
};

export type UploadedDocument = {
  id: number;
  filename: string;
  file_size_bytes: number;
  char_count: number;
  chunk_count: number;
  uploaded_at: string;
};

export type AssessmentQuestion = {
  id: number;
  skill_id?: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty: string;
};

export type AssessmentItem = {
  id: number;
  title: string;
  description?: string;
  career_id?: number;
  difficulty: string;
  duration_minutes: number;
  total_questions: number;
};

export type Lesson = {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  lesson_order: number;
  duration_minutes: number;
  content_type: string;
  content_body: string;
  video_url?: string;
  key_takeaways: string[];
  completed?: boolean;
};

export type CourseCard = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  estimated_weeks: number;
  thumbnail_url?: string;
  badge: string;
  rating: number;
  instructor_name?: string;
  is_featured: boolean;
  lesson_count: number;
  enrolled?: boolean;
  progress_percentage?: number;
};

export type CourseDetail = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  estimated_weeks: number;
  thumbnail_url?: string;
  badge: string;
  rating: number;
  instructor_name?: string;
  is_featured: boolean;
  learning_outcomes: string[];
  prerequisites_text?: string;
  career_role_id?: number;
  career_role_title?: string;
  skills_covered: string[];
  lessons: Lesson[];
  enrolled: boolean;
  progress_percentage: number;
  completed_lessons_count: number;
};

export type CourseCategory = {
  category: string;
  count: number;
};

export type EnrolledCourse = {
  course_id: number;
  title: string;
  slug: string;
  short_description: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  thumbnail_url?: string;
  lesson_count: number;
  completed_lessons_count: number;
  progress_percentage: number;
  enrolled_at: string;
  last_accessed_at: string;
  status: string;
  next_lesson?: {
    id: number;
    title: string;
    lesson_order: number;
  };
};

export type CourseLearnData = {
  course: {
    id: number;
    title: string;
    slug: string;
    category: string;
    difficulty: string;
    duration_hours: number;
  };
  lessons: Lesson[];
  completed_count: number;
  total_lessons: number;
  progress_percentage: number;
  current_lesson_id?: number;
};

