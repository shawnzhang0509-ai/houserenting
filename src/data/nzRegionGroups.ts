/**
 * 新西兰区域：两级结构（大区 → 具体城镇/分区）
 * 用于表单分步选择，避免单列表过长。
 */
export type NzRegionGroup = {
  id: string;
  label: string;
  regions: readonly string[];
};

export const NZ_REGION_GROUPS: readonly NzRegionGroup[] = [
  {
    id: "auckland",
    label: "奥克兰 Auckland",
    regions: [
      "奥克兰北岸 Auckland North Shore",
      "奥克兰中区 Auckland Central",
      "奥克兰东区 Auckland East",
      "奥克兰南区 Auckland South",
      "奥克兰西区 Auckland West",
      "奥克兰西北区 Auckland Northwest",
    ],
  },
  {
    id: "wellington",
    label: "惠灵顿 Wellington",
    regions: ["惠灵顿 Wellington"],
  },
  {
    id: "christchurch",
    label: "基督城 Christchurch",
    regions: ["基督城 Christchurch"],
  },
  {
    id: "north-island-other",
    label: "北岛其他城镇",
    regions: [
      "北地 Northland",
      "汉密尔顿 Hamilton",
      "陶朗加 Tauranga",
      "罗托鲁瓦 Rotorua",
      "陶波 Taupō",
      "吉斯本 Gisborne",
      "霍克湾 Hawke's Bay",
      "新普利茅斯 New Plymouth",
      "旺阿雷 Whangārei",
      "旺加努伊 Whanganui",
      "帕默北 Palmerston North",
    ],
  },
  {
    id: "south-island-other",
    label: "南岛其他城镇",
    regions: [
      "纳尔逊 Nelson",
      "布伦海姆 Blenheim",
      "提马鲁 Timaru",
      "皇后镇 Queenstown",
      "瓦纳卡 Wānaka",
      "达尼丁 Dunedin",
      "因弗卡吉尔 Invercargill",
    ],
  },
] as const;

export const NZ_ALL_REGIONS: readonly string[] = NZ_REGION_GROUPS.flatMap(
  (g) => [...g.regions]
);

export function getRegionsInGroup(groupId: string): string[] {
  const g = NZ_REGION_GROUPS.find((x) => x.id === groupId);
  return g ? [...g.regions] : [];
}

export function findGroupIdForRegion(region: string): string | undefined {
  const t = region.trim();
  for (const g of NZ_REGION_GROUPS) {
    if (g.regions.some((r) => r === t)) return g.id;
  }
  return undefined;
}
