import type { DemandPost, RentalPost, SeekingPost } from "@/types/demand";

function normalizeToken(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[省市自治区]/g, "");
}

function locationTokens(s: string): string[] {
  return s
    .split(/[·/,，\s]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .map(normalizeToken);
}

/** 区域是否可能一致（关键词包含或重叠） */
export function locationsLikelyMatch(a: string, b: string): boolean {
  const na = normalizeToken(a);
  const nb = normalizeToken(b);
  if (na.length >= 2 && nb.length >= 2) {
    if (na === nb) return true;
    if (na.includes(nb) || nb.includes(na)) return true;
  }
  const ta = locationTokens(a);
  const tb = locationTokens(b);
  for (const pa of ta) {
    for (const pb of tb) {
      if (pa.length < 2 || pb.length < 2) continue;
      if (pa === pb) return true;
      if (pa.includes(pb) || pb.includes(pa)) return true;
    }
  }
  return false;
}

export function budgetContainsRent(
  seeking: SeekingPost,
  monthlyRent: number
): boolean {
  const lo = Math.min(seeking.budgetMin, seeking.budgetMax);
  const hi = Math.max(seeking.budgetMin, seeking.budgetMax);
  return monthlyRent >= lo && monthlyRent <= hi;
}

/** 一条出租与一条求租是否互相满足当前规则（区域 + 租金落在预算内） */
export function rentalAndSeekingMatch(
  rental: RentalPost,
  seeking: SeekingPost
): boolean {
  if (!locationsLikelyMatch(rental.location, seeking.location)) return false;
  if (!budgetContainsRent(seeking, rental.monthlyRent)) return false;
  return true;
}

/** 给定刚发布的一条，在其余帖子中找相反类型的匹配 */
export function findMatchesForPost(
  post: DemandPost,
  allOthers: DemandPost[]
): DemandPost[] {
  const opposite: DemandPost["type"] =
    post.type === "rental" ? "seeking" : "rental";
  const pool = allOthers.filter((p) => p.type === opposite);

  if (post.type === "rental") {
    return pool.filter(
      (p) => p.type === "seeking" && rentalAndSeekingMatch(post, p)
    );
  }
  return pool.filter(
    (p) => p.type === "rental" && rentalAndSeekingMatch(p, post)
  );
}

/** 纯前端匹配结果，便于弹窗展示或复制（数据仅存本机浏览器）。 */
export function formatMatchSummary(
  newPost: DemandPost,
  matches: DemandPost[]
): string {
  const lines: string[] = [];
  lines.push("姐妹找房 · 本机匹配结果（区域 + 预算）");
  lines.push("");
  lines.push("【刚发布】");
  lines.push(formatOnePost(newPost));
  lines.push("");
  lines.push(`【匹配到 ${matches.length} 条】`);
  for (const m of matches) {
    lines.push("---");
    lines.push(formatOnePost(m));
  }
  lines.push("");
  lines.push("请分别加微信并拉群。");
  return lines.join("\n");
}

function formatOnePost(p: DemandPost): string {
  const base = `类型：${p.type === "rental" ? "有房出租" : "正在找房"}
称呼：${p.nickname}
微信：${p.wechat}
区域：${p.location}
补充：${p.description || "（无）"}`;
  if (p.type === "rental") {
    return `${base}
月租：${p.monthlyRent}
房型：${p.roomType}`;
  }
  const lo = Math.min(p.budgetMin, p.budgetMax);
  const hi = Math.max(p.budgetMin, p.budgetMax);
  return `${base}
预算：${lo}–${hi} 元/月
希望入住：${p.moveInDate}`;
}
