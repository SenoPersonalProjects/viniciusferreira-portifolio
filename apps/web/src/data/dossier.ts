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
    project: "PORTFOLIO GERENCIAVEL",
    subject: "VINICIUS FERREIRA",
    role: "DESENVOLVEDOR FULL STACK",
    status: "ATIVO",
    location: "BRASIL",
    stack: "NEXT.JS / NESTJS / TYPESCRIPT",
    note: "Desenvolvedor full stack com foco em aplicacoes web gerenciaveis, interfaces responsivas e APIs bem estruturadas.",
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
    note: "Full stack developer focused on manageable web applications, responsive interfaces, and well-structured APIs.",
    stamp: "CLASSIFIED",
    mainPhotoUrl: "/profile/detective/individual-1.jpeg",
    polaroidPhotoUrl: "/profile/detective/individual-2.jpeg",
  },
};

export const dossierContent = dossierByLocale.pt;
