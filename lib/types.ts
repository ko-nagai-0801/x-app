/* lib/types.ts */
export function tagsToArray(csv: string): string[] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function arrayToTags(tags: string[]): string {
  return tags
    .map((s) => s.trim())
    .filter(Boolean)
    .join(",");
}
