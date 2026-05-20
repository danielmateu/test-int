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

export interface CVData {
  title?: string;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
  coverLetter: string;
  theme: CVTheme;
}
