/** 纽币周租金区间，$50 一档，自 $200 起至 $750 */
export type WeeklyRentBracket = {
  id: string;
  min: number;
  max: number;
};

const brackets: WeeklyRentBracket[] = [];
for (let min = 200; min < 750; min += 50) {
  const max = min + 50;
  brackets.push({ id: `${min}-${max}`, min, max });
}

export const NZ_WEEKLY_RENT_BRACKETS: readonly WeeklyRentBracket[] = brackets;

export function getWeeklyRentBracketById(
  id: string
): WeeklyRentBracket | undefined {
  return NZ_WEEKLY_RENT_BRACKETS.find((b) => b.id === id);
}

export function formatWeeklyRentBracketLabel(b: WeeklyRentBracket): string {
  return `NZD $${b.min} – $${b.max} / 周`;
}
