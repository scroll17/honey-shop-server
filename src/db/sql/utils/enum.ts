export function createEnum<T extends Record<string, unknown>>(obj: T, omitKeys?: Array<keyof T>): string {
  return Object.keys(obj)
    .filter((key) => !(omitKeys ?? []).includes(key))
    .map((name) => `'${name}'`)
    .join(',');
}
