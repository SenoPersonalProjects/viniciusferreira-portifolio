import { profile } from "@/data/profile";

export const siteStack = [
  "Next.js",
  "React",
  "NestJS",
  "Node.js",
  "TypeScript",
] as const;

export const siteDescription =
  "Portfólio pessoal de Vinicius Ferreira, desenvolvedor full stack focado em Next.js, React, NestJS, Node.js e TypeScript.";

export const siteConfig = {
  name: profile.name,
  role: profile.role,
  title: `${profile.name} | ${profile.role}`,
  description: siteDescription,
  applicationName: "Portfólio Vinicius Ferreira",
  location: profile.location,
  stack: siteStack,
  github: profile.socialLinks.github,
  keywords: [
    "Vinicius Ferreira",
    "Desenvolvedor Full Stack",
    "portfolio",
    "portfólio",
    "Next.js",
    "React",
    "NestJS",
    "Node.js",
    "TypeScript",
    "Tailwind CSS",
  ],
};

export function getSiteUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();
  const rawUrl = explicitUrl || (vercelUrl ? `https://${vercelUrl}` : "");

  try {
    if (rawUrl) {
      const parsedUrl = new URL(rawUrl);

      return new URL(parsedUrl.origin);
    }
  } catch {
    // Keep local builds working even when an environment variable is malformed.
  }

  return new URL("http://localhost:3000");
}

export function absoluteSiteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function getPublicSocialLinks() {
  return [profile.socialLinks.github, profile.socialLinks.linkedin].filter(
    (url): url is string => Boolean(url),
  );
}
