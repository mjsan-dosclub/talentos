"use client";

import { useEffect, useState } from "react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setVisible(window.scrollY > 200);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to Top"
      className={`fixed bottom-6 right-6 z-[9999] px-4 py-2.5 rounded-full bg-[#23262F] hover:bg-[#FF592C] text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-white/20 backdrop-blur-md transition-all duration-300 flex items-center gap-2 group cursor-pointer text-xs font-bold tracking-wide ${
        visible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      }`}
      title="Scroll Back to Top"
    >
      <span>Back to Top</span>
      <svg
        className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}
