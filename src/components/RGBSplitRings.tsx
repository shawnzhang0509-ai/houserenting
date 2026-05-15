export default function RGBSplitRings() {
  return (
    <div className="rgb-split-container">
      {/* Base rings */}
      <div className="ring-1" />
      <div className="ring-2" />
      {/* Glitch layers */}
      <div className="glitch-layer">
        <div className="ring-1" />
        <div className="ring-2" />
      </div>
      <div className="glitch-layer">
        <div className="ring-1" />
        <div className="ring-2" />
      </div>
    </div>
  );
}