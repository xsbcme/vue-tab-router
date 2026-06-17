export function stableStringify(value: unknown, seen = new WeakSet<object>()): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (seen.has(value)) return '"[Circular]"';
  seen.add(value);

  if (Array.isArray(value)) {
    const result = `[${value.map(item => stableStringify(item, seen)).join(",")}]`;
    seen.delete(value);
    return result;
  }

  const record = value as Record<string, unknown>;
  const result = `{${Object.keys(record)
    .sort()
    .map(key => `${JSON.stringify(key)}:${stableStringify(record[key], seen)}`)
    .join(",")}}`;
  seen.delete(value);
  return result;
}
