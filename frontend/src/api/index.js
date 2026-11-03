// Так как Nginx проксирует /api на бэкенд, мы просто пишем /api
export const fetchRegions = async () => {
  const res = await fetch("/api/regions");
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

export const fetchScenario = async (group, scenario) => {
  const res = await fetch(`/api/scenarios/${group}/${scenario}`);
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};
