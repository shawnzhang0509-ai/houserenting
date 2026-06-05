import type { DemandPost } from "@/types/demand";

const CARD_COLORS = ["coral", "purple", "blue", "pink"] as const;

export type GalleryListing = {
  id: string;
  source: "user" | "sample";
  type: "rental" | "seeking";
  nickname: string;
  location: string;
  description: string;
  price?: string;
  budget?: string;
  moveInDate?: string;
  leaseLayout?: string;
  leaseLayouts?: string[];
  leaseTerm?: string;
  photos?: string[];
  color: string;
};

function formatMoveInDate(raw: string): string {
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-");
    return `${y}年${Number(m)}月${Number(d)}日入住`;
  }
  return raw;
}

export function demandPostToGalleryListing(
  post: DemandPost,
  index: number
): GalleryListing {
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const description = post.description.trim() || "（暂无补充说明）";

  if (post.type === "rental") {
    return {
      id: post.id,
      source: "user",
      type: "rental",
      nickname: post.nickname,
      location: post.location,
      description,
      price: `NZD $${post.weeklyRentMin}–${post.weeklyRentMax}`,
      leaseLayout: post.leaseLayout,
      leaseTerm: post.leaseTerm,
      photos: post.photos?.length ? post.photos : undefined,
      color,
    };
  }

  const lo = Math.min(post.budgetWeeklyMin, post.budgetWeeklyMax);
  const hi = Math.max(post.budgetWeeklyMin, post.budgetWeeklyMax);

  return {
    id: post.id,
    source: "user",
    type: "seeking",
    nickname: post.nickname,
    location: post.location,
    description,
    budget: `NZD $${lo}–${hi}/周`,
    leaseLayouts: post.leaseLayouts,
    leaseTerm: post.leaseTerm,
    moveInDate: formatMoveInDate(post.moveInDate),
    color,
  };
}
