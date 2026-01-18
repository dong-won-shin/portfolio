
import {
  CareerItem,
  EducationItem,
  ProjectItem,
  PatentItem,
  MediaItem,
  LectureItem,
  StudyClubItem,
  PublicationItem,
  CommunityItem
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
  },
  {
    id: "orb-slam3-imu-part1",
    title: "ORB-SLAM3 IMU preintegration code review (1)",
    subtitle: "In-depth technical analysis of ORB-SLAM3 IMU preintegration implementation",
    organization: "Technical Blog",
    period: "2024",
    thumbnail: "/images/projects/orb-slam3-imu-1.webp",
    details: {
      overview: "A comprehensive technical code review analyzing the IMU preintegration implementation in ORB-SLAM3, one of the most widely used visual-inertial SLAM systems. This article provides detailed insights into the mathematical foundations and practical implementation details.",
      contributions: [
        "Detailed explanation of IMU preintegration theory",
        "Code-level analysis of ORB-SLAM3 implementation",
        "Mathematical derivations and practical insights",
        "Best practices for visual-inertial SLAM development"
      ],
      techStack: ["ORB-SLAM3", "IMU", "Visual-Inertial SLAM", "C++", "Computer Vision"],
      link: "https://concrete-bush-623.notion.site/ENG-ORB-SLAM3-IMU-preintegration-code-review-1-245cc7c3f3fb804598b1ceec8ea8a82d?pvs=73"
    }
  },
  {
    id: "orb-slam3-imu-part2",
    title: "ORB-SLAM3 IMU preintegration code review (2)",
    subtitle: "Advanced implementation details and optimization techniques for IMU integration",
    organization: "Technical Blog",
    period: "2024",
    thumbnail: "/images/projects/orb-slam3-imu-2.webp",
    details: {
      overview: "The second part of the ORB-SLAM3 IMU preintegration code review series, focusing on advanced topics including error propagation, bias correction, and optimization techniques for robust visual-inertial odometry.",
      contributions: [
        "Advanced IMU error propagation analysis",
        "Bias estimation and correction mechanisms",
        "Optimization strategies for real-time performance",
        "Practical tips for debugging and tuning"
      ],
      techStack: ["ORB-SLAM3", "IMU", "Visual-Inertial SLAM", "C++", "Optimization"],
      link: "https://concrete-bush-623.notion.site/ENG-ORB-SLAM3-IMU-preintegration-code-review-2-245cc7c3f3fb80d2b59fdf504ab861e2"
    }
  }
];

export const PATENTS: PatentItem[] = [
  {
    title: "A Method of Processing Lidar Data",
    number: "KR 10-2021-0155397",
    doi: "https://doi.org/10.8080/1020210155397",
    country: "Korea"
  },
  {
    title: "A Method of generating an intensity information with extended expression range by reflecting a geometric characteristic of object and a LiDAR device",
    number: "KR 10-2021-0083129",
    doi: "https://doi.org/10.8080/1020210083129",
    country: "Korea"
  },
  {
    title: "Method of Depth Image Generation",
    number: "KR 10-2015-0120746",
    doi: "https://doi.org/10.8080/1020150120746",
    country: "Korea"
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
  { title: "SLAM Invited Lecture 2023", tags: ["Education"], date: "Sep. 2023", organization: "Korea University" },
  { title: "NeRF Invited Lecture 2023", tags: ["Education", "Video"], date: "Aug. 2023", organization: "Sogang University" },
  { title: "2022 PseudoCon Conference", tags: ["Advance"], date: "Nov. 2022", organization: "PseudoLab" },
  { title: "RGBD SLAM Lecture (Fall 2022)", tags: [], date: "Sep. 2022", organization: "Daejeon Information & Culture Industry Promotion Agency" },
  { title: "Visual SLAM Lecture (Fall 2022)", tags: [], date: "Aug. 2022", organization: "Daejeon Information & Culture Industry Promotion Agency" },
  { title: "SLAM Technology for AR/VR Special Lecture", tags: ["Education", "Poster"], date: "July. 2022", organization: "KAIST UVR Lab" },
  { title: "Visual SLAM Lecture (Spring 2022)", tags: ["Advance", "Education"], date: "Apr. 2022", organization: "Daejeon Information & Culture Industry Promotion Agency" },
  { title: "RGB-D SLAM Lecture (Spring 2022)", tags: ["Advance", "Education"], date: "May. 2022", organization: "Daejeon Information & Culture Industry Promotion Agency" },
  { title: "Development of LiDAR Data Labeling Guidelines for AI Training", tags: ["Advance", "Education"], date: "Oct. - Dec. 2021", organization: "National Information Society Agency" },
  { title: "Visual SLAM Workshop", tags: ["Poster", "Advance", "Review"], date: "April 2021 - May 2021", organization: "Daejeon Information & Culture Industry Promotion Agency" },
  { title: "RGBD SLAM Workshop", tags: ["Poster", "Review"], date: "May 2021 - June 2021", organization: "Daejeon Information & Culture Industry Promotion Agency" },
  { title: "ModuCon 2019", tags: ["Video", "Advance"], date: "Dec. 2019", organization: "MODULABS" },
  { title: "LiDAR Institute", tags: ["Advance"], date: "Nov. 2019", organization: "WizGene" },
  { title: "Introduction to SLAM Technology and Applications", tags: ["Poster", "Advance"], date: "June 2019", organization: "KAIST UVR Lab" },
  { title: "Science SLAM D", tags: ["Video", "Advance"], date: "May. 2019", organization: "Institute for Basic Science" },
  { title: "2019 SLAM KR Offline Seminar", tags: ["Advance", "Playlist"], date: "Apr. 2019", organization: "SLAM KR" },
  { title: "ROS, SLAM Workshop", tags: [], date: "Apr. 2019", organization: "FastCampus" },
  { title: "LiDAR SLAM Seminar", tags: [], date: "Mar. 2019", organization: "Korea Electric Power Research Institute" },
  { title: "Introductory Level of SLAM Seminar", tags: ["Advance"], date: "Jan. 2019", organization: "PCL Research Group KR" },
  { title: "SLAM Seminar", tags: [], date: "Oct. 2018", organization: "VIRNECT" },
  { title: "ROS, SLAM Workshop", tags: ["Education"], date: "Aug. 2018", organization: "FastCampus" }
];

export const STUDY_CLUBS: StudyClubItem[] = [
  { title: "2023 SLAM KR Offline Event", tags: ["Playlist", "Conference"] },
  { title: "2022 NeRF Study: Nerd's NeRF", tags: ["Playlist", "Study"] },
  { title: "2021 SLAM Study Club", tags: ["Playlist", "Study"] },
  { title: "2021 SLAM DUNK Season 2", tags: ["Playlist", "Study"] },
  { title: "2020 SLAM DUNK Season 1", tags: ["Playlist", "Study"] },
  { title: "SLAM Night Live! (SNL) Season 2", tags: ["Playlist", "Live"] },
  { title: "2019 Autonomous Driving Online Study", tags: ["Playlist", "Study"] },
  { title: "SLAM Night Live! (SNL) Season 1", tags: ["Playlist", "Live"] },
  { title: "2019 SLAM Online Study", tags: ["Playlist", "Study"] }
];

export const PUBLICATIONS: PublicationItem[] = [
  // PhD Dissertation
  {
    title: "Local and Global Correspondence Establishing Techniques for Simultaneous Localization and Mapping",
    authors: "Dong-Won Shin (advised by Prof. Moongu Jeon)",
    venue: "Gwangju Institute of Science and Technology",
    year: "2019",
    type: "PhD Dissertation"
  },

  // Master Thesis
  {
    title: "3D Object Reconstruction Using Multiple Kinect Cameras",
    authors: "Dong-Won Shin (advised by Prof. Yo-Sung Ho)",
    venue: "Gwangju Institute of Science and Technology",
    year: "2015",
    type: "Master Thesis"
  },

  // International Journal
  {
    title: "Loop Closure Detection in Simultaneous Localization and Mapping Using Descriptor from Generative Adversarial Network",
    authors: "Dong-Won Shin, Yo-Sung Ho, and Eun-Soo Kim",
    venue: "Journal of Electronic Imaging, vol. 28, issue 1",
    year: "2019",
    type: "International Journal"
  },
  {
    title: "3D Scene Reconstruction Using Colorimetric and Geometric Constraints on Iterative Closest Point Method",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Multimedia Tools and Applications, vol. 77, issue 11",
    year: "2017",
    type: "International Journal"
  },

  // Domestic Journal
  {
    title: "3-Dimensional Calibration and Performance Evaluation Method for Pupil-labs Mobile Pupil Tracking Device",
    authors: "Dong-Won Shin, Ji-Hun Mun, and Yo-Sung Ho",
    venue: "Smart Media Journal, vol. 7, no. 2, pp. 15-22",
    year: "2018",
    type: "Domestic Journal"
  },
  {
    title: "Robust Semi-auto Calibration Method for Various Cameras and Illumination Changes",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Journal of Broadcast Engineering, vol. 21, no.1, pp. 36-42",
    year: "2016",
    type: "Domestic Journal"
  },
  {
    title: "Implementation of 3D Object Reconstruction Using Multiple Kinect Cameras",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Smart Media Journal, vol. 3, no. 4, pp. 22-27",
    year: "2015",
    type: "Domestic Journal"
  },
  {
    title: "Temporally-Consistent High-Resolution Depth Video Generation in Background Region",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Journal of Broadcast Engineering, vol. 20, no. 3, pp. 414-420",
    year: "2015",
    type: "Domestic Journal"
  },
  {
    title: "Real-time Depth Map Refinement using Hierarchical Joint Bilateral Filter",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Journal of Broadcast Engineering, vol. 19, no. 2, pp. 140-147",
    year: "2014",
    type: "Domestic Journal"
  },

  // International Conference
  {
    title: "Exploring Variants of Fully Convolutional Networks with Local and Global Contexts in Semantic Segmentation Problem",
    authors: "Dong-Won Shin, Jun-Yeong Park, Chan-Yeong Son, and Yo-Sung Ho",
    venue: "Electronic Imaging (EI), IRIACV-457, pp. 457.1-457.8, San Francisco, USA",
    year: "2019",
    type: "International Conference"
  },
  {
    title: "Loop Closure Detection in Simultaneous Localization and Mapping Using Learning Based Local Patch Descriptor",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Electronic Imaging (EI), AVM-284, pp. 1-4, San Francisco, USA",
    year: "2018",
    type: "International Conference"
  },
  {
    title: "Local Patch Descriptor Using Deep Convolutional Generative Adversarial Network for Loop Closure Detection in SLAM",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Asia-Pacific Signal and Information Processing Association (APSIPA), pp. 1-4, Kuala Lumpur, Malaysia",
    year: "2017",
    type: "International Conference"
  },
  {
    title: "Multiple View Depth Generation Based on 3D Scene Reconstruction Using Heterogeneous Cameras",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Electronic Imaging (EI), COIMG-444, pp. 179-184, San Francisco, USA",
    year: "2017",
    type: "International Conference"
  },
  {
    title: "Iterative Closest Points Method based on Photometric Weight for 3D Object Reconstruction",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Asia-Pacific Signal and Information Processing Association (APSIPA), pp. 145.1-145.4, Jeju, South Korea",
    year: "2016",
    type: "International Conference"
  },
  {
    title: "Pattern Feature Detection for Camera Calibration Using Circular Sample",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Pacific-Rim Conference on Multimedia (PCM), Part II, LNCS 9315, pp. 608-615, Gwangju, South Korea",
    year: "2015",
    type: "International Conference"
  },
  {
    title: "Color Correction Using 3D Multiview Geometry",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Electronic Imaging (EI), pp. 9395-24 (1-8), San Francisco, USA",
    year: "2015",
    type: "International Conference"
  },
  {
    title: "Elimination of Background Flickering in Depth Video",
    authors: "Dongwon Shin and Yo-Sung Ho",
    venue: "International Workshop on Advanced Image Technology (IWAIT), pp. 73(1-4), Tainan, Taiwan",
    year: "2015",
    type: "International Conference"
  },
  {
    title: "Implementation of 3D Object Reconstruction Using a Pair of Kinect Cameras",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Asia-Pacific Signal and Information Processing Association (APSIPA), pp. FA1-5.5(1-4), Siem Reap, Cambodia",
    year: "2014",
    type: "International Conference"
  },
  {
    title: "Real-time Depth Image Refinement Using Hierarchical Joint Bilateral Filter",
    authors: "Dong-Won Shin, Sang-Beom Lee, and Yo-Sung Ho",
    venue: "International Conference on Embedded Systems and Intelligent Technology (ICESIT), pp. 123-126, Gwangju, South Korea",
    year: "2014",
    type: "International Conference"
  },
  {
    title: "Joint Bilateral Filter for Warped Depth Data in Real-time",
    authors: "Dong-Won Shin, Yun-Seok Song, and Yo-Sung Ho",
    venue: "US-Korea Conference (UKC), EEC16, pp. 1-2, San Francisco, USA",
    year: "2014",
    type: "International Conference"
  },

  // Domestic Conference
  {
    title: "야지환경에 강인한 다중 주행 거리계 융합 기반 3차원 동시적 위치추정 및 지도 작성",
    authors: "신동원, 최준호, 이규만, 김동원, 김일한, 김석환",
    venue: "제32회 영상처리 및 이해에 관한 워크샵, pp. 474-477",
    year: "2021",
    type: "Domestic Conference"
  },
  {
    title: "Evaluation Dataset Generation for Loop Closure Detection Experiment",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Korean Institute of Smart Media, Fall Conference, pp. 79-82",
    year: "2017",
    type: "Domestic Conference"
  },
  {
    title: "Loop Closure Detection Using Variational Autoencoder in Simultaneous Localization and Mapping",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Korean Institute of Broadcast and Media Engineers, Summer Conference, pp. 250-253",
    year: "2017",
    type: "Domestic Conference"
  },
  {
    title: "Multiview Depth Image Generation Using Heterogeneous Cameras",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "29th Workshop on Image Processing and Image Understanding (IPIU), pp. 474-477",
    year: "2017",
    type: "Domestic Conference"
  },
  {
    title: "3D Scene Reconstruction Using Robust Surface Normal Vector Acquisition Method",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Korean Institute of Broadcast and Media Engineers, Fall Conference, pp. 4-5",
    year: "2016",
    type: "Domestic Conference"
  },
  {
    title: "SIFT Weighting Based Iterative Closest Points Method in 3D Object Reconstruction",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Korean Institute of Broadcast and Media Engineers, Summer Conference, pp. 309-312",
    year: "2016",
    type: "Domestic Conference"
  },
  {
    title: "Semi-auto Calibration Method Using Circular Sample Pixel and Homography Estimation",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Korean Institute of Broadcast and Media Engineers, Fall Conference, pp. 1-4",
    year: "2015",
    type: "Domestic Conference"
  },
  {
    title: "Elimination Method of Flickering Effect on Background Region of Depth Image",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Institute of Electronics and Information Engineers, Fall Conference, pp. 407-410",
    year: "2014",
    type: "Domestic Conference"
  },
  {
    title: "Multi-view Camera Color Correction using 3D Geometric Information",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Korean Signal Processing Conference, pp. K14-01(1-4)",
    year: "2014",
    type: "Domestic Conference"
  },
  {
    title: "Implementation of 3D Reconstruction using a Pair of Kinect Cameras",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Korean Institute of Broadcast and Media Engineers, Summer Conference, T2.2-2, pp. 1-4",
    year: "2014",
    type: "Domestic Conference"
  },
  {
    title: "Real-time Depth Image Refinement Using Joint Bilateral Filter",
    authors: "Dong-Won Shin and Yo-Sung Ho",
    venue: "Korean Institute of Broadcast and Media Engineers, Fall Conference, pp. A3-2(3~6)",
    year: "2013",
    type: "Domestic Conference"
  }
];

export const COMMUNITY: CommunityItem[] = [
  {
    title: "Physical AI KR (formerly SLAM KR)",
    role: "Community Leader",
    period: "2019 - Present",
    description: "Physical AI KR is a technical community bringing together practitioners and researchers to share knowledge on Physical AI, engage in constructive discussions, and grow through real-world problem solving.",
    achievements: [
      "Led and grew a KakaoTalk-based technical community with over 2,000 active members",
      "Organized and hosted large-scale offline technical meetups with up to 140 attendees",
      "Facilitated in-depth discussions on SLAM, robotics, and physical AI systems"
    ]
  }
];
