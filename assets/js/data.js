/**
 * Campus Connect — Sample Data (Phase 1)
 * ------------------------------------------------------------------
 * Static sample data used by the front-end prototype.
 * This file contains DATA ONLY — no display logic.
 *
 * Phase 2 mapping (future database collections):
 *   CC_DATA.profiles      -> collection "profiles"
 *   CC_DATA.opportunities -> collection "opportunities"
 *   CC_DATA.resources     -> collection "resources"
 *   CC_DATA.events        -> collection "events"
 *   CC_DATA.meta          -> static config / lookup tables
 */
window.CC_DATA = {
  meta: {
    departments: [
      { code: "CSE", name: "Computer Science & Engineering" },
      { code: "IT", name: "Information Technology" },
      { code: "ECE", name: "Electronics & Communication" },
      { code: "EE", name: "Electrical Engineering" },
      { code: "ME", name: "Mechanical Engineering" },
      { code: "CE", name: "Civil Engineering" },
      { code: "MBA", name: "Business Administration" }
    ],
    roles: [
      { code: "student", name: "Student" },
      { code: "senior", name: "Senior Student" },
      { code: "alumni", name: "Alumni" }
    ],
    verification: [
      { code: "verified", name: "Verified" },
      { code: "pending", name: "Pending" },
      { code: "unverified", name: "Unverified" }
    ],
    opportunityCategories: [
      { code: "internship", name: "Internships" },
      { code: "job", name: "Jobs" },
      { code: "hackathon", name: "Hackathons" },
      { code: "certification", name: "Certifications" }
    ],
    resourceTypes: [
      { code: "notes", name: "Notes" },
      { code: "video", name: "Video" },
      { code: "ebook", name: "E-Book" },
      { code: "roadmap", name: "Roadmap" },
      { code: "paper", name: "Question Paper" },
      { code: "course", name: "Course" }
    ],
    eventTypes: [
      { code: "workshop", name: "Workshop" },
      { code: "webinar", name: "Webinar" },
      { code: "hackathon", name: "Hackathon" },
      { code: "meetup", name: "Meetup" },
      { code: "seminar", name: "Seminar" },
      { code: "fest", name: "Fest" }
    ]
  },

  profiles: [
    {
      id: "p001", photo: "assets/img/avatars/p001.jpg", name: "Aarav Sharma", role: "alumni", department: "CSE", batch: 2021,
      verification: "verified", headline: "Software Engineer II at Microsoft",
      company: "Microsoft", location: "Hyderabad, India",
      bio: "Backend engineer working on Azure services. Happy to help juniors with DSA prep, system design and referrals for SDE roles.",
      skills: ["Java", "System Design", "Azure", "DSA", "Kubernetes"],
      openTo: ["Mentorship", "Referrals", "Mock Interviews"],
      experience: [
        { title: "Software Engineer II", org: "Microsoft", period: "2023 – Present" },
        { title: "Software Engineer", org: "Microsoft", period: "2021 – 2023" },
        { title: "SDE Intern", org: "Amazon", period: "Summer 2020" }
      ],
      achievements: ["ICPC Regionalist 2019", "Smart India Hackathon Winner 2020"],
      email: "aarav.sharma@example.com", phone: "+91 98XXX XX101",
      links: { linkedin: "#", github: "#" }, connections: 412, callAvailable: true
    },
    {
      id: "p002", photo: "assets/img/avatars/p002.jpg", name: "Priya Nair", role: "senior", department: "CSE", batch: 2027,
      verification: "verified", headline: "Final-year student · ML enthusiast · GDSC Lead",
      company: "", location: "Campus",
      bio: "Leading the Google Developer Student Club. Working on NLP research with the AI lab. Ask me about research internships and open source.",
      skills: ["Python", "Machine Learning", "PyTorch", "NLP", "Public Speaking"],
      openTo: ["Mentorship", "Project Collaboration"],
      experience: [
        { title: "Research Intern", org: "IISc Bangalore", period: "Summer 2025" },
        { title: "Lead", org: "GDSC Campus Chapter", period: "2025 – Present" }
      ],
      achievements: ["Google Summer of Code 2025", "Best Paper — Student Track, NLPConf"],
      email: "priya.nair@example.com", phone: "+91 97XXX XX202",
      links: { linkedin: "#", github: "#" }, connections: 286, callAvailable: true
    },
    {
      id: "p003", photo: "assets/img/avatars/p003.jpg", name: "Rohan Verma", role: "student", department: "IT", batch: 2029,
      verification: "pending", headline: "Second-year · Learning Web Development",
      company: "", location: "Campus",
      bio: "Currently learning full-stack web development. Looking for seniors to guide me on projects and internships.",
      skills: ["HTML", "CSS", "JavaScript", "C++"],
      openTo: ["Project Collaboration", "Study Groups"],
      experience: [],
      achievements: ["College Coding Contest — Top 20"],
      email: "rohan.verma@example.com", phone: "+91 96XXX XX303",
      links: { linkedin: "#", github: "#" }, connections: 58, callAvailable: false
    },
    {
      id: "p004", photo: "assets/img/avatars/p004.jpg", name: "Sneha Iyer", role: "alumni", department: "ECE", batch: 2019,
      verification: "verified", headline: "Hardware Design Engineer at Qualcomm",
      company: "Qualcomm", location: "Bengaluru, India",
      bio: "VLSI and chip design. I mentor ECE students interested in core electronics careers and higher studies abroad.",
      skills: ["VLSI", "Verilog", "Embedded C", "SystemVerilog", "MATLAB"],
      openTo: ["Mentorship", "Higher Studies Guidance"],
      experience: [
        { title: "Senior Hardware Engineer", org: "Qualcomm", period: "2022 – Present" },
        { title: "Design Engineer", org: "Texas Instruments", period: "2019 – 2022" }
      ],
      achievements: ["MS Admit — Georgia Tech (deferred)", "University Gold Medalist"],
      email: "sneha.iyer@example.com", phone: "+91 95XXX XX404",
      links: { linkedin: "#", github: "" }, connections: 530, callAvailable: true
    },
    {
      id: "p005", photo: "assets/img/avatars/p005.jpg", name: "Kabir Singh", role: "senior", department: "ME", batch: 2027,
      verification: "verified", headline: "Final-year · Captain, Formula Student Team",
      company: "", location: "Campus",
      bio: "Leading our Formula Student racing team. Into CAD, simulation and EV powertrains.",
      skills: ["SolidWorks", "ANSYS", "CAD", "Leadership", "EV Systems"],
      openTo: ["Project Collaboration", "Mentorship"],
      experience: [
        { title: "Intern", org: "Tata Motors", period: "Summer 2025" },
        { title: "Captain", org: "Formula Student Team", period: "2025 – Present" }
      ],
      achievements: ["Formula Bharat 2025 — Top 10"],
      email: "kabir.singh@example.com", phone: "+91 94XXX XX505",
      links: { linkedin: "#", github: "" }, connections: 190, callAvailable: true
    },
    {
      id: "p006", photo: "assets/img/avatars/p006.jpg", name: "Ananya Gupta", role: "alumni", department: "MBA", batch: 2022,
      verification: "verified", headline: "Product Manager at Razorpay",
      company: "Razorpay", location: "Bengaluru, India",
      bio: "PM in fintech. I help students transition into product roles — case prep, resume reviews and PM interview practice.",
      skills: ["Product Management", "SQL", "Analytics", "Figma", "Strategy"],
      openTo: ["Mentorship", "Mock Interviews", "Referrals"],
      experience: [
        { title: "Product Manager", org: "Razorpay", period: "2023 – Present" },
        { title: "Associate PM", org: "Swiggy", period: "2022 – 2023" }
      ],
      achievements: ["Case Competition Winner — IIM Fest 2021"],
      email: "ananya.gupta@example.com", phone: "+91 93XXX XX606",
      links: { linkedin: "#", github: "" }, connections: 610, callAvailable: true
    },
    {
      id: "p007", photo: "assets/img/avatars/p007.jpg", name: "Vikram Rao", role: "student", department: "CSE", batch: 2028,
      verification: "verified", headline: "Third-year · Competitive Programmer",
      company: "", location: "Campus",
      bio: "Codeforces Expert. Running weekly DSA sessions for juniors in the coding club.",
      skills: ["C++", "DSA", "Competitive Programming", "Python"],
      openTo: ["Study Groups", "Mentorship"],
      experience: [{ title: "Coordinator", org: "Coding Club", period: "2025 – Present" }],
      achievements: ["Codeforces Expert (1750)", "CodeChef 4★"],
      email: "vikram.rao@example.com", phone: "+91 92XXX XX707",
      links: { linkedin: "#", github: "#" }, connections: 144, callAvailable: false
    },
    {
      id: "p008", photo: "assets/img/avatars/p008.jpg", name: "Meera Joshi", role: "alumni", department: "IT", batch: 2020,
      verification: "verified", headline: "UX Designer at Adobe",
      company: "Adobe", location: "Noida, India",
      bio: "Designing creative tools used by millions. I review portfolios and help engineers move into UX.",
      skills: ["UI/UX", "Figma", "User Research", "Prototyping", "Design Systems"],
      openTo: ["Portfolio Reviews", "Mentorship"],
      experience: [
        { title: "Senior UX Designer", org: "Adobe", period: "2022 – Present" },
        { title: "UX Designer", org: "Zomato", period: "2020 – 2022" }
      ],
      achievements: ["Adobe Design Achievement Award"],
      email: "meera.joshi@example.com", phone: "+91 91XXX XX808",
      links: { linkedin: "#", github: "" }, connections: 475, callAvailable: true
    },
    {
      id: "p009", photo: "assets/img/avatars/p009.jpg", name: "Arjun Mehta", role: "senior", department: "IT", batch: 2027,
      verification: "pending", headline: "Final-year · Full-Stack Developer",
      company: "", location: "Campus",
      bio: "Built 5+ production apps for college events. Interned at a Y-Combinator startup.",
      skills: ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript"],
      openTo: ["Project Collaboration", "Freelance"],
      experience: [{ title: "Full-Stack Intern", org: "Startup (YC W24)", period: "Summer 2025" }],
      achievements: ["HackCampus 2025 — 1st Place"],
      email: "arjun.mehta@example.com", phone: "+91 90XXX XX909",
      links: { linkedin: "#", github: "#" }, connections: 233, callAvailable: true
    },
    {
      id: "p010", photo: "assets/img/avatars/p010.jpg", name: "Fatima Khan", role: "student", department: "ECE", batch: 2028,
      verification: "unverified", headline: "Third-year · IoT & Robotics",
      company: "", location: "Campus",
      bio: "Building IoT devices for smart agriculture. Member of the robotics club.",
      skills: ["Arduino", "IoT", "Embedded C", "Python"],
      openTo: ["Project Collaboration"],
      experience: [],
      achievements: ["Robotics Club — Best Project 2025"],
      email: "fatima.khan@example.com", phone: "+91 89XXX XX010",
      links: { linkedin: "#", github: "#" }, connections: 76, callAvailable: false
    },
    {
      id: "p011", photo: "assets/img/avatars/p011.jpg", name: "Rahul Desai", role: "alumni", department: "CE", batch: 2018,
      verification: "verified", headline: "Project Manager at L&T Construction",
      company: "L&T", location: "Mumbai, India",
      bio: "Managing metro rail projects. Guiding civil students on site careers, GATE and PSU jobs.",
      skills: ["AutoCAD", "Project Management", "STAAD Pro", "Primavera"],
      openTo: ["Mentorship", "GATE Guidance"],
      experience: [
        { title: "Project Manager", org: "L&T Construction", period: "2021 – Present" },
        { title: "Site Engineer", org: "L&T Construction", period: "2018 – 2021" }
      ],
      achievements: ["GATE AIR 312 (2018)"],
      email: "rahul.desai@example.com", phone: "+91 88XXX XX111",
      links: { linkedin: "#", github: "" }, connections: 320, callAvailable: true
    },
    {
      id: "p012", photo: "assets/img/avatars/p012.jpg", name: "Ishita Banerjee", role: "senior", department: "CSE", batch: 2027,
      verification: "verified", headline: "Final-year · Cloud & DevOps · AWS Certified",
      company: "", location: "Campus",
      bio: "AWS Solutions Architect Associate. Placed at Goldman Sachs. Happy to share placement prep resources.",
      skills: ["AWS", "Docker", "Linux", "Python", "CI/CD"],
      openTo: ["Mentorship", "Study Groups"],
      experience: [{ title: "Summer Analyst", org: "Goldman Sachs", period: "Summer 2025" }],
      achievements: ["AWS Certified Solutions Architect", "Pre-Placement Offer — Goldman Sachs"],
      email: "ishita.banerjee@example.com", phone: "+91 87XXX XX212",
      links: { linkedin: "#", github: "#" }, connections: 298, callAvailable: true
    },
    {
      id: "p013", photo: "assets/img/avatars/p013.jpg", name: "Dev Patel", role: "student", department: "EE", batch: 2029,
      verification: "pending", headline: "Second-year · Power Systems & Renewables",
      company: "", location: "Campus",
      bio: "Interested in solar energy and smart grids. Looking for research guidance.",
      skills: ["MATLAB", "Simulink", "Circuit Design"],
      openTo: ["Study Groups", "Research"],
      experience: [],
      achievements: [],
      email: "dev.patel@example.com", phone: "+91 86XXX XX313",
      links: { linkedin: "#", github: "" }, connections: 34, callAvailable: false
    },
    {
      id: "p014", photo: "assets/img/avatars/p014.jpg", name: "Neha Kulkarni", role: "alumni", department: "CSE", batch: 2023,
      verification: "verified", headline: "Data Scientist at Flipkart",
      company: "Flipkart", location: "Bengaluru, India",
      bio: "Working on recommendation systems. I can help with data science roadmaps, Kaggle and ML interviews.",
      skills: ["Python", "Machine Learning", "SQL", "Statistics", "Spark"],
      openTo: ["Mentorship", "Referrals", "Mock Interviews"],
      experience: [
        { title: "Data Scientist", org: "Flipkart", period: "2023 – Present" },
        { title: "Data Science Intern", org: "Flipkart", period: "Summer 2022" }
      ],
      achievements: ["Kaggle Competitions Expert"],
      email: "neha.kulkarni@example.com", phone: "+91 85XXX XX414",
      links: { linkedin: "#", github: "#" }, connections: 388, callAvailable: true
    },
    {
      id: "p015", photo: "assets/img/avatars/p015.jpg", name: "Siddharth Rao", role: "student", department: "MBA", batch: 2027,
      verification: "unverified", headline: "MBA Candidate · Marketing & Strategy",
      company: "", location: "Campus",
      bio: "Ex-engineer pursuing MBA. Running the E-Cell marketing team.",
      skills: ["Marketing", "Strategy", "Excel", "Communication"],
      openTo: ["Project Collaboration", "Networking"],
      experience: [{ title: "Analyst", org: "Infosys", period: "2023 – 2025" }],
      achievements: ["E-Summit 2025 Organizer"],
      email: "siddharth.rao@example.com", phone: "+91 84XXX XX515",
      links: { linkedin: "#", github: "" }, connections: 120, callAvailable: true
    },
    {
      id: "p016", photo: "assets/img/avatars/p016.jpg", name: "Tanvi Reddy", role: "senior", department: "ECE", batch: 2027,
      verification: "verified", headline: "Final-year · Signal Processing · GATE 2027",
      company: "", location: "Campus",
      bio: "Preparing for GATE and planning M.Tech. Sharing my notes for Signals & Systems.",
      skills: ["Signal Processing", "MATLAB", "Python", "Communication Systems"],
      openTo: ["Study Groups", "GATE Guidance"],
      experience: [{ title: "Intern", org: "ISRO", period: "Summer 2025" }],
      achievements: ["ISRO Internship 2025"],
      email: "tanvi.reddy@example.com", phone: "+91 83XXX XX616",
      links: { linkedin: "#", github: "" }, connections: 167, callAvailable: true
    }
  ],

  opportunities: [
    {
      id: "o001", title: "Software Engineering Intern", org: "Microsoft", category: "internship",
      mode: "hybrid", location: "Hyderabad", stipend: "₹80,000 / month", duration: "10 weeks",
      deadline: "2026-10-20", postedBy: "p001", tags: ["DSA", "Java", "C#"],
      description: "Work with Azure engineering teams on real production features. Mentorship from senior engineers, and a PPO opportunity for high performers.",
      eligibility: "B.Tech CSE/IT/ECE, batch 2028. CGPA 7.0+.", applyUrl: "#"
    },
    {
      id: "o002", title: "Product Management Intern", org: "Razorpay", category: "internship",
      mode: "onsite", location: "Bengaluru", stipend: "₹60,000 / month", duration: "8 weeks",
      deadline: "2026-10-12", postedBy: "p006", tags: ["Product", "Analytics", "SQL"],
      description: "Own a feature end-to-end: user research, PRD writing, working with engineering and launching.",
      eligibility: "Any branch, MBA or final-year B.Tech.", applyUrl: "#"
    },
    {
      id: "o003", title: "Data Analyst (Fresher)", org: "Flipkart", category: "job",
      mode: "onsite", location: "Bengaluru", stipend: "₹14 LPA", duration: "Full-time",
      deadline: "2026-11-05", postedBy: "p014", tags: ["SQL", "Python", "Excel"],
      description: "Join the analytics team to build dashboards and drive business decisions with data.",
      eligibility: "Batch 2027, any engineering branch.", applyUrl: "#"
    },
    {
      id: "o004", title: "Smart India Hackathon 2026 — Internal Round", org: "College Innovation Cell", category: "hackathon",
      mode: "onsite", location: "Main Auditorium", stipend: "Prizes worth ₹1,00,000", duration: "36 hours",
      deadline: "2026-10-08", postedBy: "p009", tags: ["Teams of 6", "Innovation", "Open Problem Statements"],
      description: "Internal selection round for SIH 2026. Top 5 teams get nominated for the national round.",
      eligibility: "All students. Teams must include at least one female member.", applyUrl: "#"
    },
    {
      id: "o005", title: "AWS Cloud Practitioner — Free Voucher Program", org: "AWS Academy", category: "certification",
      mode: "remote", location: "Online", stipend: "Free (voucher)", duration: "Self-paced",
      deadline: "2026-11-30", postedBy: "p012", tags: ["AWS", "Cloud"],
      description: "Complete the AWS Academy Cloud Foundations course and get a 100% exam voucher.",
      eligibility: "All students with a college email.", applyUrl: "#"
    },
    {
      id: "o006", title: "VLSI Design Trainee", org: "Qualcomm", category: "job",
      mode: "onsite", location: "Bengaluru", stipend: "₹18 LPA", duration: "Full-time",
      deadline: "2026-10-25", postedBy: "p004", tags: ["Verilog", "VLSI", "Digital Design"],
      description: "Graduate trainee program in physical design and verification.",
      eligibility: "B.Tech/M.Tech ECE/EE, batch 2027.", applyUrl: "#"
    },
    {
      id: "o007", title: "UX Design Intern", org: "Adobe", category: "internship",
      mode: "remote", location: "Remote", stipend: "₹50,000 / month", duration: "12 weeks",
      deadline: "2026-11-15", postedBy: "p008", tags: ["Figma", "UX Research", "Portfolio"],
      description: "Design experiences for Adobe Express. Portfolio required.",
      eligibility: "Any branch with a strong design portfolio.", applyUrl: "#"
    },
    {
      id: "o008", title: "Google Cloud Arcade Challenge", org: "Google Cloud", category: "certification",
      mode: "remote", location: "Online", stipend: "Swag + Badges", duration: "6 weeks",
      deadline: "2026-10-30", postedBy: "p002", tags: ["GCP", "Cloud", "Badges"],
      description: "Complete hands-on labs, earn skill badges and win exclusive Google swag.",
      eligibility: "Open to all students.", applyUrl: "#"
    },
    {
      id: "o009", title: "HackCampus 2026", org: "Coding Club", category: "hackathon",
      mode: "hybrid", location: "CSE Block + Online", stipend: "Prizes worth ₹50,000", duration: "24 hours",
      deadline: "2026-11-10", postedBy: "p007", tags: ["Web", "AI", "Open Innovation"],
      description: "Annual inter-college hackathon. Build anything and pitch it to industry judges.",
      eligibility: "Teams of 2–4. Open to all colleges.", applyUrl: "#"
    },
    {
      id: "o010", title: "Graduate Engineer Trainee", org: "L&T Construction", category: "job",
      mode: "onsite", location: "Pan India", stipend: "₹7.5 LPA", duration: "Full-time",
      deadline: "2026-12-01", postedBy: "p011", tags: ["Civil", "Site Engineering"],
      description: "Two-year rotational program across L&T infrastructure projects.",
      eligibility: "B.Tech Civil/Mechanical, batch 2027. No active backlogs.", applyUrl: "#"
    },
    {
      id: "o011", title: "EV Powertrain Research Intern", org: "Tata Motors", category: "internship",
      mode: "onsite", location: "Pune", stipend: "₹30,000 / month", duration: "8 weeks",
      deadline: "2026-11-20", postedBy: "p005", tags: ["EV", "MATLAB", "Simulink"],
      description: "Work on battery management and motor control simulations.",
      eligibility: "B.Tech ME/EE/ECE, batch 2028.", applyUrl: "#"
    },
    {
      id: "o012", title: "Machine Learning Specialization", org: "Coursera (Financial Aid)", category: "certification",
      mode: "remote", location: "Online", stipend: "Free with financial aid", duration: "3 months",
      deadline: "2026-12-15", postedBy: "p014", tags: ["ML", "Python"],
      description: "Andrew Ng's ML specialization. The club helps students apply for financial aid.",
      eligibility: "Open to all.", applyUrl: "#"
    }
  ],

  resources: [
    {
      id: "r001", title: "DSA Complete Notes (Arrays → Graphs)", type: "notes", subject: "Data Structures",
      department: "CSE", author: "p007", format: "PDF", size: "4.2 MB", pages: 120, downloads: 1320,
      description: "Handwritten, well-organised notes covering every core data structure with solved problems.",
      url: "https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-dsa-tutorial/"
    },
    {
      id: "r002", title: "System Design Primer", type: "roadmap", subject: "System Design",
      department: "CSE", author: "p001", format: "Link", size: "—", pages: null, downloads: 980,
      description: "A curated roadmap to learn scalable system design for SDE interviews.",
      url: "https://github.com/donnemartin/system-design-primer"
    },
    {
      id: "r003", title: "MDN Web Docs — JavaScript Guide", type: "course", subject: "Web Development",
      department: "IT", author: "p009", format: "Link", size: "—", pages: null, downloads: 760,
      description: "The best free reference for learning modern JavaScript from scratch.",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"
    },
    {
      id: "r004", title: "Signals & Systems — Unit-wise Notes", type: "notes", subject: "Signals & Systems",
      department: "ECE", author: "p016", format: "PDF", size: "6.8 MB", pages: 88, downloads: 540,
      description: "Concise notes with GATE-level solved examples for each unit.",
      url: "https://ocw.mit.edu/courses/6-003-signals-and-systems-fall-2011/"
    },
    {
      id: "r005", title: "Previous Year Papers — Engineering Mathematics III", type: "paper", subject: "Mathematics",
      department: "CSE", author: "p012", format: "PDF", size: "2.1 MB", pages: 24, downloads: 2100,
      description: "Last 5 years of end-semester papers with answer hints.",
      url: "https://nptel.ac.in/"
    },
    {
      id: "r006", title: "CS50: Introduction to Computer Science", type: "video", subject: "Programming",
      department: "CSE", author: "p002", format: "Video", size: "—", pages: null, downloads: 1500,
      description: "Harvard's legendary intro CS course — free, with problem sets.",
      url: "https://cs50.harvard.edu/x/"
    },
    {
      id: "r007", title: "Machine Learning Roadmap 2026", type: "roadmap", subject: "Machine Learning",
      department: "CSE", author: "p014", format: "Link", size: "—", pages: null, downloads: 890,
      description: "Step-by-step path from Python basics to deploying ML models.",
      url: "https://roadmap.sh/ai-data-scientist"
    },
    {
      id: "r008", title: "Think Python (2nd Edition)", type: "ebook", subject: "Programming",
      department: "IT", author: "p003", format: "E-Book", size: "1.5 MB", pages: 244, downloads: 640,
      description: "A free, beginner-friendly book to learn Python and think like a programmer.",
      url: "https://greenteapress.com/wp/think-python-2e/"
    },
    {
      id: "r009", title: "Thermodynamics Lecture Series — NPTEL", type: "video", subject: "Thermodynamics",
      department: "ME", author: "p005", format: "Video", size: "—", pages: null, downloads: 420,
      description: "Complete IIT lecture series for Engineering Thermodynamics.",
      url: "https://nptel.ac.in/"
    },
    {
      id: "r010", title: "Figma for Beginners — UI Design", type: "course", subject: "UI/UX Design",
      department: "IT", author: "p008", format: "Link", size: "—", pages: null, downloads: 710,
      description: "Official Figma learning path covering frames, auto layout and prototyping.",
      url: "https://help.figma.com/hc/en-us/categories/360002051613"
    },
    {
      id: "r011", title: "Previous Year Papers — Structural Analysis", type: "paper", subject: "Structural Analysis",
      department: "CE", author: "p011", format: "PDF", size: "3.0 MB", pages: 30, downloads: 380,
      description: "End-semester and GATE questions with solutions.",
      url: "https://nptel.ac.in/"
    },
    {
      id: "r012", title: "Product Management Case Book", type: "ebook", subject: "Product Management",
      department: "MBA", author: "p006", format: "PDF", size: "5.4 MB", pages: 96, downloads: 520,
      description: "25 solved product cases for PM interviews: design, metrics and strategy.",
      url: "https://www.productplan.com/learn/"
    }
  ],

  events: [
    {
      id: "e001", title: "Resume & LinkedIn Makeover Workshop", type: "workshop",
      date: "2026-10-03", time: "10:00 – 13:00", venue: "Seminar Hall A", mode: "offline",
      organizer: "Training & Placement Cell", speakers: ["p006", "p008"], seats: 120, registered: 96,
      tags: ["Career", "Resume"],
      description: "Get your resume reviewed live by alumni recruiters and learn to build a LinkedIn profile that stands out."
    },
    {
      id: "e002", title: "Cracking FAANG Interviews — Alumni Talk", type: "webinar",
      date: "2026-10-10", time: "18:00 – 19:30", venue: "Online (link after registration)", mode: "online",
      organizer: "Alumni Association", speakers: ["p001"], seats: 500, registered: 342,
      tags: ["Placements", "SDE"],
      description: "Aarav walks through his preparation strategy, a common interview structure, and live Q&A."
    },
    {
      id: "e003", title: "HackCampus 2026", type: "hackathon",
      date: "2026-11-21", time: "09:00 (24 hrs)", venue: "CSE Block", mode: "hybrid",
      organizer: "Coding Club", speakers: ["p007", "p009"], seats: 300, registered: 188,
      tags: ["Hackathon", "Prizes"],
      description: "24-hour inter-college hackathon with industry mentors, food, swag and ₹50,000 in prizes."
    },
    {
      id: "e004", title: "Intro to Machine Learning with Python", type: "workshop",
      date: "2026-10-17", time: "14:00 – 17:00", venue: "AI Lab, Block C", mode: "offline",
      organizer: "GDSC Campus Chapter", speakers: ["p002", "p014"], seats: 60, registered: 60,
      tags: ["AI/ML", "Hands-on"],
      description: "Hands-on session: train your first ML model in Google Colab. Bring your laptop."
    },
    {
      id: "e005", title: "Alumni Homecoming Meetup 2026", type: "meetup",
      date: "2026-12-20", time: "17:00 – 21:00", venue: "Central Lawn", mode: "offline",
      organizer: "Alumni Association", speakers: ["p004", "p011"], seats: 400, registered: 210,
      tags: ["Networking", "Alumni"],
      description: "An evening of networking with alumni from 2005–2025, followed by dinner and music."
    },
    {
      id: "e006", title: "GATE 2027 Strategy Seminar", type: "seminar",
      date: "2026-10-24", time: "11:00 – 13:00", venue: "Main Auditorium", mode: "offline",
      organizer: "Academic Council", speakers: ["p011", "p016"], seats: 250, registered: 140,
      tags: ["GATE", "Higher Studies"],
      description: "Toppers and alumni share preparation timelines, resources and exam-day strategy."
    },
    {
      id: "e007", title: "TechnoVista — Annual Tech Fest", type: "fest",
      date: "2026-11-06", time: "3 days", venue: "Entire Campus", mode: "offline",
      organizer: "Student Council", speakers: [], seats: 2000, registered: 1240,
      tags: ["Fest", "Competitions"],
      description: "Robotics, coding, quizzes, workshops, pro-shows and more across 3 days."
    },
    {
      id: "e008", title: "Cloud Careers: AWS vs Azure vs GCP", type: "webinar",
      date: "2026-11-14", time: "19:00 – 20:00", venue: "Online", mode: "online",
      organizer: "Cloud Club", speakers: ["p012"], seats: 300, registered: 97,
      tags: ["Cloud", "Careers"],
      description: "Which cloud certification should you do first? A panel discussion with a live Q&A."
    },
    {
      id: "e009", title: "Design Thinking Bootcamp", type: "workshop",
      date: "2026-09-12", time: "10:00 – 16:00", venue: "Design Studio", mode: "offline",
      organizer: "E-Cell", speakers: ["p008"], seats: 50, registered: 50,
      tags: ["Design", "Innovation"],
      description: "A full-day bootcamp on empathy mapping, ideation and rapid prototyping."
    },
    {
      id: "e010", title: "Formula Student Car Unveiling", type: "meetup",
      date: "2026-12-05", time: "16:00 – 18:00", venue: "Mechanical Workshop", mode: "offline",
      organizer: "Formula Student Team", speakers: ["p005"], seats: 200, registered: 75,
      tags: ["Automotive", "Showcase"],
      description: "Watch the unveiling of our 2026 race car, then take a tour of the engineering behind it."
    }
  ]
};
