
import React, { useState, useEffect } from 'react';
import {
  Mail,
  Linkedin,
  ChevronRight,
  Cpu,
  Menu,
  X,
  Calendar,
  Building2,
  ExternalLink,
  CheckCircle2,
  ArrowLeft,
  Globe,
  Play,
  GraduationCap,
  Award,
  Download,
  Gift
} from 'lucide-react';
import {
  CAREER_DATA,
  EDUCATION_DATA,
  INTERESTS,
  TECHNICAL_SKILLS,
  PROJECTS,
  TECHNICAL_WRITING,
  MEDIA,
  LECTURES,
  STUDY_CLUBS,
  PUBLICATIONS,
  PATENTS,
  COMMUNITY
} from './data';
import { ProjectItem, MediaItem, LectureItem } from './types';

const Section: React.FC<{ title: string; id: string; children: React.ReactNode }> = ({ title, id, children }) => (
  <section id={id} className="scroll-mt-20 py-10 border-b border-slate-100 last:border-0">
    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 group">
      <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
      {title}
      <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-40 transition-opacity" />
    </h2>
    <div className="space-y-6">
      {children}
    </div>
  </section>
);

const ImageLightbox: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={imageUrl}
        alt="Full size view"
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

const LectureModal: React.FC<{ lecture: LectureItem; onClose: () => void }> = ({ lecture, onClose }) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (lightboxImage) {
          event.stopPropagation();
          setLightboxImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [lightboxImage, onClose]);

  if (!lecture.images || lecture.images.length === 0) return null;

  return (
    <>
      {lightboxImage && <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 slide-in-from-bottom-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-8">
            <button
              onClick={onClose}
              className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="mt-8">
              <span className="px-2 py-0.5 bg-white/20 text-[10px] font-black text-white rounded uppercase tracking-widest">
                Lecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mt-3">
                {lecture.title}
              </h2>
              <div className="flex flex-wrap gap-4 mt-4 text-white/80 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {lecture.organization}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {lecture.date}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 sm:p-12">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-6">Gallery</h4>
            <div className={lecture.images.length === 1 ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 gap-6"}>
              {lecture.images.map((image: string, i: number) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => setLightboxImage(image)}
                >
                  <img
                    src={image}
                    alt={`${lecture.title} - ${i + 1}`}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ProjectModal: React.FC<{ project: ProjectItem | MediaItem; onClose: () => void }> = ({ project, onClose }) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (lightboxImage) {
          event.stopPropagation();
          setLightboxImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [lightboxImage, onClose]);

  if (!project.details) return null;

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1&autoplay=1&mute=1`;
    }
    return url;
  };

  const isYouTube = project.details.videoUrl?.includes('youtube.com') || project.details.videoUrl?.includes('youtu.be');
  const finalVideoUrl = project.details.videoUrl ? getEmbedUrl(project.details.videoUrl) : '';

  return (
    <>
      {lightboxImage && <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 slide-in-from-bottom-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-48 sm:h-64 shrink-0">
          <img 
            src={project.thumbnail} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="absolute bottom-6 left-8 right-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-600 text-[10px] font-black text-white rounded uppercase tracking-widest">
                {'organization' in project ? 'Project Detail' : 'Media Detail'}
              </span>
              {'organization' in project && (
                <span className="text-white/60 text-xs font-bold tracking-tight">
                  {project.organization}
                </span>
              )}
              {'source' in project && (
                <span className="text-white/60 text-xs font-bold tracking-tight">
                  {project.source}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
              {project.title}
            </h2>
          </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              {project.details.images && project.details.images.length > 0 && (
                <section>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Gallery</h4>
                  <div className={project.details.images.length === 1 ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                    {project.details.images.map((image: string, i: number) => (
                      <div
                        key={i}
                        className="rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => setLightboxImage(image)}
                      >
                        <img
                          src={image}
                          alt={`${project.title} - ${i + 1}`}
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {project.details.pdfUrl && (
                <section>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4">E-book Preview</h4>
                  <div className="rounded-2xl overflow-hidden bg-slate-50 shadow-lg border border-slate-200" style={{ height: '600px' }}>
                    <iframe
                      src={project.details.pdfUrl}
                      className="w-full h-full"
                      title="PDF Viewer"
                    />
                  </div>
                </section>
              )}

              {project.details.videoUrl && (
                <section>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Project Demo</h4>
                  <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-lg border border-slate-100">
                    {isYouTube ? (
                      <iframe
                        className="w-full h-full"
                        src={finalVideoUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video
                        controls
                        autoPlay
                        muted
                        loop
                        className="w-full h-full"
                        poster={project.thumbnail}
                      >
                        <source src={project.details.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </section>
              )}

              <section>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Project Overview</h4>
                <p className="text-slate-700 leading-relaxed text-lg">
                  {project.details.overview}
                </p>
              </section>

              <section>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Contributions</h4>
                <ul className="space-y-4">
                  {project.details.contributions.map((feature, i) => (
                    <li key={i} className="flex gap-3 text-slate-700 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="space-y-8">
              {'period' in project && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Timeline</h4>
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {project.period}
                  </div>
                </div>
              )}
              {'date' in project && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Date</h4>
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {project.date}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {project.details.techStack.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-black rounded-lg">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-3">
                {project.details.pdfUrl && (
                  <div className="space-y-3">
                    <a
                      href="https://www.dropbox.com/scl/fi/9h6c2lgkw3ugyj6jvna3u/SLAM.pdf?rlkey=2oqxqib0rw0buxi99meozk5jh&e=1&dl=0"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download E-book
                    </a>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-800 font-bold text-center">
                        Password: <span className="font-mono bg-amber-100 px-2 py-0.5 rounded">slamkr</span>
                      </p>
                    </div>
                  </div>
                )}
                {project.details.link && (
                  <a
                    href={project.details.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Read Article
                  </a>
                )}
                {'link' in project && project.link && project.link !== '#' && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Visit Course
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  Close Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | MediaItem | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<LectureItem | null>(null);
  const [showAllLectures, setShowAllLectures] = useState(false);
  const [showAllStudyClubs, setShowAllStudyClubs] = useState(false);
  const [showAllPublications, setShowAllPublications] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -40% 0px', threshold: [0, 0.2, 0.5] }
    );
    document.querySelectorAll('section[id]').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedProject]);

  const navLinks = [
    { name: 'Career', id: 'career' },
    { name: 'Education', id: 'education' },
    { name: 'Interests', id: 'interests' },
    { name: 'Skills', id: 'skills' },
    { name: 'Projects', id: 'projects' },
    { name: 'Technical Writing', id: 'technical-writing' },
    { name: 'Media', id: 'media' },
  ];

  const handleLinkClick = (id: string) => {
    setIsMenuOpen(false);
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const PROFILE_IMAGE_URL = "/images/profile.jpg";
  const RESEARCH_IMAGE_URL = "/images/research.png";
  const SKILLS_IMAGE_URL = "/images/skills.png";

  return (
    <div className="min-h-screen bg-white">
      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      {selectedLecture && <LectureModal lecture={selectedLecture} onClose={() => setSelectedLecture(null)} />}

      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#home" onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
            <span className="font-bold text-slate-900 tracking-tight hidden sm:block">Dong-Won Shin</span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => { e.preventDefault(); handleLinkClick(link.id); }}
                className={`text-sm font-medium transition-colors ${
                  activeSection === link.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 md:hidden pt-20 px-6">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => { e.preventDefault(); handleLinkClick(link.id); }}
                className={`text-2xl font-semibold transition-colors ${activeSection === link.id ? 'text-blue-600' : 'text-slate-900'}`}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <section id="home" className="mb-16 scroll-mt-32">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <div className="shrink-0 group relative">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-3 scale-[1.02] opacity-10 group-hover:rotate-6 transition-transform"></div>
              <img 
                src={PROFILE_IMAGE_URL} 
                alt="Dong-Won Shin Profile" 
                className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover shadow-2xl border-4 border-white relative z-10 transition-transform hover:-translate-y-1"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">Dong-Won Shin</h1>
              <p className="text-base md:text-base text-slate-600 mb-6 font-medium leading-snug max-w-2xl">
                Computer Vision & Deep Learning Engineer | Autonomous Driving | Mobile Robotics
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-4 items-center text-sm text-slate-600">
                <a href="mailto:celinachild@gmail.com" className="flex items-center gap-2 hover:text-blue-600 transition-colors"><Mail className="w-4 h-4" /> celinachild@gmail.com</a>
                <a href="https://www.linkedin.com/in/dong-won-shin-7a11b2240/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-blue-600 transition-colors"><Linkedin className="w-4 h-4" /> LinkedIn</a>
              </div>
            </div>
          </div>
        </section>

        <Section title="Career" id="career">
          <div className="space-y-8">
            {CAREER_DATA.map((item, idx) => {
              const companyLinks: { [key: string]: string } = {
                'StradVision': 'https://stradvision.com/_ENG/',
                'SOSLAB': 'https://soslab.co/en/'
              };
              const companyUrl = companyLinks[item.company];

              return (
                <div key={idx} className="flex flex-col md:flex-row md:gap-12 group">
                  <div className="w-48 shrink-0 text-slate-400 font-bold text-sm tracking-widest pt-1 uppercase mb-2 md:mb-0">{item.period}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-3">
                      {companyUrl ? (
                        <a
                          href={companyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {item.company}
                        </a>
                      ) : (
                        item.company
                      )}
                      {item.badge && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-lg uppercase tracking-tighter border border-amber-200 flex items-center gap-1.5 shadow-sm">
                          <Award className="w-3 h-3 text-amber-500 fill-amber-100" />
                          {item.badge}
                        </span>
                      )}
                    </h3>
                    <p className="text-blue-600 font-bold text-lg">{item.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Education" id="education">
          <div className="space-y-8">
            {EDUCATION_DATA.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:gap-12 group">
                <div className="w-48 shrink-0 text-slate-400 font-bold text-sm tracking-widest pt-1 uppercase mb-2 md:mb-0">{item.period}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{item.school}</h3>
                  <p className="text-slate-800 font-bold text-lg leading-snug">
                    {item.degree.split(' in ')[0]} <span className="font-medium text-slate-600 text-base">in {item.degree.split(' in ')[1]}</span>
                  </p>
                  {item.description && (
                    <p className="text-sm text-slate-500 mt-2 font-medium italic">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Research Interest" id="interests">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <ul className="space-y-3">
                {INTERESTS.map((interest, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium text-lg">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0">
              <img src={RESEARCH_IMAGE_URL} alt="Research Icons" className="max-w-[300px] h-auto transition-transform duration-300 hover:scale-110" />
            </div>
          </div>
        </Section>

        <Section title="Technical Skills & Experience" id="skills">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              {TECHNICAL_SKILLS.map((skill, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-slate-800 font-bold text-lg flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    {skill.label}: <span className="font-medium text-slate-600 ml-1">{skill.value}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="shrink-0">
              <img src={SKILLS_IMAGE_URL} alt="Tech Logos" className="max-w-[400px] h-auto shadow-sm rounded-xl transition-transform duration-300 hover:scale-110" />
            </div>
          </div>
        </Section>

        <Section title="Projects" id="projects">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.filter(p => !p.hidden).map((project, idx) => (
              <div
                key={idx}
                onClick={() => project.details && setSelectedProject(project)}
                className={`flex flex-col h-full border border-slate-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white group ${project.details ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-tight group-hover:text-blue-600">{project.title}</h3>
                  <p className="text-slate-600 text-xs mb-6 leading-relaxed line-clamp-2">{project.subtitle}</p>
                  <div className="mt-auto flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><Building2 className="w-3 h-3" />{project.organization}</div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><Calendar className="w-3 h-3" />{project.period}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Technical Writing" id="technical-writing">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECHNICAL_WRITING.map((project, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (project.details?.link) {
                    window.open(project.details.link, '_blank');
                  } else if (project.details) {
                    setSelectedProject(project);
                  }
                }}
                className={`flex flex-col h-full border border-slate-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white group ${(project.details?.link || project.details) ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-tight group-hover:text-blue-600">{project.title}</h3>
                  <p className="text-slate-600 text-xs mb-6 leading-relaxed line-clamp-2">{project.subtitle}</p>
                  <div className="mt-auto flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><Building2 className="w-3 h-3" />{project.organization}</div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><Calendar className="w-3 h-3" />{project.period}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Media" id="media">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MEDIA.map((item, idx) => (
              <div
                key={idx}
                onClick={() => item.details && setSelectedProject(item)}
                className={`flex flex-col border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all group bg-white ${item.details ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  {item.details && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-blue-600 fill-current ml-1" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="text-base font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 t ransition-colors line-clamp-2">{item.title}</h4>
                  <div className="mt-auto flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <span>{item.source}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Community & Leadership" id="community">
          <div className="space-y-6">
            {COMMUNITY.map((item, idx) => (
              <div key={idx} className="border border-slate-100 rounded-xl p-6 bg-white hover:shadow-lg transition-all">
                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                        <p className="text-sm font-semibold text-blue-600">{item.role}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.period}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">{item.description}</p>
                    <div className="space-y-2">
                      {item.achievements.map((achievement, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-700">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {item.title === "Physical AI KR (formerly SLAM KR)" && (
                    <a
                      href="https://open.kakao.com/o/g8T5kxLb"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src="/images/qr-code-physical-ai-kr.jpeg"
                        alt="Physical AI KR KakaoTalk QR Code"
                        className="w-32 h-32 object-contain"
                      />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Publications" id="publications">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">Title</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-800 text-xs">Type</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">Venue</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">Year</th>
                </tr>
              </thead>
              <tbody>
                {(showAllPublications ? PUBLICATIONS : PUBLICATIONS.slice(0, 5)).map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 text-slate-800 text-xs">{item.title}</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[10px] rounded border border-green-200">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-xs">{item.venue}</td>
                    <td className="py-2 px-3 text-slate-500 text-xs">{item.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {PUBLICATIONS.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllPublications(!showAllPublications)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                {showAllPublications ? (
                  <>
                    <ChevronRight className="w-3 h-3 rotate-90" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3 h-3 -rotate-90" />
                    Show More ({PUBLICATIONS.length - 5} more)
                  </>
                )}
              </button>
            </div>
          )}
        </Section>

        <Section title="Patents" id="patents">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">Title</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">Number</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">DOI</th>
                </tr>
              </thead>
              <tbody>
                {PATENTS.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 text-slate-800 text-xs">{item.title}</td>
                    <td className="py-2 px-3 text-slate-500 text-xs">{item.number}</td>
                    <td className="py-2 px-3 text-xs">
                      <a href={item.doi} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                        {item.doi}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Lectures" id="lectures">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">Title</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">Tag</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">Date</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">Organization</th>
                </tr>
              </thead>
              <tbody>
                {LECTURES.filter(item => !item.hidden).slice(0, showAllLectures ? undefined : 5).map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td
                      className={`py-2 px-3 text-slate-800 text-xs ${item.images && item.images.length > 0 ? 'cursor-pointer text-blue-600 hover:text-blue-800 hover:underline' : ''}`}
                      onClick={() => item.images && item.images.length > 0 && setSelectedLecture(item)}
                    >
                      {item.title}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded border border-blue-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-xs">{item.date}</td>
                    <td className="py-2 px-3 text-slate-500 text-xs">{item.organization}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {LECTURES.filter(item => !item.hidden).length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllLectures(!showAllLectures)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                {showAllLectures ? (
                  <>
                    <ChevronRight className="w-3 h-3 rotate-90" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3 h-3 -rotate-90" />
                    Show More ({LECTURES.filter(item => !item.hidden).length - 5} more)
                  </>
                )}
              </button>
            </div>
          )}
        </Section>

        <Section title="Study Club" id="study-club">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">Title</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs">Tag</th>
                </tr>
              </thead>
              <tbody>
                {(showAllStudyClubs ? STUDY_CLUBS : STUDY_CLUBS.slice(0, 5)).map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 text-slate-800 text-xs">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-800 hover:text-slate-900 hover:underline"
                        >
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] rounded border border-purple-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {STUDY_CLUBS.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllStudyClubs(!showAllStudyClubs)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                {showAllStudyClubs ? (
                  <>
                    <ChevronRight className="w-3 h-3 rotate-90" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3 h-3 -rotate-90" />
                    Show More ({STUDY_CLUBS.length - 5} more)
                  </>
                )}
              </button>
            </div>
          )}
        </Section>

        <footer className="mt-32 py-16 border-t border-slate-100 text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-8 shadow-xl shadow-blue-200">D</div>
          <p className="text-slate-500 font-bold text-lg mb-2">Dong-Won Shin</p>
          <p className="text-slate-400 text-sm mb-8 font-medium">Computer Vision & Deep Learning Engineer</p>
          <div className="flex justify-center gap-10">
            <a href="https://www.linkedin.com/in/dong-won-shin-7a11b2240/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-all hover:scale-110"><Linkedin className="w-6 h-6" /></a>
            <a href="mailto:celinachild@gmail.com" className="text-slate-400 hover:text-blue-600 transition-all hover:scale-110"><Mail className="w-6 h-6" /></a>
          </div>
          <p className="mt-12 text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">© 2026 Dong-Won Shin Portfolio</p>
        </footer>
      </main>

      <a href="mailto:celinachild@gmail.com" className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all z-50 group">
        <Mail className="w-6 h-6" />
        <span className="absolute right-16 bg-slate-900 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-black uppercase tracking-widest">Get in Touch</span>
      </a>
    </div>
  );
};

export default App;
