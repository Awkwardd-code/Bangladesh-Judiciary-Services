export function plural(
  count: number,
  singular: string,
  pluralForm?: string,
): string {
  const formattedCount = Number(count) ?? 0;

  if (formattedCount === 1) {
    return `${formattedCount} ${singular}`;
  }

  return `${formattedCount} ${pluralForm ?? `${singular}s`}`;
}

export default plural;
