export type PostType = "rental" | "seeking";

export type DemandPostBase = {
  id: string;
  createdAt: number;
  nickname: string;
  location: string;
  wechat: string;
  description: string;
  /** 租赁期限 */
  leaseTerm: string;
  /** 特殊要求（多选结果，有序） */
  specialRequirements: string[];
};

/** 出租：单一租赁房型 */
export type RentalPost = DemandPostBase & {
  type: "rental";
  leaseLayout: string;
  weeklyRentMin: number;
  weeklyRentMax: number;
  /** 可选房源照片（JPEG data URL，仅存本机） */
  photos?: string[];
};

/** 求租：可接受多种租赁房型 */
export type SeekingPost = DemandPostBase & {
  type: "seeking";
  leaseLayouts: string[];
  budgetWeeklyMin: number;
  budgetWeeklyMax: number;
  moveInDate: string;
};

export type DemandPost = RentalPost | SeekingPost;
