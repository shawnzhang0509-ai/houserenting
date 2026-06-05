import { notifyDemandPostsUpdated } from "@/lib/demandEvents";

export const HIDDEN_SAMPLES_KEY = "jiejie-hidden-samples-v1";

function loadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HIDDEN_SAMPLES_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

export function getHiddenSampleIds(): Set<string> {
  return new Set(loadIds());
}

export function isSampleHidden(id: string): boolean {
  return getHiddenSampleIds().has(id);
}

/** 管理员隐藏示例卡片（仅存本浏览器，刷新后仍隐藏） */
export function hideSampleListing(id: string): void {
  if (typeof window === "undefined") return;
  const set = getHiddenSampleIds();
  if (set.has(id)) return;
  set.add(id);
  window.localStorage.setItem(HIDDEN_SAMPLES_KEY, JSON.stringify([...set]));
  notifyDemandPostsUpdated();
}
