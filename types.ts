
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
  blogSlug?: string;
}

export interface PatentItem {
  title: string;
  number: string;
  doi: string;
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
  images?: string[];
  hidden?: boolean;
}

export interface StudyClubItem {
  title: string;
  tags: string[];
  url?: string;
}

export interface PublicationItem {
  title: string;
  authors: string;
  venue: string;
  year: string;
  type: 'PhD Dissertation' | 'Master Thesis' | 'International Journal' | 'Domestic Journal' | 'International Conference' | 'Domestic Conference';
}

export interface CommunityItem {
  title: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
}
