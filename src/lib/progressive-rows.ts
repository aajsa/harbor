export function upsertOrdered<T extends { key: string }>(
  rows: T[],
  row: T,
  order: readonly string[],
): T[] {
  const next = rows.filter((item) => item.key !== row.key);
  next.push(row);
  next.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  return next;
}
