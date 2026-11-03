import { RANK_COLORS } from "../data/constants";

// Возвращает объект { regionId: color }
export function getRegionColors(scenarioData) {
  const entries = Object.entries(scenarioData || {});
  // Сортируем по убыванию (1 место = самое большое значение)
  entries.sort((a, b) => b[1] - a[1]);

  const colorMap = {};
  entries.forEach(([id], index) => {
    colorMap[id] = RANK_COLORS[index] || RANK_COLORS[RANK_COLORS.length - 1];
  });
  return colorMap;
}

// Возвращает массив отсортированных регионов для таблицы
export function getSortedRegions(scenarioData) {
  return Object.entries(scenarioData || {})
    .sort((a, b) => b[1] - a[1])
    .map(([id, value], index) => ({ id, value, rank: index + 1 }));
}
