import type { DemandPost } from "@/types/demand";
import {
  LEASE_LAYOUT_OPTIONS,
  SPECIAL_REQUIREMENT_OPTIONS,
} from "@/data/leaseFields";
import { notifyDemandPostsUpdated } from "@/lib/demandEvents";

export const DEMAND_STORAGE_KEY = "jiejie-demand-posts-nz-v3";

const STORAGE_KEY = DEMAND_STORAGE_KEY;

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

function isSpecialRequirementsList(v: unknown): v is string[] {
  if (!Array.isArray(v)) return false;
  const allowed = new Set<string>([...SPECIAL_REQUIREMENT_OPTIONS]);
  return v.every((x) => typeof x === "string" && allowed.has(x));
}

const layoutAllowed = new Set<string>([...LEASE_LAYOUT_OPTIONS]);

function isLeaseLayoutsList(v: unknown): v is string[] {
  if (!Array.isArray(v)) return false;
  if (v.length === 0) return false;
  return v.every((x) => typeof x === "string" && layoutAllowed.has(x));
}

function isDemandPost(v: unknown): v is DemandPost {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (o.type !== "rental" && o.type !== "seeking") return false;
  if (typeof o.id !== "string" || typeof o.nickname !== "string") return false;
  if (typeof o.location !== "string" || typeof o.wechat !== "string") return false;
  if (typeof o.description !== "string") return false;
  if (typeof o.createdAt !== "number") return false;
  if (typeof o.leaseTerm !== "string") return false;
  if (!isSpecialRequirementsList(o.specialRequirements)) return false;
  if (o.type === "rental") {
    return (
      typeof o.leaseLayout === "string" &&
      layoutAllowed.has(o.leaseLayout) &&
      typeof o.weeklyRentMin === "number" &&
      typeof o.weeklyRentMax === "number"
    );
  }
  return (
    isLeaseLayoutsList(o.leaseLayouts) &&
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
  notifyDemandPostsUpdated();
  return next;
}
