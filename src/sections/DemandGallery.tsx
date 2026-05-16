import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DemandCard from "@/components/DemandCard";

gsap.registerPlugin(ScrollTrigger);

type FilterType = "all" | "rental" | "seeking";

const mockListings = [
  {
    type: "rental" as const,
    nickname: "Sophie",
    location: "奥克兰中区 Auckland Central",
    description: "两居室主卧，近大学，阳光充足，家具齐全。",
    price: "NZD $300–350",
    leaseLayout: "合租·单卧室",
    leaseTerm: "长租（4周以上）",
    color: "coral",
  },
  {
    type: "seeking" as const,
    nickname: "Lily",
    location: "奥克兰中区 Auckland Central",
    description: "上班族，求安静合租，希望近公交。",
    budget: "NZD $250–400/周",
    leaseLayout: "合租·单卧室",
    leaseTerm: "长租（4周以上）",
    moveInDate: "8月入住",
    color: "purple",
  },
  {
    type: "rental" as const,
    nickname: "Mia",
    location: "基督城 Christchurch",
    description: "次卧招租，新装修，包基本水电。",
    price: "NZD $200–250",
    leaseLayout: "合租·单卧室",
    leaseTerm: "长租（4周以上）",
    color: "blue",
  },
  {
    type: "seeking" as const,
    nickname: "Zoe",
    location: "惠灵顿 Wellington",
    description: "学生，预算有限，可合租。",
    budget: "NZD $200–300/周",
    leaseLayout: "独立单间/开间",
    leaseTerm: "长租（4周以上）",
    moveInDate: "随时",
    color: "pink",
  },
  {
    type: "rental" as const,
    nickname: "Emma",
    location: "皇后镇 Queenstown",
    description: "季租主卧，山景，适合短期过渡。",
    price: "NZD $450–500",
    leaseLayout: "合租·单卧室",
    leaseTerm: "短租（4周以下）",
    color: "purple",
  },
  {
    type: "seeking" as const,
    nickname: "Chloe",
    location: "陶朗加 Tauranga",
    description: "带娃家庭，希望两居或主卧套间。",
    budget: "NZD $350–450/周",
    leaseLayout: "整租·两居室",
    leaseTerm: "长租（4周以上）",
    moveInDate: "9月",
    color: "coral",
  },
  {
    type: "rental" as const,
    nickname: "Grace",
    location: "奥克兰北岸 Auckland North Shore",
    description: "近海滩，小区安静，次卧带书桌。",
    price: "NZD $250–300",
    leaseLayout: "合租·单卧室",
    leaseTerm: "长租（4周以上）",
    color: "blue",
  },
  {
    type: "seeking" as const,
    nickname: "Ruby",
    location: "达尼丁 Dunedin",
    description: "研究生，作息规律，不烟不酒。",
    budget: "NZD $200–280/周",
    leaseLayout: "合租·单卧室",
    leaseTerm: "长租（4周以上）",
    moveInDate: "2月",
    color: "pink",
  },
  {
    type: "rental" as const,
    nickname: "Ivy",
    location: "汉密尔顿 Hamilton",
    description: "一居室分租，独立卫浴，近怀大。",
    price: "NZD $280–330",
    leaseLayout: "整租·一居室",
    leaseTerm: "长租（4周以上）",
    color: "coral",
  },
  {
    type: "seeking" as const,
    nickname: "Nina",
    location: "奥克兰东区 Auckland East",
    description: "IT 行业，希望离高速口近。",
    budget: "NZD $300–400/周",
    leaseLayout: "整租·一居室",
    leaseTerm: "长租（4周以上）",
    moveInDate: "尽快",
    color: "purple",
  },
  {
    type: "rental" as const,
    nickname: "Kate",
    location: "纳尔逊 Nelson",
    description: "阳光小屋次卧，适合远程办公。",
    price: "NZD $220–270",
    leaseLayout: "合租·单卧室",
    leaseTerm: "长租（4周以上）",
    color: "blue",
  },
  {
    type: "seeking" as const,
    nickname: "Amy",
    location: "新普利茅斯 New Plymouth",
    description: "短期工作三个月，求拎包入住。",
    budget: "NZD $200–350/周",
    leaseLayout: "独立单间/开间",
    leaseTerm: "短租（4周以下）",
    moveInDate: "11月",
    color: "pink",
  },
];

export default function DemandGallery() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredListings =
    filter === "all"
      ? mockListings
      : mockListings.filter((l) => l.type === filter);

  useEffect(() => {
    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll(".demand-card-wrapper");

    gsap.fromTo(
      cards,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
          once: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handleCardClick = () => {
    const el = document.getElementById("submit-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: "all", label: "全部" },
    { key: "rental", label: "有房出租" },
    { key: "seeking", label: "正在找房" },
  ];

  return (
    <section id="gallery" className="bg-white py-[80px] md:py-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-serif-display text-[36px] text-warm-gray mb-3">
            姐妹们的信息
          </h2>
          <p className="text-base text-warm-gray/60">
            有人有房要出租，有人在找房子住 —— 看看有没有合适你的
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-3 mb-10">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === btn.key
                  ? "bg-coral text-white shadow-sm"
                  : "bg-cream text-warm-gray/70 hover:bg-light-pink hover:text-coral"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div
          ref={gridRef}
          className="columns-1 md:columns-2 lg:columns-3 gap-6"
        >
          {filteredListings.map((listing, i) => (
            <div key={`${filter}-${i}`} className="demand-card-wrapper">
              <DemandCard {...listing} onClick={handleCardClick} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}