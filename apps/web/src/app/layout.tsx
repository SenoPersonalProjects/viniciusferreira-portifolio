import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  JetBrains_Mono,
  Rye,
  Sancreek,
  Special_Elite,
} from "next/font/google";

import { ExperienceProvider } from "@/components/providers/ExperienceProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const rye = Rye({
  variable: "--font-rye",
  subsets: ["latin"],
  weight: "400",
});

const sancreek = Sancreek({
  variable: "--font-sancreek",
  subsets: ["latin"],
  weight: "400",
});

const specialElite = Special_Elite({
  variable: "--font-special-elite",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Vinicius Ferreira | Portfolio",
  description:
    "Portfolio pessoal e personal portfolio de Vinicius Ferreira, desenvolvedor full stack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${jetBrainsMono.variable} ${rye.variable} ${sancreek.variable} ${specialElite.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-foreground)]">
        <LanguageProvider>
          <ExperienceProvider>{children}</ExperienceProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
