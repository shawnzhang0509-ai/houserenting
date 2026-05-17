/** 兼容：全部区域一维列表（与分组内文案一致） */
import {
  NZ_ALL_REGIONS,
  NZ_REGION_GROUPS,
  findGroupIdForRegion,
  getRegionsInGroup,
} from "@/data/nzRegionGroups";

export const NZ_REGION_OPTIONS = NZ_ALL_REGIONS;

export type NzRegion = (typeof NZ_REGION_OPTIONS)[number];

export {
  NZ_REGION_GROUPS,
  NZ_ALL_REGIONS,
  getRegionsInGroup,
  findGroupIdForRegion,
};
