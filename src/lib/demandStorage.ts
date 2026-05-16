import type { DemandPost } from "@/types/demand";

const STORAGE_KEY = "jiejie-demand-posts-nz-v1";

function safeParse(raw: string | null): DemandPost[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(isDemandPost);
  } catch {
    return [];
  }
}

function isDemandPost(v: unknown): v is DemandPost {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (o.type !== "rental" && o.type !== "seeking") return false;
  if (typeof o.id !== "string" || typeof o.nickname !== "string") return false;
  if (typeof o.location !== "string" || typeof o.wechat !== "string") return false;
  if (typeof o.description !== "string") return false;
  if (typeof o.createdAt !== "number") return false;
  if (o.type === "rental") {
    return (
      typeof o.weeklyRentMin === "number" &&
      typeof o.weeklyRentMax === "number" &&
      typeof o.roomType === "string"
    );
  }
  return (
    typeof o.budgetWeeklyMin === "number" &&
    typeof o.budgetWeeklyMax === "number" &&
    typeof o.moveInDate === "string"
  );
}

export function loadDemandPosts(): DemandPost[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveDemandPosts(posts: DemandPost[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function appendDemandPost(post: DemandPost): DemandPost[] {
  const prev = loadDemandPosts();
  const next = [...prev, post];
  saveDemandPosts(next);
  return next;
}
