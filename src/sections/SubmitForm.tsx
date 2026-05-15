import { useState, useRef, useEffect } from "react";
import { User, MapPin, Calendar, ArrowRight, Check, Home, Search } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type FormStatus = "idle" | "submitting" | "success";
type PostType = "rental" | "seeking";

export default function SubmitForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [postType, setPostType] = useState<PostType>("rental");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!formRef.current) return;

    gsap.fromTo(
      formRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: formRef.current,
          start: "top 85%",
          once: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }, 600);
  };

  const inputClasses =
    "w-full h-12 px-4 pl-11 rounded-xl border border-gray-200 bg-white text-warm-gray text-base placeholder:text-warm-gray/40 outline-none transition-all duration-200 focus:border-coral focus:shadow-[0_0_0_3px_rgba(255,107,107,0.15)]";

  return (
    <section
      id="submit-form"
      className="relative min-h-[100dvh] bg-white flex items-center overflow-hidden"
    >
      {/* Left decorative block */}
      <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-soft-purple/10 hidden lg:block" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-[80px] md:py-[120px] w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Copy */}
          <div>
            <p className="text-sm font-medium text-coral tracking-widest mb-4">
              发布信息
            </p>
            <h2 className="font-serif-display text-[36px] md:text-[48px] leading-[1.2] text-warm-gray mb-6">
              发布你的
              <br />
              房源或需求
            </h2>
            <p className="text-base text-warm-gray/60 leading-[1.8] mb-8 max-w-md">
              {postType === "rental"
                ? "有房要出租？填写房源信息，我们帮你找到正在找房的女孩子。"
                : "正在找房住？发布你的需求，匹配到有房出租的姐妹。"}
              匹配成功后，将展示中间人微信。
            </p>

            {/* Decorative spinning cube wireframe */}
            <div className="hidden lg:block">
              <div
                className="w-10 h-10 border-2 border-soft-purple"
                style={{
                  animation: "cube-rotate 10s linear infinite",
                  transformStyle: "preserve-3d",
                }}
              />
            </div>
          </div>

          {/* Right: Form */}
          <div ref={formRef}>
            <form
              onSubmit={handleSubmit}
              className="max-w-md mx-auto lg:mx-0 lg:ml-auto bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-gray-100"
            >
              <div className="space-y-6">
                {/* Post Type Toggle */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPostType("rental")}
                    className={`flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-medium transition-all duration-200 ${
                      postType === "rental"
                        ? "bg-coral text-white shadow-sm"
                        : "bg-cream text-warm-gray/70 hover:bg-light-pink hover:text-coral"
                    }`}
                  >
                    <Home className="w-4 h-4" strokeWidth={1.5} />
                    我有房出租
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType("seeking")}
                    className={`flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-medium transition-all duration-200 ${
                      postType === "seeking"
                        ? "bg-soft-purple text-white shadow-sm"
                        : "bg-cream text-warm-gray/70 hover:bg-[#F0E8FF] hover:text-soft-purple"
                    }`}
                  >
                    <Search className="w-4 h-4" strokeWidth={1.5} />
                    我正在找房
                  </button>
                </div>

                {/* Nickname */}
                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    placeholder="怎么称呼你"
                    className={inputClasses}
                    required
                  />
                </div>

                {/* Location */}
                <div className="relative">
                  <MapPin
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    placeholder="房屋位置 / 期望区域"
                    className={inputClasses}
                    required
                  />
                </div>

                {/* Type-specific fields */}
                {postType === "rental" ? (
                  <>
                    {/* Price */}
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40 text-sm">
                        &yen;
                      </span>
                      <input
                        type="number"
                        placeholder="月租金"
                        className={`${inputClasses} pl-8`}
                        required
                      />
                    </div>
                    {/* Room Type */}
                    <div className="relative">
                      <Home
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40"
                        strokeWidth={1.5}
                      />
                      <input
                        type="text"
                        placeholder="房型，如：主卧、次卧、一居室"
                        className={inputClasses}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Budget Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40 text-sm">
                          &yen;
                        </span>
                        <input
                          type="number"
                          placeholder="最低预算"
                          className={`${inputClasses} pl-8`}
                          required
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40 text-sm">
                          &yen;
                        </span>
                        <input
                          type="number"
                          placeholder="最高预算"
                          className={`${inputClasses} pl-8`}
                          required
                        />
                      </div>
                    </div>
                    {/* Move-in Date */}
                    <div className="relative">
                      <Calendar
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40"
                        strokeWidth={1.5}
                      />
                      <input
                        type="date"
                        className={inputClasses}
                        required
                      />
                    </div>
                  </>
                )}

                {/* Description */}
                <div className="relative">
                  <textarea
                    placeholder={
                      postType === "rental"
                        ? "描述一下房源情况：楼层、朝向、家具、周边配套等"
                        : "描述你的需求：房型偏好、生活习惯、对室友的期望等"
                    }
                    rows={4}
                    className={`${inputClasses} py-3 h-auto resize-none`}
                    style={{ paddingLeft: "1rem" }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className={`w-full h-14 rounded-xl font-medium text-base text-white flex items-center justify-center gap-2 transition-all duration-300 ${
                    status === "success"
                      ? "bg-soft-purple"
                      : postType === "rental"
                        ? "bg-coral hover:bg-coral-dark"
                        : "bg-soft-purple hover:bg-[#B89CE8]"
                  } disabled:opacity-80`}
                >
                  {status === "idle" && (
                    <>
                      {postType === "rental" ? "发布房源" : "发布找房需求"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                  {status === "submitting" && (
                    <span className="animate-pulse">提交中...</span>
                  )}
                  {status === "success" && (
                    <>
                      已提交 <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}