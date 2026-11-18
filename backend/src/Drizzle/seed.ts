import "dotenv/config";
import db from "./db.js";
import {
  admins,
  heroProfile,
  heroSkills,
  socialLinks,
  projects,
  certifications,
  setting,
  education,
  experience,
  technologies,
  communityMoments,
  pictorials,
  resume,
} from "./schema.js";

const seed = async () => {
  try {
    await db.insert(admins).values({
      email: "emmanuelmose10204@gmail.com",
    });

    await db.insert(heroProfile).values({
      fullName: "Emmanuel Guru",
      greeting: "Hi, It's",
      bio: "I am a computer science student at Masinde Muliro University, Innovative and results-driven Software Developer with a solid background in full-stack web development, data analysis, and UI/UX design. Passionate about building scalable applications and intuitive user experiences. Skilled in modern technologies including React.js, Node.js, Django, and Express.js, with experience delivering high-quality solutions. Proficient in data analysis and visualization, enabling data-driven decision-making. Adept at cross-functional collaboration, project management, and leveraging cloud computing to deploy reliable applications.",
      cvCloudinaryUrl: null,
      profileImageUrl: null,
    });

    await db.insert(heroSkills).values([
      { title: "Frontend Developer", displayOrder: 1, isActive: true },
      { title: "Backend Developer", displayOrder: 2, isActive: true },
      { title: "System Analyst", displayOrder: 3, isActive: true },
      { title: "Designer", displayOrder: 4, isActive: true },
    ]);

    await db.insert(socialLinks).values([
      {
        platformName: "GitHub",
        platformIconCloudinaryUrl: null,
        platformIconUrl: null,
        url: "https://github.com/.",
        displayOrder: 1,
        isActive: true,
      },
      {
        platformName: "LinkedIn",
        platformIconCloudinaryUrl: null,
        platformIconUrl: null,
        url: "https://www.linkedin.com/",
        displayOrder: 2,
        isActive: true,
      },
      {
        platformName: "Twitter",
        platformIconCloudinaryUrl: null,
        platformIconUrl: null,
        url: "https://x.com/home",
        displayOrder: 3,
        isActive: true,
      },
      {
        platformName: "Instagram",
        platformIconCloudinaryUrl: null,
        platformIconUrl: null,
        url: "https://www.instagram.com/combmose/",
        displayOrder: 4,
        isActive: true,
      },
      {
        platformName: "WhatsApp",
        platformIconCloudinaryUrl: null,
        platformIconUrl: null,
        url: "https://wa.me/254718146250",
        displayOrder: 5,
        isActive: true,
      },
      {
        platformName: "Facebook",
        platformIconCloudinaryUrl: null,
        platformIconUrl: null,
        url: "https://www.facebook.com/profile.php?id=100086807377245",
        displayOrder: 6,
        isActive: true,
      },
      {
        platformName: "TikTok",
        platformIconCloudinaryUrl: null,
        platformIconUrl: null,
        url: "https://www.tiktok.com/@user7984862204094",
        displayOrder: 7,
        isActive: true,
      },
      {
        platformName: "YouTube",
        platformIconCloudinaryUrl: null,
        platformIconUrl: null,
        url: "https://www.youtube.com/@EmmanuelMose-cd9ee",
        displayOrder: 8,
        isActive: true,
      },
      {
        platformName: "Telegram",
        platformIconCloudinaryUrl: null,
        platformIconUrl: null,
        url: "https://t.me/+254718146250",
        displayOrder: 9,
        isActive: true,
      },
    ]);

    await db.insert(projects).values([
      {
        title: "VelvetStay",
        description:
          "A hotel management system for managing rooms and ordering food.",
        imageCloudinaryUrl: null,
        imageUrl: null,
        liveUrl: null,
        githubUrl: null,
        techStack: "React, Node.js, Express, PostgreSQL",
        displayOrder: 1,
        isPublished: true,
      },
      {
        title: "MediLab",
        description:
          "A hospital management system for patients, nurses, doctors, and other staff.",
        imageCloudinaryUrl: null,
        imageUrl: null,
        liveUrl: null,
        githubUrl: null,
        techStack: "React, Node.js, Express, PostgreSQL",
        displayOrder: 2,
        isPublished: true,
      },
      {
        title: "EventFastisha",
        description:
          "A system for arranging events and booking rooms for events.",
        imageCloudinaryUrl: null,
        imageUrl: null,
        liveUrl: null,
        githubUrl: null,
        techStack: "React, Node.js, Express, PostgreSQL",
        displayOrder: 3,
        isPublished: true,
      },
    ]);

    await db.insert(certifications).values([
      {
        title: "Certificate in Web Development",
        description: "Full-stack web development certification.",
        issuer: "Masinde Muliro University",
        imageCloudinaryUrl: null,
        imageUrl: null,
        displayOrder: 1,
      },
    ]);

    await db.insert(setting).values([
      { settingKey: "max_admin_limit", settingValue: "5" },
      {
        settingKey: "footer_copyright",
        settingValue: "All rights reserved © EmmanuelMose 2025",
      },
      { settingKey: "super_admin_whatsapp", settingValue: "254718146250" },
      {
        settingKey: "super_admin_email",
        settingValue: "emmanuelmose10204@gmail.com",
      },
      { settingKey: "site_title", settingValue: "Emmanuel Guru Portfolio" },
    ]);

    await db.insert(education).values([
      {
        institutionName: "Masinde Muliro University",
        degreeOrCourse: "BSc. Computer Science",
        description:
          "Studying computer science with a focus on software development and data analysis.",
        startDate: "2022",
        endDate: "Present",
        imageCloudinaryUrl: null,
        imageUrl: null,
        displayOrder: 1,
      },
    ]);

    await db.insert(experience).values([
      {
        companyName: "Freelance",
        roleTitle: "Full-Stack Developer",
        description:
          "Building scalable web applications for clients using React, Node.js, and PostgreSQL.",
        startDate: "2023",
        endDate: "Present",
        displayOrder: 1,
      },
    ]);

    await db.insert(technologies).values([
      {
        name: "React",
        imageCloudinaryUrl: null,
        imageUrl: null,
        displayOrder: 1,
      },
      {
        name: "Node.js",
        imageCloudinaryUrl: null,
        imageUrl: null,
        displayOrder: 2,
      },
      {
        name: "Express.js",
        imageCloudinaryUrl: null,
        imageUrl: null,
        displayOrder: 3,
      },
      {
        name: "PostgreSQL",
        imageCloudinaryUrl: null,
        imageUrl: null,
        displayOrder: 4,
      },
      {
        name: "Django",
        imageCloudinaryUrl: null,
        imageUrl: null,
        displayOrder: 5,
      },
      {
        name: "TypeScript",
        imageCloudinaryUrl: null,
        imageUrl: null,
        displayOrder: 6,
      },
    ]);

    await db.insert(communityMoments).values([
      {
        title: "Tech Community Meetup",
        description:
          "Participated in a local tech community meetup focused on modern web development.",
        imageCloudinaryUrl: null,
        imageUrl: null,
        dateOfEvent: "2024",
        displayOrder: 1,
      },
    ]);

    await db.insert(pictorials).values([
      {
        category: "TECH_FIELD",
        title: "Hackathon 2024",
        description: "Team photo at the university hackathon.",
        imageCloudinaryUrl: null,
        imageUrl: null,
        displayOrder: 1,
      },
      {
        category: "OTHER_ASPECTS_OF_LIFE",
        title: "Travel",
        description: "Exploring new places.",
        imageCloudinaryUrl: null,
        imageUrl: null,
        displayOrder: 2,
      },
    ]);

    await db.insert(resume).values({
      fileCloudinaryUrl: null,
      fileUrl: null,
      isActive: true,
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();