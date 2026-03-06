export function getConfiguredStoreValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue || /^todo:/i.test(normalizedValue)) {
    return null;
  }

  return normalizedValue;
}
