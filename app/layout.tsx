import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "DOS Club TalentOS — Student Growth & Talent Intelligence",
  description: "Operating platform for DeScience Open Source Club documenting 27-workshop technical execution across Tamil Nadu and global partners.",
  icons: {
    icon: "/dos-club-logo.png",
    apple: "/dos-club-logo.png",
  },
};

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
      </body>
    </html>
  );
}
