/**
 * 匹配成功后通知站长（你）去手动加微信拉群。
 *
 * 推荐配置 VITE_NTFY_URL（完整地址，如 https://ntfy.sh/你的私密主题），
 * 手机安装 ntfy App 或浏览器订阅同一主题即可收到推送。
 *
 * 也可配置 VITE_ADMIN_EMAIL：会尝试打开本地邮件客户端（mailto），
 * 部分环境可能拦截弹窗。
 */

export type NotifyResult =
  | { ok: true; channel: "ntfy" }
  | { ok: true; channel: "mailto" }
  | { ok: false; channel: "none" | "ntfy"; error?: string };

export async function notifyAdminMatch(body: string): Promise<NotifyResult> {
  const ntfyUrl = import.meta.env.VITE_NTFY_URL?.trim();
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim();

  if (ntfyUrl) {
    try {
      const res = await fetch(ntfyUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          Title: "姐妹找房 · 新匹配",
        },
        body,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        return {
          ok: false,
          channel: "ntfy",
          error: errText || `HTTP ${res.status}`,
        };
      }
      return { ok: true, channel: "ntfy" };
    } catch (e) {
      return {
        ok: false,
        channel: "ntfy",
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  if (adminEmail) {
    const subject = encodeURIComponent("姐妹找房 · 新匹配待拉群");
    const mailBody = encodeURIComponent(body);
    window.location.assign(
      `mailto:${encodeURIComponent(adminEmail)}?subject=${subject}&body=${mailBody}`
    );
    return { ok: true, channel: "mailto" };
  }

  console.info("[姐妹找房] 匹配提醒（未配置 VITE_NTFY_URL / VITE_ADMIN_EMAIL）\n", body);
  return { ok: false, channel: "none" };
}
