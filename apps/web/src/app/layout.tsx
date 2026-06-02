import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ExperienceProvider } from "@/components/providers/ExperienceProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vinicius Ferreira | Portifólio",
  description:
    "Portfólio pessoal de Vinicius Ferreira, desenvolvedor full stack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
        <ExperienceProvider>{children}</ExperienceProvider>
      </body>
    </html>
  );
}