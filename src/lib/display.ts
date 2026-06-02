const DISPLAY_KEYS = ['name', 'label', 'title', 'code', 'id'] as const;

type DisplayRecord = Partial<Record<(typeof DISPLAY_KEYS)[number], unknown>>;

const isSafePrimitive = (value: unknown): value is string | number | boolean => {
  return ['string', 'number', 'boolean'].includes(typeof value);
};

const isNonEmptyPrimitive = (value: unknown): value is string | number | boolean => {
  return isSafePrimitive(value) && String(value).trim().length > 0;
};

export function displayText(value: unknown, fallback = '—'): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value.trim().length > 0 ? value : fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return fallback;
  if (typeof value === 'object') {
    const record = value as DisplayRecord;
    for (const key of DISPLAY_KEYS) {
      const candidate = record[key];
      if (isNonEmptyPrimitive(candidate)) return String(candidate);
    }
  }
  return fallback;
}
