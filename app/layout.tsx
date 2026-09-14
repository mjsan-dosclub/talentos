import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import FcmNotificationBanner from "@/components/FcmNotificationBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

import { getSystemConfig } from "@/lib/config";

export async function generateMetadata(): Promise<Metadata> {
  const config = getSystemConfig();
  return {
    title: config.seo?.metaTitle || "DOS Club TalentOS — Student Growth & Talent Intelligence",
    description:
      config.seo?.metaDescription ||
      "Operating platform for DeScience Open Source Club documenting 27-workshop technical execution across Tamil Nadu and global partners.",
    keywords: config.seo?.metaKeywords,
    icons: {
      icon: config.branding?.logoUrl || "/dos-club-logo.png",
      apple: config.branding?.logoUrl || "/dos-club-logo.png",
    },
    openGraph: {
      title: config.seo?.metaTitle,
      description: config.seo?.metaDescription,
      images: [config.seo?.ogImage || "/og-image.png"],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FBFBFB] text-neutral-900">
        {children}
        <PwaRegister />
        <FcmNotificationBanner />
      </body>
    </html>
  );
}
