
import { 
  CareerItem, 
  EducationItem, 
  ProjectItem, 
  PatentItem, 
  MediaItem
} from './types';

export const CAREER_DATA: CareerItem[] = [
  {
    period: "Mar. 2022 – present",
    company: "StradVision",
    role: "VSLAM Algorithm Engineer"
  },
  {
    period: "Aug. 2019 – Feb. 2022",
    company: "SOSLAB (Smart Optics Sensor LAB)",
    role: "Research Engineer in LiDAR Application Team"
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
    id: "visual-loc",
    title: "Deep learning based visual localization for automotive embedded platform",
    subtitle: "Embedded visual positioning for autonomous parking with real-time pose estimation",
    organization: "StradVision",
    period: "Jan. 2024 – Dec. 2024",
    thumbnail: "/images/projects/visual-loc.png",
    details: {
      overview: "Developed a robust method for learning environment maps and accurately estimating vehicle location for autonomous parking scenarios. The project emphasizes deployment on resource-constrained automotive embedded platforms.",
      videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      keyFeatures: [
        "Environment map training mode for autonomous parking readiness",
        "High-accuracy localization mode based on pre-trained environmental maps",
        "Real-time operation on embedded automotive SoCs"
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
      overview: "Developed a system to create global parking lot maps by fusing vehicle location information from Visual SLAM with semantic parking slot detection. This ensures robust positioning and mapping in dynamic environments like supermarket and airport parking lots.",
      videoUrl: "https://youtu.be/p5tfm--gxg4",
      keyFeatures: [
        "Fusing vehicle trajectory with parking slot detection for global map consistency",
        "Comparison and visualization of generated maps with satellite imagery",
        "3D visualization of dense parking slot mapping",
        "Robustness to frequent environmental changes in urban parking structures"
      ],
      techStack: ["C++", "Visual SLAM", "Factor Graphs", "Nonlinear Optimization", "OpenCV"],
      achievements: [
        "Developed the overall algorithm for semantic parking slot mapping",
        "Implemented custom factor formulas for backend nonlinear optimization",
        "Created a loop closure detection algorithm specifically for semantic parking features",
        "Developed a map metric formula to quantitatively measure optimized map quality"
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
      overview: "Developed an ultra-lightweight visual SLAM algorithm for autonomous parking software, designed to provide accurate position estimation and mapping while running in real-time on automotive embedded platforms with limited computational resources.",
      keyFeatures: [
        "Map training mode: Driver learns the map of the parking environment through manual driving",
        "Localization mode: Fully automatic parking at specified locations based on learned maps",
        "Optimized for real-time performance on low-spec embedded hardware"
      ],
      techStack: ["C++", "Non-linear Optimization", "Embedded SoC", "LiDAR", "Visual Odometry"],
      achievements: [
        "Lightweighted non-linear optimization for both frontend and backend and ported to embedded platforms",
        "Developed a LiDAR-based Ground Truth (GT) data generation algorithm for precise VSLAM evaluation",
        "Built an automated pipeline for VSLAM algorithm evaluation and created analytical tools for result mapping"
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
      keyFeatures: [
        "Development of handheld SLAM device with 3D fixed solid-state LiDAR",
        "Hardware and software module selection and integration",
        "Visualization of LiDAR reflectance values on generated 3D maps"
      ],
      techStack: ["C++", "Solid-state LiDAR", "SLAM", "Flask", "Docker", "Embedded Linux"],
      achievements: [
        "Researched and experimented with open-source SLAM software optimized for 3D fixed LiDAR characteristics",
        "Tuned SLAM hyper-parameters to achieve high-quality mapping results",
        "Developed a simple 3D point cloud viewer using Flask on an embedded board",
        "Managed development and experimental environments using Docker for consistency",
        "Created a user manual and demo video for potential stakeholders"
      ]
    }
  },
  {
    id: "solid-state-lidar-object-detection",
    title: "Development of object detection algorithm for automotive using 3D solid-state lidar sensor",
    subtitle: "Real-time object recognition for automotive 3D solid-state LiDAR in embedded environments",
    organization: "SOSLAB",
    period: "Feb. 2021 – Aug. 2021",
    thumbnail: "/images/projects/solid-state-lidar-object-detection.png",
    details: {
      overview: "Focused on developing an object recognition model tailored for fixed 3D LiDAR sensors for mobility applications. The project aimed to establish real-time operation in embedded environments while building a perception software pipeline for future commercialization.",
      keyFeatures: [
        "Developed object recognition models suitable for fixed 3D solid-state LiDAR",
        "Optimized for real-time performance on embedded hardware (Raspberry Pi 4)",
        "Established a perception software pathway for future 3D solid-state LiDAR products"
      ],
      techStack: ["C++", "Python", "Raspberry Pi 4", "Solid-state LiDAR", "Deep Learning", "Point Cloud Data"],
      achievements: [
        "Collected, cleaned, processed, and trained 3D LiDAR datasets from diverse driving environments",
        "Successfully developed and deployed LiDAR object recognition modules on Raspberry Pi 4",
        "Conducted extensive evaluation of algorithm performance and inference speed for real-time validation"
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
      keyFeatures: [
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
      ]
    }
  }
];

export const SIDE_PROJECTS: ProjectItem[] = [
  {
    id: "eval-auto",
    title: "Evaluation Automation Tool for Visual SLAM",
    subtitle: "Automated benchmarking and analysis pipeline for VSLAM algorithms",
    organization: "Personal Project",
    period: "2024",
    thumbnail: "/images/projects/naverlabs-challenge.jpg",
    details: {
      overview: "Developed a Python-based tool to automate the evaluation of various VSLAM algorithms on standard datasets.",
      keyFeatures: ["Automated dataset preparation", "Multiple metrics (ATE, RPE) calculation", "Automatic report generation"],
      techStack: ["Python", "Pytest", "Numpy", "Matplotlib"]
    }
  },
  {
    id: "hparam-tune",
    title: "Hyper Parameter Tuning Tool for Visual SLAM",
    subtitle: "A GUI-based tool for real-time parameter optimization",
    organization: "Personal Project",
    period: "2023",
    thumbnail: "/images/projects/slam-book.jpg",
    details: {
      overview: "Created a desktop application to visualize and tune SLAM parameters on the fly.",
      keyFeatures: ["Real-time slider-based tuning", "Performance graphing", "Configuration export"],
      techStack: ["Python", "PyQt", "OpenCV"]
    }
  },
  {
    id: "nerf-art",
    title: "NeRF Art Gallery",
    subtitle: "Visualizing neural radiance fields as interactive art",
    organization: "Personal Project",
    period: "2022",
    thumbnail: "/images/projects/nerf-art.jpg",
    details: {
      overview: "Experimenting with NeRF architectures to generate high-fidelity 3D representations of artistic scenes.",
      keyFeatures: ["Instant-NGP implementation", "Custom scene dataset creation", "Interactive web viewer"],
      techStack: ["PyTorch", "CUDA", "WebGL"]
    }
  },
  {
    id: "slamops",
    title: "SLAMOps: SLAM as an MLOps",
    subtitle: "Building DevOps pipelines for robotics and SLAM modules",
    organization: "Personal Project",
    period: "Nov. 2021 - on going",
    thumbnail: "/images/projects/robust-3d-slam-harsh.png",
    details: {
      overview: "Applying MLOps principles to SLAM to ensure continuous integration and deployment of robot intelligence.",
      keyFeatures: ["CI/CD for ROS 2 nodes", "Automated regression testing", "Model versioning"],
      techStack: ["Docker", "Github Actions", "ROS 2"]
    }
  },
  {
    id: "naverlabs-challenge",
    title: "NaverLabs Visual Localization Challenge",
    subtitle: "Participating in long-term visual localization competition",
    organization: "Challenge Participation",
    period: "April 2020 - June 2020",
    thumbnail: "/images/projects/visual-loc.png",
    details: {
      overview: "Applying MLOps principles to SLAM to ensure continuous integration and deployment of robot intelligence.",
      keyFeatures: ["CI/CD for ROS 2 nodes", "Automated regression testing", "Model versioning"],
      techStack: ["Docker", "Github Actions", "ROS 2"]
    }
  },
  {
    id: "slam-book",
    title: "Translating the Visual SLAM book",
    subtitle: "Korean translation for the community of the famous SLAM textbook",
    organization: "Community Contribution",
    period: "Oct. 2018 - Feb. 2019",
    thumbnail: "/images/projects/slam-book.jpg",
    details: {
      overview: "Applying MLOps principles to SLAM to ensure continuous integration and deployment of robot intelligence.",
      keyFeatures: ["CI/CD for ROS 2 nodes", "Automated regression testing", "Model versioning"],
      techStack: ["Docker", "Github Actions", "ROS 2"]
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
    link: "#",
    thumbnail: "/images/media/media1.jpg"
  },
  {
    title: "Rising C++ Applications: SLAM Expert Interview with Dr. Shin",
    source: "HongLab / Tech Interview",
    date: "2023",
    link: "#",
    thumbnail: "/images/media/media2.jpg"
  },
  {
    title: "2023 SLAM KR Offline Event Successfully Completed with 140 Participants",
    source: "SLAM KR Community",
    date: "2023",
    link: "#",
    thumbnail: "/images/media/media3.jpg"
  },
  {
    title: "Autonomous Driving Era 'LiDAR' Leads - SOSLAB",
    source: "Industry News",
    date: "2021",
    link: "#",
    thumbnail: "/images/media/media5.jpg"
  },
  {
    title: "[SOSLAB] KES 2020 Exhibition Participation!",
    source: "Company Channel",
    date: "2020",
    link: "#",
    thumbnail: "/images/media/media5.jpg"
  }
];
