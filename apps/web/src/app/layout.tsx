import type { Metadata } from "next";
import {
  Bebas_Neue,
  Courier_Prime,
  Geist,
  Geist_Mono,
  JetBrains_Mono,
  Limelight,
  Pinyon_Script,
  Special_Elite,
} from "next/font/google";

import { AppearanceProvider } from "@/components/providers/AppearanceProvider";
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

const limelight = Limelight({
  variable: "--font-limelight",
  subsets: ["latin"],
  weight: "400",
});

const pinyonScript = Pinyon_Script({
  variable: "--font-pinyon-script",
  subsets: ["latin"],
  weight: "400",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const specialElite = Special_Elite({
  variable: "--font-special-elite",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Vinicius Ferreira | Portfólio",
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
      className={`${geistSans.variable} ${geistMono.variable} ${jetBrainsMono.variable} ${limelight.variable} ${pinyonScript.variable} ${bebasNeue.variable} ${courierPrime.variable} ${specialElite.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-foreground)]">
        <LanguageProvider>
          <AppearanceProvider>{children}</AppearanceProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
