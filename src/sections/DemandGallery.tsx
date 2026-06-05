import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DemandCard from "@/components/DemandCard";
import { DEMAND_POSTS_UPDATED } from "@/lib/demandEvents";
import { useAdminMode } from "@/hooks/useAdminMode";
import {
  DEMAND_STORAGE_KEY,
  loadDemandPosts,
  removeDemandPost,
} from "@/lib/demandStorage";
import { toast } from "sonner";
import {
  demandPostToGalleryListing,
  type GalleryListing,
} from "@/lib/demandToCard";

gsap.registerPlugin(ScrollTrigger);

type FilterType = "all" | "rental" | "seeking";

const SAMPLE_LISTINGS: GalleryListing[] = [
  {
    id: "sample-sophie",
    source: "sample",
    type: "rental",
    nickname: "Sophie",
    location: "奥克兰中区 Auckland Central",
    description: "两居室主卧，近大学，阳光充足，家具齐全。",
    price: "NZD $300–350",
    leaseLayout: "合租·单卧室",
    leaseTerm: "长租（4周以上）",
    color: "coral",
  },
  {
    id: "sample-lily",
    source: "sample",
    type: "seeking",
    nickname: "Lily",
    location: "奥克兰中区 Auckland Central",
    description: "上班族，求安静合租，希望近公交。",
    budget: "NZD $250–400/周",
    leaseLayouts: ["合租·单卧室"],
    leaseTerm: "长租（4周以上）",
    moveInDate: "8月入住",
    color: "purple",
  },
  {
    id: "sample-mia",
    source: "sample",
    type: "rental",
    nickname: "Mia",
    location: "基督城 Christchurch",
    description: "次卧招租，新装修，包基本水电。",
    price: "NZD $200–250",
    leaseLayout: "合租·单卧室",
    leaseTerm: "长租（4周以上）",
    color: "blue",
  },
  {
    id: "sample-zoe",
    source: "sample",
    type: "seeking",
    nickname: "Zoe",
    location: "惠灵顿 Wellington",
    description: "学生，预算有限，可合租。",
    budget: "NZD $200–300/周",
    leaseLayouts: ["独立单间/开间"],
    leaseTerm: "长租（4周以上）",
    moveInDate: "随时",
    color: "pink",
  },
  {
    id: "sample-emma",
    source: "sample",
    type: "rental",
    nickname: "Emma",
    location: "皇后镇 Queenstown",
    description: "季租主卧，山景，适合短期过渡。",
    price: "NZD $450–500",
    leaseLayout: "合租·单卧室",
    leaseTerm: "短租（4周以下）",
    color: "purple",
  },
  {
    id: "sample-chloe",
    source: "sample",
    type: "seeking",
    nickname: "Chloe",
    location: "陶朗加 Tauranga",
    description: "带娃家庭，希望两居或主卧套间。",
    budget: "NZD $350–450/周",
    leaseLayouts: ["整租·两居室", "整租·三居室及以上"],
    leaseTerm: "长租（4周以上）",
    moveInDate: "9月",
    color: "coral",
  },
];

function readUserListings(): GalleryListing[] {
  return loadDemandPosts()
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((post, i) => demandPostToGalleryListing(post, i));
}

export default function DemandGallery() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [userListings, setUserListings] = useState<GalleryListing[]>([]);
  const { adminMode, disableAdmin } = useAdminMode();

  const refreshListings = useCallback(() => {
    setUserListings(readUserListings());
  }, []);

  useEffect(() => {
    refreshListings();

    const onStorage = (e: StorageEvent) => {
      if (e.key === DEMAND_STORAGE_KEY || e.key === null) refreshListings();
    };

    window.addEventListener(DEMAND_POSTS_UPDATED, refreshListings);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(DEMAND_POSTS_UPDATED, refreshListings);
      window.removeEventListener("storage", onStorage);
    };
  }, [refreshListings]);

  const allListings = [...userListings, ...SAMPLE_LISTINGS];

  const filteredListings =
    filter === "all"
      ? allListings
      : allListings.filter((l) => l.type === filter);

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

  const handleDeleteListing = (listing: GalleryListing) => {
    if (listing.source !== "user") return;
    const ok = window.confirm(
      `确定删除「${listing.nickname}」这条发布？\n（仅删除本浏览器里的记录）`
    );
    if (!ok) return;
    if (removeDemandPost(listing.id)) {
      toast.success("已删除");
    } else {
      toast.error("删除失败");
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
        <div className="text-center mb-8">
          <h2 className="font-serif-display text-[36px] text-warm-gray mb-3">
            姐妹们的信息
          </h2>
          <p className="text-base text-warm-gray/60 max-w-lg mx-auto">
            {userListings.length > 0
              ? "你刚发布的内容会出现在最上方（仅保存在本浏览器）。下方为示例信息。"
              : "有人有房要出租，有人在找房子住 —— 发布后会显示在本页面最上方"}
          </p>
        </div>

        {adminMode ? (
          <div className="mb-6 mx-auto max-w-lg flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 rounded-xl border border-coral/25 bg-coral/8 px-4 py-3 text-sm text-warm-gray">
            <span>管理员模式：可删除带「我发布的」的本机记录</span>
            <button
              type="button"
              onClick={disableAdmin}
              className="shrink-0 rounded-full border border-warm-gray/25 px-3 py-1 text-xs hover:bg-white"
            >
              退出
            </button>
          </div>
        ) : null}

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

        <div
          ref={gridRef}
          className="columns-1 md:columns-2 lg:columns-3 gap-6"
        >
          {filteredListings.map((listing) => (
            <div key={listing.id} className="demand-card-wrapper">
              <DemandCard
                type={listing.type}
                nickname={listing.nickname}
                location={listing.location}
                description={listing.description}
                price={listing.price}
                budget={listing.budget}
                moveInDate={listing.moveInDate}
                leaseLayout={listing.leaseLayout}
                leaseLayouts={listing.leaseLayouts}
                leaseTerm={listing.leaseTerm}
                photos={listing.photos}
                color={listing.color}
                badge={listing.source === "user" ? "我发布的" : undefined}
                showDelete={adminMode && listing.source === "user"}
                onDelete={() => handleDeleteListing(listing)}
                onClick={handleCardClick}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
