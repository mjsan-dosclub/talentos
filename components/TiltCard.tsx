"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum rotation in degrees (default 6)
  scale?: number; // Scale on hover (default 1.02)
  glare?: boolean; // Whether to render dynamic light sheen
  perspective?: number; // 3D perspective depth in px (default 1000)
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 6,
  scale = 1.02,
  glare = true,
  perspective = 1000,
  ...rest
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>(
    `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
  );
  const [transitionStyle, setTransitionStyle] = useState<string>("transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)");
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Calculate normalized pointer position (-0.5 to 0.5)
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const normX = x - 0.5;
      const normY = y - 0.5;

      const rotateX = -(normY * maxTilt * 2);
      const rotateY = normX * maxTilt * 2;

      // Instant response during move
      setTransitionStyle("transform 0.1s ease-out");
      setTransformStyle(
        `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
          2
        )}deg) scale3d(${scale}, ${scale}, ${scale})`
      );

      if (glare) {
        setGlarePosition({
          x: Math.round(x * 100),
          y: Math.round(y * 100),
          opacity: 0.18,
        });
      }
    },
    [reducedMotion, maxTilt, scale, glare, perspective]
  );

  const handlePointerLeave = useCallback(() => {
    if (reducedMotion) return;
    // Smooth deceleration back to flat resting state
    setTransitionStyle("transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)");
    setTransformStyle(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
    if (glare) {
      setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [reducedMotion, perspective, glare]);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative preserve-3d transition-shadow will-change-transform ${className}`}
      style={{
        transform: transformStyle,
        transition: transitionStyle,
      }}
      {...rest}
    >
      {children}

      {/* Dynamic Specular Sheen / Light Glare Layer */}
      {glare && !reducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-20 overflow-hidden"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle 320px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.45), transparent 70%)`,
          }}
        />
      )}
    </div>
  );
}
