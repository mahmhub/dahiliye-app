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

      // Mobilde titreşim
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }

      // Sabit boyut — layout kaymaması için
      const rect = el.getBoundingClientRect();
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;

      // Pop animation
      const bubble = el.querySelector<HTMLElement>("[data-bubble]");
      if (bubble) {
        bubble.classList.add("bubble-popping");
      }

      // Splash particles
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const radius = rect.width / 2;

      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.4;
        const dist = radius * (0.5 + Math.random() * 0.5);
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        const size = 3 + Math.random() * 6;

        const particle = document.createElement("div");
        particle.className = "bubble-splash";
        particle.style.left = `${cx - size / 2}px`;
        particle.style.top = `${cy - size / 2}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.animate(
          [
            { transform: "translate(0, 0) scale(1)", opacity: 0.9 },
            { transform: `translate(${tx}px, ${ty}px) scale(0.2)`, opacity: 0 },
          ],
          { duration: 250 + Math.random() * 150, easing: "ease-out", fill: "forwards" }
        );
        el.appendChild(particle);
      }

      setTimeout(() => {
        router.push(href);
      }, 300);
    },
    [href, disabled, router]
  );

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`relative rounded-full ${disabled ? "" : "cursor-pointer"} ${disabled ? "" : "hover:scale-105"} transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300`}
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
