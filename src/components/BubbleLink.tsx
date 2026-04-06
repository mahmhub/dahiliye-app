"use client";

import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface BubbleLinkProps {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export function BubbleLink({ href, disabled, children }: BubbleLinkProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();

      const el = containerRef.current;
      if (!el) return;

      // Add pop animation to the bubble
      const bubble = el.querySelector<HTMLElement>("[data-bubble]");
      if (bubble) {
        bubble.classList.add("bubble-popping");
      }

      // Create splash particles
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const radius = rect.width / 2;

      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.4;
        const dist = radius * (0.6 + Math.random() * 0.6);
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        const size = 4 + Math.random() * 8;

        const particle = document.createElement("div");
        particle.className = "bubble-splash";
        particle.style.left = `${cx - size / 2}px`;
        particle.style.top = `${cy - size / 2}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.setProperty(
          "animation",
          `splash-particle ${0.3 + Math.random() * 0.3}s ease-out forwards`
        );
        // Set the end position via custom translate
        particle.style.setProperty("--tx", `${tx}px`);
        particle.style.setProperty("--ty", `${ty}px`);
        particle.animate(
          [
            { transform: "translate(0, 0) scale(1)", opacity: 0.9 },
            { transform: `translate(${tx}px, ${ty}px) scale(0.2)`, opacity: 0 },
          ],
          { duration: 300 + Math.random() * 200, easing: "ease-out", fill: "forwards" }
        );
        el.appendChild(particle);
      }

      // Navigate after animation
      setTimeout(() => {
        router.push(href);
      }, 350);
    },
    [href, disabled, router]
  );

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative rounded-full ${disabled ? "" : "cursor-pointer"} transition-transform ${disabled ? "" : "hover:scale-105"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300`}
      role={disabled ? undefined : "link"}
      tabIndex={disabled ? undefined : 0}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !disabled) handleClick(e as unknown as React.MouseEvent);
      }}
    >
      {children}
    </div>
  );
}
