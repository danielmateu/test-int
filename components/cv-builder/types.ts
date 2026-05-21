export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  imageUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface TypographySettings {
  lineHeight: number;
  fontSize: number;
  wordSpacing: number;
  headerNameSize?: number;
  headerTitleSize?: number;
}

export interface SpacingSettings {
  sectionSpacing?: number;
  itemSpacing?: number;
  paragraphSpacing?: number;
  pagePadding?: number;
}

export interface CVTheme {
  color: string;
  font: string;
  layout: "classic" | "two-column" | "minimalist" | "modern" | "corporate";
  typography?: TypographySettings;
  spacing?: SpacingSettings;
}

export interface Project {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  description: string;
  url?: string;
}

export interface CVData {
  title?: string;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects?: Project[];
  other?: string;
  coverLetter: string;
  theme: CVTheme;
}

export function getHeaderDefaultSizes(layout: "classic" | "two-column" | "minimalist" | "modern" | "corporate") {
  switch (layout) {
    case "classic":
      return { nameSize: 36, titleSize: 20 };
    case "two-column":
      return { nameSize: 24, titleSize: 14 };
    case "minimalist":
      return { nameSize: 36, titleSize: 11 };
    case "modern":
      return { nameSize: 48, titleSize: 24 };
    case "corporate":
      return { nameSize: 48, titleSize: 20 };
    default:
      return { nameSize: 36, titleSize: 20 };
  }
}

