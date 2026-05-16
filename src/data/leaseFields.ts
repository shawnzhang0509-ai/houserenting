/** 租赁房型（整租/合租等） */
export const LEASE_LAYOUT_OPTIONS = [
  "整租·一居室",
  "整租·两居室",
  "整租·三居室及以上",
  "合租·单卧室",
  "独立单间/开间",
] as const;

export type LeaseLayout = (typeof LEASE_LAYOUT_OPTIONS)[number];

/** 租赁期限 */
export const LEASE_TERM_OPTIONS = [
  "长租（4周以上）",
  "短租（4周以下）",
] as const;

export type LeaseTerm = (typeof LEASE_TERM_OPTIONS)[number];

/** 特殊要求（多选） */
export const SPECIAL_REQUIREMENT_OPTIONS = [
  "独立出入",
  "独立车位",
  "无需接客人",
] as const;

export type SpecialRequirement = (typeof SPECIAL_REQUIREMENT_OPTIONS)[number];
