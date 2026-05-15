import { ArrowRight } from "lucide-react";
import PerspectiveCube from "@/components/PerspectiveCube";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] bg-cream flex items-center overflow-hidden"
    >
      {/* Perspective Cube */}
      <PerspectiveCube />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="max-w-xl">
          {/* Tag */}
          <p className="text-sm font-medium text-coral tracking-widest mb-6">
            女生租房招租信息匹配
          </p>

          {/* Title */}
          <h1 className="font-serif-display text-[42px] md:text-[64px] leading-[1.1] text-warm-gray mb-6">
            有房出租
            <br />
            刚好有人找
          </h1>

          {/* Subtitle */}
          <p className="text-base text-warm-gray/60 leading-[1.8] max-w-[480px] mb-8">
            无论你是想出租空房，还是正在找房，发布你的信息，我们帮你精准匹配。安全、私密、省心。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <a
              href="#submit-form"
              className="inline-flex items-center gap-2 px-6 h-12 rounded-full bg-coral text-white font-medium hover:bg-coral-dark transition-all duration-200 hover:-translate-y-px"
            >
              上传我的需求
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </a>
            <a
              href="#gallery"
              className="inline-flex items-center gap-2 px-6 h-12 rounded-full border-2 border-coral text-coral font-medium hover:bg-coral hover:text-white transition-all duration-200"
            >
              浏览需求广场
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-coral border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-soft-purple border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-light-blue border-2 border-white relative">
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
            </div>
            <span className="text-sm text-warm-gray/60">
              已有 <span className="font-medium text-warm-gray">1,240</span> 位姐妹成功匹配房源
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}