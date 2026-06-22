export type Locale = 'pt-BR' | 'en';

export type PortfolioContent = {
  profile: {
    name: string;
    role: string;
    headline: string;
    location: string;
    summary: string;
    socialLinks: {
      github: string;
      linkedin: string;
      email: string;
    };
  };
  contactLinks: Array<{
    id: string;
    label: string;
    type: 'email' | 'github' | 'linkedin' | 'external';
    url: string;
    order: number;
    visible: boolean;
  }>;
  technologies: Array<{
    id: string;
    category: string;
    items: string[];
    order: number;
  }>;
  projects: Array<{
    title: string;
    slug: string;
    description: string;
    stack: string[];
    repositoryUrl: string;
    liveUrl: string;
    featured: boolean;
    frameCode: string;
    posterImage: string;
    previewImages: string[];
    published: boolean;
    order: number;
  }>;
  roadmap: Array<{
    id: string;
    startDate: string;
    endDate: string;
    title: string;
    type: 'formacao' | 'carreira' | 'projeto';
    summary: string;
    details: string;
    technologies: string[];
    order: number;
    published: boolean;
  }>;
};
