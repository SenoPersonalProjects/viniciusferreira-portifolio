export type DossierLocale = "pt" | "en";

export type DossierContent = {
  fileId: string;
  classification: string;
  project: string;
  subject: string;
  role: string;
  status: string;
  location: string;
  stack: string;
  note: string;
  stamp: string;
  mainPhotoUrl: string;
  polaroidPhotoUrl: string;
  redactions?: { x: number; y: number; w: number; h: number }[];
};

export const dossierByLocale: Record<DossierLocale, DossierContent> = {
  pt: {
    fileId: "VF-026",
    classification: "CONFIDENCIAL",
    project: "PORTFÓLIO GERENCIÁVEL",
    subject: "VINICIUS FERREIRA",
    role: "DESENVOLVEDOR FULL STACK",
    status: "ATIVO",
    location: "BRASIL",
    stack: "NEXT.JS / NESTJS / TYPESCRIPT",
    note: "Crio aplicações web modernas, performáticas e bem estruturadas, conectando frontend, backend e experiência do usuário.",
    stamp: "CONFIDENCIAL",
    mainPhotoUrl: "/profile/detective/individual-1.jpeg",
    polaroidPhotoUrl: "/profile/detective/individual-2.jpeg",
  },
  en: {
    fileId: "VF-026",
    classification: "CLASSIFIED",
    project: "MANAGEABLE PORTFOLIO",
    subject: "VINICIUS FERREIRA",
    role: "FULL STACK DEVELOPER",
    status: "ACTIVE",
    location: "BRAZIL",
    stack: "NEXT.JS / NESTJS / TYPESCRIPT",
    note: "I build modern, performant and well-structured web applications, connecting frontend, backend and user experience.",
    stamp: "CLASSIFIED",
    mainPhotoUrl: "/profile/detective/individual-1.jpeg",
    polaroidPhotoUrl: "/profile/detective/individual-2.jpeg",
  },
};

export const dossierContent = dossierByLocale.pt;