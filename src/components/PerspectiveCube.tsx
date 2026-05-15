import { useEffect } from "react";

export default function PerspectiveCube() {
  useEffect(() => {
    const cubeWrap = document.querySelector(".cube-wrap") as HTMLElement | null;
    if (!cubeWrap) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      cubeWrap.style.transform = `translateY(calc(-50% + ${scrollY * 0.3}px))`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div
        className="cube-wrap hidden md:block"
        style={{
          position: "absolute",
          right: "10%",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1,
        }}
      >
        <div className="cube">
          <div className="cube-face face-front" />
          <div className="cube-face face-back" />
          <div className="cube-face face-right" />
          <div className="cube-face face-left" />
          <div className="cube-face face-top" />
          <div className="cube-face face-bottom" />
        </div>
      </div>
      {/* Mobile cube */}
      <div
        className="cube-wrap md:hidden"
        style={{
          position: "absolute",
          right: "-20%",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 0,
          opacity: 0.4,
        }}
      >
        <div className="cube">
          <div className="cube-face face-front" />
          <div className="cube-face face-back" />
          <div className="cube-face face-right" />
          <div className="cube-face face-left" />
          <div className="cube-face face-top" />
          <div className="cube-face face-bottom" />
        </div>
      </div>
      {/* Shadow */}
      <div
        className="cube-shadow hidden md:block"
      />
    </>
  );
}