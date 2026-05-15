import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DemandCard from "@/components/DemandCard";

gsap.registerPlugin(ScrollTrigger);

type FilterType = "all" | "rental" | "seeking";

const mockListings = [
  // 招租 (rental) - 有房要出租
  {
    type: "rental" as const,
    nickname: "小雅",
    location: "朝阳区 · 三里屯",
    description: "两居室主卧出租，南向带阳台，采光好。家具家电齐全，拎包入住。楼下就是地铁站，交通方便。",
    price: "2,800",
    roomType: "主卧",
    color: "coral",
  },
  {
    type: "seeking" as const,
    nickname: "小雨",
    location: "海淀区 · 中关村",
    description: "求租一居室或主卧，预算3000以内。安静爱干净，朝九晚六上班族，希望离地铁站近。",
    budget: "\u00a53,000以内",
    moveInDate: "7月入住",
    color: "purple",
  },
  {
    type: "rental" as const,
    nickname: "思琪",
    location: "徐汇区 · 衡山路",
    description: "三居室次卧招租，老洋房风格装修，共用厨房和客厅。室友都是女生，氛围很好。",
    price: "2,200",
    roomType: "次卧",
    color: "blue",
  },
  {
    type: "seeking" as const,
    nickname: "晓雯",
    location: "南山区 · 科技园",
    description: "求租科技园附近单间，预算3500左右。不养宠物不抽烟，性格随和，希望室友也是女生。",
    budget: "\u00a53,500以内",
    moveInDate: "随时入住",
    color: "pink",
  },
  {
    type: "rental" as const,
    nickname: "琳琳",
    location: "朝阳区 · 望京",
    description: "整租三居室找室友分摊，大客厅带落地窗。已住两人，再找一位女生。厨房用品齐全。",
    price: "2,500",
    roomType: "次卧",
    color: "purple",
  },
  {
    type: "seeking" as const,
    nickname: "梦洁",
    location: "西湖区 · 文三路",
    description: "应届毕业生求租房源，预算2000以内。希望靠近地铁站，可以合租。安静好相处。",
    budget: "\u00a52,000以内",
    moveInDate: "6月入住",
    color: "coral",
  },
  {
    type: "rental" as const,
    nickname: "静静",
    location: "浦东 · 陆家嘴",
    description: "高层公寓主卧出租，江景房，独立卫生间。小区有健身房和游泳池。限女生。",
    price: "4,200",
    roomType: "主卧独卫",
    color: "blue",
  },
  {
    type: "seeking" as const,
    nickname: "佳佳",
    location: "天河区 · 珠江新城",
    description: "求租珠江新城附近房源，预算2600。设计师一枚，作息正常，希望找爱干净的室友。",
    budget: "\u00a52,600以内",
    moveInDate: "7月入住",
    color: "pink",
  },
  {
    type: "rental" as const,
    nickname: "可可",
    location: "武侯区 · 桐梓林",
    description: "两居室次卧出租，精装修，品牌家电。近地铁3号线，楼下有超市和咖啡店。",
    price: "1,800",
    roomType: "次卧",
    color: "coral",
  },
  {
    type: "seeking" as const,
    nickname: "安娜",
    location: "朝阳区 · 国贸",
    description: "求租国贸附近主卧，预算4000以内。外企工作，经常出差，在家时间不多。",
    budget: "\u00a54,000以内",
    moveInDate: "6月下旬",
    color: "purple",
  },
  {
    type: "rental" as const,
    nickname: "七七",
    location: "海淀区 · 五道口",
    description: "四居室小次卧出租，适合学生党。近清华北大，学习氛围好。水电网平摊。",
    price: "1,500",
    roomType: "小次卧",
    color: "blue",
  },
  {
    type: "seeking" as const,
    nickname: "朵朵",
    location: "南山区 · 海岸城",
    description: "求租海岸城附近一居室或合租主卧，预算3000。喜欢做饭，可以一起分享美食。",
    budget: "\u00a53,000以内",
    moveInDate: "7月初",
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