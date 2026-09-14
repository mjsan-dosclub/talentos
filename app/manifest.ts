import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TalentOS — DeScience Open Source Club",
    short_name: "TalentOS",
    description: "Student Evidence, Zero-Grace Attendance, and Talent Intelligence System",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FCFCFD",
    theme_color: "#FFFFFF",
    categories: ["education", "productivity", "utilities"],
    icons: [
      {
        src: "/dos-club-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/dos-club-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
