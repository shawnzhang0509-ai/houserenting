import { Home, MapPin, User, BedDouble } from "lucide-react";

interface DemandCardProps {
  type: "rental" | "seeking";
  nickname: string;
  location: string;
  description: string;
  price?: string;
  budget?: string;
  moveInDate?: string;
  leaseLayout?: string;
  /** 求租：可展示多种可接受房型 */
  leaseLayouts?: string[];
  leaseTerm?: string;
  badge?: string;
  color: string;
  onClick?: () => void;
}

const colorMap: Record<string, { bg: string; text: string }> = {
  coral: { bg: "bg-coral", text: "text-white" },
  purple: { bg: "bg-soft-purple", text: "text-white" },
  pink: { bg: "bg-light-pink", text: "text-coral" },
  blue: { bg: "bg-light-blue", text: "text-white" },
};

const tagColorMap: Record<string, { bg: string; text: string }> = {
  coral: { bg: "bg-light-pink", text: "text-coral" },
  purple: { bg: "bg-[#F0E8FF]", text: "text-soft-purple" },
  pink: { bg: "bg-light-pink", text: "text-coral" },
  blue: { bg: "bg-[#E8F0FF]", text: "text-[#5B9BD5]" },
};

export default function DemandCard({
  type,
  nickname,
  location,
  description,
  price,
  budget,
  moveInDate,
  leaseLayout,
  leaseLayouts,
  leaseTerm,
  badge,
  color,
  onClick,
}: DemandCardProps) {
  const c = colorMap[color] || colorMap.coral;
  const tc = tagColorMap[color] || tagColorMap.coral;
  const isRental = type === "rental";
  const layoutTags =
    leaseLayouts && leaseLayouts.length > 0
      ? leaseLayouts
      : leaseLayout
        ? [leaseLayout]
        : [];

  return (
    <div
      className="break-inside-avoid mb-6 rounded-2xl bg-cream overflow-hidden cursor-pointer group transition-transform duration-300"
      style={{ transitionTimingFunction: "cubic-bezier(0.215, 0.61, 0.355, 1)" }}
      onClick={onClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      <div
        className={`h-[120px] ${c.bg} flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]`}
      >
        {isRental ? (
          <Home className={`w-8 h-8 ${c.text}`} strokeWidth={1.5} />
        ) : (
          <User className={`w-8 h-8 ${c.text}`} strokeWidth={1.5} />
        )}
        <span className={`text-xs font-medium mt-2 ${c.text} opacity-90`}>
          {isRental ? "有房出租" : "求租房源"}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-base font-medium text-warm-gray truncate">
            {nickname}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            {badge ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-coral text-white">
                {badge}
              </span>
            ) : null}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isRental
                  ? "bg-coral/10 text-coral"
                  : "bg-soft-purple/15 text-soft-purple"
              }`}
            >
              {isRental ? "招租" : "找租"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <MapPin className="w-3.5 h-3.5 text-coral" strokeWidth={1.5} />
          <span className="text-sm text-coral">{location}</span>
        </div>

        <p className="text-sm text-warm-gray/70 leading-relaxed line-clamp-3 mb-4">
          {description}
        </p>

        <div className="flex flex-wrap gap-2">
          {layoutTags.map((tag) => (
            <span
              key={tag}
              className={`inline-block max-w-full truncate px-3 py-1 rounded-full text-xs font-medium ${tc.bg} ${tc.text}`}
            >
              {tag}
            </span>
          ))}
          {leaseTerm && (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${tc.bg} ${tc.text}`}>
              {leaseTerm}
            </span>
          )}
          {isRental && price && (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${tc.bg} ${tc.text}`}>
              <BedDouble className="w-3 h-3" />
              {price}/周
            </span>
          )}
          {!isRental && budget && (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${tc.bg} ${tc.text}`}>
              预算 {budget}
            </span>
          )}
          {!isRental && moveInDate && (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${tc.bg} ${tc.text}`}>
              {moveInDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
