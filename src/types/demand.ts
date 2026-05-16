export type PostType = "rental" | "seeking";

export type DemandPostBase = {
  id: string;
  createdAt: number;
  nickname: string;
  location: string;
  wechat: string;
  description: string;
};

export type RentalPost = DemandPostBase & {
  type: "rental";
  weeklyRentMin: number;
  weeklyRentMax: number;
  roomType: string;
};

export type SeekingPost = DemandPostBase & {
  type: "seeking";
  budgetWeeklyMin: number;
  budgetWeeklyMax: number;
  moveInDate: string;
};

export type DemandPost = RentalPost | SeekingPost;
