export function searchMenu<T extends { name: string }>(items: readonly T[], query: string): T[] {
  const normalized = query.trim().toLowerCase();
  return normalized ? items.filter(item => item.name.toLowerCase().includes(normalized)) : [];
}
