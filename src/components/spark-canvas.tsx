"use client";

import { useEffect, useRef } from "react";

export function SparkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;
    const colors = ["#e8b94d", "#ff8a2b", "#ff5a3c", "#f4d78a"];
    type P = { x: number; y: number; vx: number; vy: number; life: number; decay: number; color: string; size: number };
    let particles: P[] = [];

    function resize() {
      w = canvas!.width = canvas!.offsetWidth;
      h = canvas!.height = canvas!.offsetHeight;
    }
    function spawnBurst(x: number, y: number) {
      const n = 26;
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n + Math.random() * 0.3;
        const speed = 1.2 + Math.random() * 2.6;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.008 + Math.random() * 0.012,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1 + Math.random() * 2,
        });
      }
    }
    function loopBurst() {
      if (w > 0 && h > 0) spawnBurst(Math.random() * w, Math.random() * h * 0.7);
      timer = setTimeout(loopBurst, 900 + Math.random() * 1200);
    }
    function tick() {
      ctx!.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.life -= p.decay;
        ctx!.globalAlpha = Math.max(p.life, 0);
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      });
      particles = particles.filter((p) => p.life > 0);
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }
    window.addEventListener("resize", resize);
    resize();
    loopBurst();
    tick();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  return <canvas id="sparkCanvas" ref={ref} />;
}
