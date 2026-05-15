import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-12 transition-all duration-300 ${
        scrolled
          ? "bg-cream/85 backdrop-blur-md border-b border-coral/10"
          : "bg-transparent"
      }`}
    >
      {/* Brand */}
      <a
        href="#hero"
        className="font-serif-display text-2xl text-coral tracking-tight"
      >
        姐妹找房
      </a>

      {/* Nav links - hidden on mobile */}
      <div className="hidden md:flex items-center gap-8">
        <a
          href="#hero"
          className="text-sm font-medium text-warm-gray hover:text-coral transition-colors duration-200"
        >
          首页
        </a>
        <a
          href="#gallery"
          className="text-sm font-medium text-warm-gray hover:text-coral transition-colors duration-200"
        >
          需求广场
        </a>
        <a
          href="#submit-form"
          className="text-sm font-medium text-warm-gray hover:text-coral transition-colors duration-200"
        >
          提交需求
        </a>
      </div>

      {/* CTA Button */}
      <a
        href="#submit-form"
        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-coral text-white text-sm font-medium hover:bg-coral-dark transition-all duration-200 hover:-translate-y-px"
      >
        发布需求
        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
      </a>
    </nav>
  );
}