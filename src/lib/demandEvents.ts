/** 本机发布记录写入后触发，供需求广场等组件刷新 */
export const DEMAND_POSTS_UPDATED = "jiejie-demand-posts-updated";

export function notifyDemandPostsUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DEMAND_POSTS_UPDATED));
}
