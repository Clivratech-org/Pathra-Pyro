"use client";

import { useEffect, useState } from "react";

export function Countdown({ endsAt }: { endsAt: string }) {
  const [t, setT] = useState({ d: "00", h: "00", m: "00", s: "00" });
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const target = new Date(endsAt).getTime();
    function tick() {
      if (!Number.isFinite(target)) {
        setT({ d: "00", h: "00", m: "00", s: "00" });
        setEnded(true);
        return;
      }
      let diff = target - Date.now();
      if (diff < 0) {
        diff = 0;
        setEnded(true);
      } else {
        setEnded(false);
      }
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
  }, [endsAt]);

  return (
    <>
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
      {ended && <p className="countdown-ended">This offer has ended.</p>}
    </>
  );
}
