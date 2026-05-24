export function slugify(value) {
  const slug = value
    .toString()
    .normalize('NFKD')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `writing-${Date.now().toString(36)}`;
}
