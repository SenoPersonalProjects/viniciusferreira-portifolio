import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { roadmap, type RoadmapItem } from "@/data/roadmap";
import { stack } from "@/data/stack";

export type ContactLink = {
  id: string;
  label: string;
  type: "email" | "github" | "linkedin" | "external";
  url: string;
  order: number;
  visible: boolean;
};

export type TechnologyGroup = {
  id: string;
  category: string;
  items: string[];
  order: number;
};

export type PortfolioProject = (typeof projects)[number] & {
  order?: number;
  published?: boolean;
};

export type PortfolioProfile = typeof profile;

export type PortfolioContent = {
  profile: PortfolioProfile;
  contactLinks: ContactLink[];
  technologies: TechnologyGroup[];
  projects: PortfolioProject[];
  roadmap: RoadmapItem[];
};

export const fallbackPortfolioContent: PortfolioContent = {
  profile,
  contactLinks: [
    {
      id: "github",
      label: "GitHub",
      type: "github",
      url: profile.socialLinks.github,
      order: 1,
      visible: Boolean(profile.socialLinks.github),
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      type: "linkedin",
      url: profile.socialLinks.linkedin,
      order: 2,
      visible: Boolean(profile.socialLinks.linkedin),
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      url: profile.socialLinks.email ? `mailto:${profile.socialLinks.email}` : "",
      order: 3,
      visible: Boolean(profile.socialLinks.email),
    },
  ],
  technologies: stack.map((group, index) => ({
    id: group.category.toLowerCase().replace(/\s+/g, "-"),
    category: group.category,
    items: group.items,
    order: index + 1,
  })),
  projects: projects.map((project, index) => ({
    ...project,
    order: index + 1,
    published: true,
  })),
  roadmap,
};
