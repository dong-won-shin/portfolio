
import {
  CareerItem,
  EducationItem,
  ProjectItem,
  PatentItem,
  MediaItem,
  LectureItem,
  StudyClubItem
} from './types';

export const CAREER_DATA: CareerItem[] = [
  {
    period: "Mar. 2022 – present",
    company: "StradVision",
    role: "VSLAM Algorithm Engineer"
  },
  {
    period: "Aug. 2019 – Feb. 2022",
    company: "SOSLAB",
    role: "Research Engineer in LiDAR Application Team",
    badge: "IPO approved"
  }
];

export const EDUCATION_DATA: EducationItem[] = [
  {
    period: "Mar. 2015 – Aug. 2019",
    school: "GIST (Gwangju Institute of Science and Technology)",
    degree: "Ph.D. degree in School of Electronic Engineering and Computer Science"
  },
  {
    period: "Mar. 2013 – Feb. 2015",
    school: "GIST (Gwangju Institute of Science and Technology)",
    degree: "M.S. degree in School of Electronic Engineering and Computer Science"
  },
  {
    period: "Mar. 2006 – Feb. 2013",
    school: "KIT (Kumoh National Institute of Technology)",
    degree: "B.S. degree in Computer Engineering",
    description: "(Including two years of the millitary service)"
  }
];

export const INTERESTS = [
  "Simultaneous Localization and Mapping",
  "Multi View Geometry",
  "Visual Localization",
  "Computer Vision and Image Processing",
  "Machine Learning and Deep Learning",
  "Autonomous Driving System",
  "Mobile Robotics"
];

export const TECHNICAL_SKILLS = [
  { label: "Programming language", value: "C/C++, Python" },
  { label: "Robotics", value: "ROS" },
  { label: "Image processing", value: "OpenCV" },
  { label: "3D geometry", value: "Point cloud library, Open3D" },
  { label: "Machine learning", value: "Numpy, Scipy, Scikit-learn" },
  { label: "Deep learning", value: "Tensorflow, Pytorch, Keras" },
  { label: "Development", value: "Github, Docker, CMake" },
  { label: "Nonlinear optimization", value: "Ceres, g2o, symforce" }
];

export const PROJECTS: ProjectItem[] = [
  {
    id: "amd-vek385-multivision",
    title: "Neural Network Optimization and Porting for VSLAM on AMD Versal AI Edge",
    subtitle: "Converting and optimizing VSLAM neural networks for AMD's automotive SoC platform",
    organization: "StradVision",
    period: "2025",
    thumbnail: "/images/projects/amd-vek385.png",
    details: {
      overview: "Optimized StradVision's VSLAM for AMD Versal™ AI Edge Gen 2 VEK385. Adapted deep learning for AMD AIE-ML v2. Applied quantization for realtime automotive use. Demonstrated scalable AI from Level 2 to Level 3 autonomy at CES 2026.",
      contributions: [
        "Successfully demonstrated the system at CES 2026 with positive industry feedback.",
        "Contributed neural network model conversion and adaptation for AMD Versal AI Edge Gen 2 (VEK385) SoC.",
        "Applied quantization for AIE-ML v2 engines achieving accuracy with reduced power.",
      ],
      techStack: ["AMD Versal AI Edge Gen 2", "VEK385", "AIE-ML v2", "Neural Network Quantization", "Model Conversion", "VSLAM", "C++"],
      achievements: [
        "Successfully ported and optimized VSLAM neural networks for AMD VEK385 platform",
        "Achieved near-FP16 accuracy with quantized inference while meeting automotive real-time requirements",
        "Demonstrated at CES 2026 as part of AMD-StradVision collaboration showcase",
        "Enabled production-ready AI perception deployment on AMD's automotive SoC architecture"
      ],
      link: "https://www.amd.com/en/blogs/2025/amd-and-stradvision-collaboration.html",
      images: [
        "/images/projects/amd-vek385-2.jpg",
        "/images/projects/amd-vek385-3.webp"
      ]
    }
  },
  {
    id: "visual-loc",
    title: "Deep learning based visual localization for automotive embedded platform",
    subtitle: "Embedded visual positioning for autonomous parking with real-time pose estimation",
    organization: "StradVision",
    period: "Jan. 2024 – Dec. 2024",
    thumbnail: "/images/projects/visual-loc-new.png",
    details: {
      overview: "Developed a deep learning–based visual localization system for autonomous parking, enabling environment map learning and precise vehicle pose estimation under automotive constraints.",
      videoUrl: "https://youtu.be/nWGenYwT_M0",
      contributions: [
        "Implemented deep neural network–based modules within a VSLAM pipeline.",
        "Achieved real-time operation on embedded automotive SoCs.",
        "Improved visual localization robustness, achieving ~3–4× more successful pose estimates compared to a non–deep learning baseline."
      ],
      techStack: ["C++", "PyTorch", "Quantization", "Embedded SoC", "TensorRT", "OpenCV"],
      achievements: [
        "Implemented a full deep learning-based visual localization module",
        "Designed a deep learning model architecture optimized for automotive platforms with limited computational resources",
        "Applied lightweighting and quantization techniques to ensure real-time performance on target hardware"
      ]
    }
  },
  {
    id: "semantic-parking-map",
    title: "Semantic aware parking slot map generation",
    subtitle: "Global parking lot map generation using semantic fusion and nonlinear optimization",
    organization: "StradVision",
    period: "Jan. 2023 – Dec. 2023",
    thumbnail: "/images/projects/semantic-parking-map.png",
    details: {
      overview: "Developed a system to create global parking lot maps by fusing vehicle location information from Visual SLAM with semantic parking slot detection.",
      videoUrl: "https://youtu.be/p5tfm--gxg4",
      techStack: ["C++", "Visual SLAM", "Factor Graphs", "Nonlinear Optimization", "OpenCV"],
      contributions: [
        "Designed the overall algorithm for semantic parking slot mapping.",
        "Implemented custom factor formulations for backend nonlinear optimization.",
        "Developed a loop closure detection algorithm leveraging semantic parking slot features.",
        "Defined a quantitative map quality metric to evaluate and validate optimized maps."
      ]
    }
  },
  {
    id: "ultra-lightweight-vslam",
    title: "Ultra-lightweight Visual SLAM framework for Auto Valet Parking",
    subtitle: "Real-time positioning and mapping on resource-constrained automotive embedded platforms",
    organization: "StradVision",
    period: "Feb. 2022 – Dec. 2022",
    thumbnail: "/images/projects/ultra-lightweight-vslam.png",
    details: {
      overview: "Created a lightweight visual SLAM for autonomous parking, enabling real-time positioning and mapping on limited-resource automotive platforms.",
      videoUrl: "https://youtu.be/dE0R-Ow4QAc",
      techStack: ["C++", "Non-linear Optimization", "Embedded SoC", "LiDAR", "Visual Odometry"],
      contributions: [
        "Implemented lightweight nonlinear optimization in the backend, reducing runtime by up to 25% and enabling real-time performance.",
        "Developed a LiDAR-based ground truth (GT) data generation algorithm for precise VSLAM evaluation.",
        "Built an automated pipeline for VSLAM algorithm evaluation and created analytical tools for result mapping."
      ]
    }
  },
  {
    id: "solid-state-lidar-slam",
    title: "Software development of SLAM mapping device using solid-state lidar sensor",
    subtitle: "Handheld SLAM mapping device using three-dimensional fixed solid-state LiDAR",
    organization: "SOSLAB",
    period: "Nov. 2021 – Jan. 2022",
    thumbnail: "/images/projects/solid-state-lidar-slam.png",
    details: {
      overview: "Developed a handheld SLAM mapping device utilizing three-dimensional fixed solid-state LiDAR sensors. The project aimed to create a technical foothold for future sales of 3D fixed LiDAR and SLAM application software.",
      videoUrl: "https://youtu.be/gy468T0mFZs",
      techStack: ["C++", "Solid-state LiDAR", "SLAM", "Flask", "Docker", "Embedded Linux"],
      contributions: [
        "Researched and experimented with open-source SLAM software optimized for 3D solid-state LiDAR characteristics",
        "Developed a simple 3D point cloud viewer using Flask on an embedded board",
        "Managed development and experimental environments using Docker for consistency",
      ]
    }
  },
  {
    id: "robust-3d-slam-harsh",
    title: "Development of robust 3D SLAM & object detection software for the harsh environment",
    subtitle: "Multi-sensor fusion SLAM for autonomous vehicles in wilderness environments",
    organization: "SOSLAB",
    period: "Mar. 2020 – Feb. 2022",
    thumbnail: "/images/projects/robust-3d-slam-harsh.png",
    details: {
      overview: "Developed real-time position estimation and 3D map generation algorithms for unmanned vehicles traveling in wilderness environments. The system integrates LiDAR, camera, and IMU sensor data to ensure robustness in challenging conditions.",
      contributions: [
        "Real-time sensor fusion (LiDAR, Camera, IMU) for 3D mapping and localization",
        "Object recognition and classification using deep learning on multi-environment datasets",
        "Cross-calibration between LiDAR and camera for precise 3D object localization",
        "Integration and verification with physical unmanned vehicle platforms"
      ],
      techStack: ["C++", "ROS", "LiDAR", "Stereo Camera", "IMU", "Factor Graphs", "Kalman Filter"],
      achievements: [
        "Implemented multi-sensor fusion modules using both Factor Graph and Kalman Filter techniques",
        "Developed an obstacle occupancy grid mapping module for autonomous navigation",
        "Achieved high-accuracy localization in unstructured wilderness environments",
        "Conducted extensive comparative analysis of LiDAR vs. Camera-based estimation algorithms"
      ],
      images: [
        "/images/projects/robust-3d-slam-harsh.webp",
      ]
    }
  }
];

export const TECHNICAL_WRITING: ProjectItem[] = [
  {
    id: "jetson-slam-ebook",
    title: "[E-book] Understanding and Implementing SLAM with NVIDIA Jetson Nano",
    subtitle: "Comprehensive guide to understanding and implementing SLAM with NVIDIA Jetson Nano",
    organization: "Educational Content",
    period: "2024",
    thumbnail: "/images/projects/jetson-slam-ebook.webp",
    details: {
      overview: "An educational e-book that provides a comprehensive introduction to SLAM (Simultaneous Localization and Mapping) technology using NVIDIA Jetson Nano. The book covers fundamental concepts, practical implementation techniques, and hands-on examples for embedded robotics applications.",
      contributions: [
        "Step-by-step guide to SLAM fundamentals and theory",
        "Practical implementation examples using NVIDIA Jetson Nano",
        "Real-world robotics applications and use cases",
        "Optimized algorithms for embedded platforms"
      ],
      techStack: ["SLAM", "NVIDIA Jetson Nano", "ROS", "Computer Vision", "Embedded Systems"],
      pdfUrl: "/pdfs/slam-understanding-implementation.pdf"
    }
  }
];

export const PATENTS: PatentItem[] = [
  {
    title: "Method and apparatus for generating 3D map using LiDAR sensors",
    number: "KR10202200XXXXX",
    status: "Registered",
    country: "Korea"
  },
  {
    title: "Device for detecting loop closure in SLAM using neural network",
    number: "US17/XXXXXXX",
    status: "Pending",
    country: "USA"
  }
];

export const MEDIA: MediaItem[] = [
  {
    title: "National Strategic Technology: Advanced Mobility Online Course",
    source: "Educational Portal",
    date: "2023",
    link: "https://alpha-campus.kr/explore/8775cdf0-cf00-4376-902a-66c185a6a6a8?sequenceId=cf0fedfa-7f8d-4a8c-bb42-7c099b55c958&tab=ALL",
    thumbnail: "/images/media/media1.webp",
    details: {
      overview: "A comprehensive online course designed to enhance the mobility technology capabilities of cutting-edge cities. The program focuses on multirotary vehicle platform development, SLAM fundamentals, and practical skills for autonomous mobility systems, helping participants understand the latest trends in advanced mobility technology.",
      contributions: [
        "Development and operational methods of multirotary vehicle platforms",
        "Understanding SLAM fundamentals and practical implementation",
        "Exploring cutting-edge mobility trends and future applications",
        "Hands-on experience with autonomous driving technology components"
      ],
      techStack: ["SLAM", "Autonomous Driving", "Sensor Fusion", "Computer Vision", "Robotics"],
      images: [
        "/images/media/advanced-mobility-1.webp",
        "/images/media/advanced-mobility-2.webp",
        "/images/media/advanced-mobility-3.webp",
        "/images/media/advanced-mobility-4.webp"
      ]
    }
  },
  {
    title: "Rising C++ Applications: SLAM Expert Interview with Dr. Shin",
    source: "HongLab / Tech Interview",
    date: "2023",
    link: "https://youtu.be/G6HV9kXwQQE",
    thumbnail: "/images/media/media2.webp",
    details: {
      overview: "An in-depth interview discussing the practical applications of C++ in SLAM (Simultaneous Localization and Mapping) technology. Dr. Shin shares insights on modern C++ development practices, real-time performance optimization, and the evolution of SLAM algorithms in autonomous systems.",
      videoUrl: "https://youtu.be/G6HV9kXwQQE",
      contributions: [
        "Deep dive into C++ performance optimization techniques for real-time SLAM",
        "Discussion on modern C++ standards (C++17/20) and their impact on robotics software",
        "Practical insights from developing production-grade SLAM systems",
        "Career path and experiences in the autonomous driving industry"
      ],
      techStack: ["C++", "SLAM", "ROS", "Real-time Systems", "Autonomous Driving"]
    }
  },
  {
    title: "2023 SLAM KR Offline Event Successfully Completed with 140 Participants",
    source: "SLAM KR Community",
    date: "2023",
    link: "#",
    thumbnail: "/images/media/media3.webp",
    details: {
      overview: "A successful offline gathering of the SLAM KR community bringing together 140 participants including researchers, engineers, and students passionate about SLAM technology. The event featured technical presentations, networking sessions, and discussions on the latest developments in SLAM research and applications.",
      contributions: [
        "Technical presentations covering cutting-edge SLAM research and industrial applications",
        "Networking opportunities with SLAM experts from academia and industry",
        "Hands-on demonstrations and live Q&A sessions",
        "Community collaboration and knowledge sharing among 140+ SLAM enthusiasts"
      ],
      techStack: ["SLAM", "Computer Vision", "Robotics", "Autonomous Driving", "LiDAR"],
      images: [
        "/images/media/slam-kr-2023/slam-kr-1.webp",
        "/images/media/slam-kr-2023/slam-kr-2.webp",
        "/images/media/slam-kr-2023/slam-kr-3.webp",
        "/images/media/slam-kr-2023/slam-kr-4.webp",
        "/images/media/slam-kr-2023/slam-kr-5.webp",
        "/images/media/slam-kr-2023/slam-kr-6.webp",
        "/images/media/slam-kr-2023/slam-kr-7.webp",
        "/images/media/slam-kr-2023/slam-kr-8.webp",
        "/images/media/slam-kr-2023/slam-kr-9.webp",
        "/images/media/slam-kr-2023/slam-kr-10.webp",
        "/images/media/slam-kr-2023/slam-kr-11.webp",
        "/images/media/slam-kr-2023/slam-kr-12.webp"
      ]
    }
  },
];

export const LECTURES: LectureItem[] = [
  { title: "2023년 SLAM 초청 강의", tags: ["교육정보"], date: "Sep. 2023", organization: "고려대학교" },
  { title: "2023년 NeRF 초청 강의", tags: ["교육정보", "발표영상"], date: "Aug. 2023", organization: "서강대학교" },
  { title: "2022 PseudoCon Conference", tags: ["사전"], date: "Nov. 2022", organization: "PseudoLab" },
  { title: "2022년 하반기 RGBD SLAM 강의", tags: [], date: "Sep. 2022", organization: "대전정보문화산업진흥원" },
  { title: "2022년 하반기 Visual SLAM 강의", tags: [], date: "Aug. 2022", organization: "대전정보문화산업진흥원" },
  { title: "AR/VR을 위한 SLAM 기술 특강", tags: ["교육정보", "포스터"], date: "July. 2022", organization: "KAIST UVR Lab" },
  { title: "2022년 상반기 Visual SLAM 강의", tags: ["사전", "교육정보"], date: "Apr. 2022", organization: "대전정보문화산업진흥원" },
  { title: "2022년 상반기 RGB-D SLAM 강의", tags: ["사전", "교육정보"], date: "May. 2022", organization: "대전정보문화산업진흥원" },
  { title: "인공지능 학습용 라이다 데이터 라벨링 지침 개발", tags: ["사전", "교육정보"], date: "Oct. - Dec. 2021", organization: "한국지능정보사회진흥원" },
  { title: "Visual SLAM Workshop", tags: ["포스터", "사전", "참가소감"], date: "April 2021 - May 2021", organization: "대전정보문화산업진흥원" },
  { title: "RGBD SLAM Workshop", tags: ["포스터", "참가소감"], date: "May 2021 - June 2021", organization: "대전정보문화산업진흥원" },
  { title: "ModuCon 2019", tags: ["발표영상", "사전"], date: "Dec. 2019", organization: "모두의연구소" },
  { title: "LiDAR Institute", tags: ["사전"], date: "Nov. 2019", organization: "WizGene" },
  { title: "Introduction to SLAM Technology and Applications", tags: ["포스터", "사전"], date: "June 2019", organization: "KAIST UVR Lab" },
  { title: "Science SLAM D", tags: ["발표영상", "사전"], date: "May. 2019", organization: "기초과학연구원" },
  { title: "2019 SLAM KR Offline Seminar", tags: ["사전", "플레이리스트"], date: "Apr. 2019", organization: "SLAM KR" },
  { title: "ROS, SLAM Workshop", tags: [], date: "Apr. 2019", organization: "패스트캠퍼스" },
  { title: "LiDAR SLAM Seminar", tags: [], date: "Mar. 2019", organization: "한국전력연구원" },
  { title: "Introductory Level of SLAM Seminar", tags: ["사전"], date: "Jan. 2019", organization: "PCL Research Group KR" },
  { title: "SLAM Seminar", tags: [], date: "Oct. 2018", organization: "VIRNECT" },
  { title: "ROS, SLAM Workshop", tags: ["교육정보"], date: "Aug. 2018", organization: "패스트캠퍼스" }
];

export const STUDY_CLUBS: StudyClubItem[] = [
  { title: "2023 SLAM KR Offline Event", tags: ["플레이리스트", "컨퍼런스"] },
  { title: "2022 NeRF Study: Nerd's NeRF", tags: ["플레이리스트", "스터디"] },
  { title: "2021 SLAM Study Club", tags: ["플레이리스트", "스터디"] },
  { title: "2021 SLAM DUNK Season 2", tags: ["플레이리스트", "스터디"] },
  { title: "2020 SLAM DUNK Season 1", tags: ["플레이리스트", "스터디"] },
  { title: "SLAM Night Live! (SNL) Season 2", tags: ["플레이리스트", "라이브방송"] },
  { title: "2019 Autonomous Driving Online Study", tags: ["플레이리스트", "스터디"] },
  { title: "SLAM Night Live! (SNL) Season 1", tags: ["플레이리스트", "라이브방송"] },
  { title: "2019 SLAM Online Study", tags: ["플레이리스트", "스터디"] }
];
