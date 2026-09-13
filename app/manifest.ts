import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DOS Club TalentOS",
    short_name: "TalentOS",
    description: "Student Growth, Learning Evidence, and Talent Intelligence for DOS Club",
    start_url: "/",
    display: "standalone",
    background_color: "#FBFBFB",
    theme_color: "#0A0A0A",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
