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

/** 区域一致：下拉相同值优先；兼容旧数据仍做轻量关键词匹配 */
export function locationsLikelyMatch(a: string, b: string): boolean {
  const ta = a.trim();
  const tb = b.trim();
  if (ta === tb) return true;
  const na = normalizeToken(a);
  const nb = normalizeToken(b);
  if (na.length >= 2 && nb.length >= 2) {
    if (na === nb) return true;
    if (na.includes(nb) || nb.includes(na)) return true;
  }
  const toksA = locationTokens(a);
  const toksB = locationTokens(b);
  for (const pa of toksA) {
    for (const pb of toksB) {
      if (pa.length < 2 || pb.length < 2) continue;
      if (pa === pb) return true;
      if (pa.includes(pb) || pb.includes(pa)) return true;
    }
  }
  return false;
}

/** 闭区间 [a,b] 与 [c,d] 是否有交集 */
function closedIntervalsOverlap(
  a1: number,
  a2: number,
  b1: number,
  b2: number
): boolean {
  const loA = Math.min(a1, a2);
  const hiA = Math.max(a1, a2);
  const loB = Math.min(b1, b2);
  const hiB = Math.max(b1, b2);
  return loA <= hiB && loB <= hiA;
}

/** 求租方勾选的特殊要求须全部由出租方勾选（求租无勾选则不限制） */
function specialRequirementsCompatible(
  rental: string[],
  seeking: string[]
): boolean {
  if (seeking.length === 0) return true;
  const setR = new Set(rental);
  return seeking.every((s) => setR.has(s));
}

/** 出租单一房型须落在求租方可接受的房型列表中 */
function leaseLayoutCompatible(rentalLayout: string, seekingLayouts: string[]) {
  return seekingLayouts.includes(rentalLayout);
}

/** 一条出租与一条求租：区域 + 房型 + 期限 + 特殊要求 + 周租金 */
export function rentalAndSeekingMatch(
  rental: RentalPost,
  seeking: SeekingPost
): boolean {
  if (!locationsLikelyMatch(rental.location, seeking.location)) return false;
  if (!leaseLayoutCompatible(rental.leaseLayout, seeking.leaseLayouts)) {
    return false;
  }
  if (rental.leaseTerm !== seeking.leaseTerm) return false;
  if (
    !specialRequirementsCompatible(
      rental.specialRequirements,
      seeking.specialRequirements
    )
  ) {
    return false;
  }
  if (
    !closedIntervalsOverlap(
      rental.weeklyRentMin,
      rental.weeklyRentMax,
      seeking.budgetWeeklyMin,
      seeking.budgetWeeklyMax
    )
  ) {
    return false;
  }
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
  lines.push(
    "姐妹找房 · 本机匹配结果（区域 + 出租房型∈求租选项 + 期限 + 特殊要求 + 周租金）"
  );
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

function formatSpecialList(list: string[]): string {
  if (!list.length) return "（无）";
  return list.join("、");
}

function formatLeaseLine(p: DemandPost): string {
  if (p.type === "rental") return `租赁房型：${p.leaseLayout}`;
  return `租赁房型（求租可多选）：${formatSpecialList(p.leaseLayouts)}`;
}

function formatOnePost(p: DemandPost): string {
  const base = `类型：${p.type === "rental" ? "有房出租" : "正在找房"}
称呼：${p.nickname}
微信：${p.wechat}
区域：${p.location}
${formatLeaseLine(p)}
租赁期限：${p.leaseTerm}
特殊要求：${formatSpecialList(p.specialRequirements)}
补充：${p.description || "（无）"}`;
  if (p.type === "rental") {
    return `${base}
周租（纽币）：$${p.weeklyRentMin} – $${p.weeklyRentMax} / 周`;
  }
  const lo = Math.min(p.budgetWeeklyMin, p.budgetWeeklyMax);
  const hi = Math.max(p.budgetWeeklyMin, p.budgetWeeklyMax);
  return `${base}
周预算（纽币）：$${lo} – $${hi} / 周
希望入住：${p.moveInDate}`;
}
