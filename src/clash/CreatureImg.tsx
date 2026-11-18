import { useEffect, useRef } from "react";
import { sprite } from "./sprites.ts";

/** A creature picture at any size, kept pixel-sharp. */
export default function CreatureImg({ id, back = false, size = 48, className, title }: { id: string; back?: boolean; size?: number; className?: string; title?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const x = cv.current?.getContext("2d");
    if (!x) return;
    x.clearRect(0, 0, 40, 40);
    x.drawImage(sprite(id, back), 0, 0);
  }, [id, back]);
  return <canvas ref={cv} width={40} height={40} className={`creature-img ${className ?? ""}`} style={{ width: size, height: size }} role="img" aria-label={title} />;
}
