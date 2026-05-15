import { useEffect, useRef, useState } from "react";

const TEXT = "MATCH \u00b7 ROOMIE \u00b7 SHARE \u00b7 HOME \u00b7 ";
const REPEAT_COUNT = 6;
const RADIUS = 180; // px

export default function CylinderText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fragments, setFragments] = useState<{ text: string; angle: number }[]>([]);

  useEffect(() => {
    // Build repeated text and measure to distribute around cylinder
    const fullText = TEXT.repeat(REPEAT_COUNT);
    // Split into chunks for visual distribution
    const chunkSize = Math.ceil(fullText.length / 12);
    const chunks: string[] = [];
    for (let i = 0; i < fullText.length; i += chunkSize) {
      chunks.push(fullText.slice(i, i + chunkSize));
    }

    // Measure approximate width using canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = '400 5rem "DM Serif Display", serif';

    const isMobile = window.innerWidth < 768;
    const actualRadius = isMobile ? 120 : RADIUS;
    const actualCircumference = 2 * Math.PI * actualRadius;

    let totalWidth = 0;
    const chunkWidths = chunks.map((chunk) => {
      const w = ctx.measureText(chunk).width;
      totalWidth += w;
      return w;
    });

    // Distribute chunks evenly around the full 360 degrees
    const fragmentData: { text: string; angle: number }[] = [];
    let currentAngle = 0;

    chunks.forEach((chunk, i) => {
      const chunkWidth = chunkWidths[i];
      const angleSpan = (chunkWidth / actualCircumference) * 360;
      const angle = currentAngle + angleSpan / 2;
      fragmentData.push({ text: chunk, angle });
      currentAngle += angleSpan;
    });

    setFragments(fragmentData);
  }, []);

  return (
    <div className="cylinder-wrapper bg-coral">
      <div className="cylinder-band" ref={containerRef}>
        {fragments.map((frag, i) => (
          <div
            key={i}
            className="cylinder-text"
            style={{
              transform: `rotateY(${frag.angle}deg) translateZ(${window.innerWidth < 768 ? 120 : RADIUS}px)`,
            }}
          >
            {frag.text}
          </div>
        ))}
      </div>
    </div>
  );
}