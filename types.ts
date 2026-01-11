
export interface CareerItem {
  period: string;
  company: string;
  role: string;
  description?: string;
}

export interface EducationItem {
  period: string;
  school: string;
  degree: string;
  description?: string;
}

export interface ProjectDetail {
  overview: string;
  keyFeatures: string[];
  techStack: string[];
  achievements?: string[];
  videoUrl?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  organization: string;
  period: string;
  thumbnail?: string;
  details?: ProjectDetail;
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
}
