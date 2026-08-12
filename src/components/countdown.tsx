"use client";

import { useEffect, useState } from "react";

const TARGET = new Date("2026-11-08T00:00:00");

export function Countdown() {
  const [t, setT] = useState({ d: "00", h: "00", m: "00", s: "00" });

  useEffect(() => {
    function tick() {
      let diff = TARGET.getTime() - Date.now();
      if (diff < 0) diff = 0;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setT({
        d: String(d).padStart(2, "0"),
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="countdown-grid">
      {[
        [t.d, "Days"],
        [t.h, "Hours"],
        [t.m, "Mins"],
        [t.s, "Secs"],
      ].map(([n, l]) => (
        <div className="box" key={l}>
          <div className="n">{n}</div>
          <div className="l">{l}</div>
        </div>
      ))}
    </div>
  );
}
