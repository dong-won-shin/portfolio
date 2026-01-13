
export interface CareerItem {
  period: string;
  company: string;
  role: string;
  description?: string;
  badge?: string;
}

export interface EducationItem {
  period: string;
  school: string;
  degree: string;
  description?: string;
}

export interface ProjectDetail {
  overview: string;
  contributions: string[];
  techStack: string[];
  achievements?: string[];
  videoUrl?: string;
  images?: string[];
  pdfUrl?: string;
  link?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  organization: string;
  period: string;
  thumbnail?: string;
  details?: ProjectDetail;
  hidden?: boolean;
}

export interface PatentItem {
  title: string;
  number: string;
  status: 'Registered' | 'Pending';
  country: string;
}

export interface MediaItem {
  title: string;
  source: string;
  date: string;
  link: string;
  thumbnail?: string;
  details?: ProjectDetail;
}

export interface LectureItem {
  title: string;
  tags: string[];
  date: string;
  organization: string;
}

export interface StudyClubItem {
  title: string;
  tags: string[];
}
