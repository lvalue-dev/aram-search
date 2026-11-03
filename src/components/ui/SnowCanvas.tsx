"use client";

import { useEffect, useRef } from "react";

/** 배경에 떠다니는 눈송이. 저사양/모션 축소 설정에서는 그리지 않는다. */
export default function SnowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let raf = 0;
    let running = true;

    const COUNT = Math.min(90, Math.floor((w * h) / 18000));
    const flakes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.25 + Math.random() * 0.7,
      vx: -0.2 + Math.random() * 0.4,
      a: 0.15 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
    }));

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(draw);
    };

    let t = 0;
    function draw() {
      if (!running || !ctx) return;
      t += 0.01;
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += f.vy;
        f.x += f.vx + Math.sin(t + f.phase) * 0.3;
        if (f.y > h + 5) {
          f.y = -5;
          f.x = Math.random() * w;
        }
        if (f.x > w + 5) f.x = -5;
        if (f.x < -5) f.x = w + 5;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 240, 255, ${f.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-70" />;
}
