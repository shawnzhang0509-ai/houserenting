export type PostType = "rental" | "seeking";

export type DemandPostBase = {
  id: string;
  createdAt: number;
  nickname: string;
  location: string;
  wechat: string;
  description: string;
  /** 租赁房型 */
  leaseLayout: string;
  /** 租赁期限 */
  leaseTerm: string;
  /** 特殊要求（多选结果，有序） */
  specialRequirements: string[];
};

export type RentalPost = DemandPostBase & {
  type: "rental";
  weeklyRentMin: number;
  weeklyRentMax: number;
};

export type SeekingPost = DemandPostBase & {
  type: "seeking";
  budgetWeeklyMin: number;
  budgetWeeklyMax: number;
  moveInDate: string;
};

export type DemandPost = RentalPost | SeekingPost;
