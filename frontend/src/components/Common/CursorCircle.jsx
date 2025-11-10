// CursorCircle.jsx
import { useEffect, useState } from "react";

export default function CursorCircle() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 w-4 h-4 rounded-full bg-sky-400/70 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-150"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    />
  );
}