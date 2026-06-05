/** 轻量「管理员模式」：无账号体系，?admin=口令 后可删广场全部卡片 */

export const ADMIN_SESSION_KEY = "jiejie-admin-session";
export const ADMIN_MODE_CHANGED = "jiejie-admin-changed";

/** URL 参数 ?admin=口令 ；默认口令 jiejie，可用 VITE_ADMIN_KEY 覆盖 */
export function getAdminPassphrase(): string {
  return import.meta.env.VITE_ADMIN_KEY?.trim() || "jiejie";
}

export function isAdminModeActive(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

export function setAdminModeActive(active: boolean): void {
  if (typeof window === "undefined") return;
  if (active) sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
  else sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.dispatchEvent(new CustomEvent(ADMIN_MODE_CHANGED));
}

/** 地址栏带 ?admin=口令 时自动开启（并去掉参数，避免分享链接泄露） */
export function tryEnableAdminFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const token = params.get("admin");
  if (!token || token !== getAdminPassphrase()) return false;
  setAdminModeActive(true);
  params.delete("admin");
  const qs = params.toString();
  const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", next);
  return true;
}
