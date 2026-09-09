/**
 * Normalizes text by removing diacritics (accents), converting to lowercase,
 * and trimming whitespace.
 * e.g. "Přerov" -> "prerov", "ZŠ Rožňavská" -> "zs roznavska"
 */
export function removeDiacritics(text?: string | null): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Checks whether the searchable target (a string or an array of strings)
 * contains the query text, ignoring diacritics and case.
 * 
 * Supports multi-word queries: every typed word in the search query
 * must be matched in the combined target text.
 * 
 * Example:
 *   matchesSearch(["ZŠ Za Mlýnem", "Přerov", "Středa"], "prerov") -> true
 *   matchesSearch(["ZŠ Přerov", "Přerov"], "prerov") -> true
 */
export function matchesSearch(
  target: string | null | undefined | Array<string | null | undefined>,
  query: string | null | undefined
): boolean {
  if (!query || !query.trim()) return true;

  const normalizedQuery = removeDiacritics(query);
  if (!normalizedQuery) return true;

  const targetStr = Array.isArray(target)
    ? target.filter(Boolean).join(' ')
    : (target || '');

  const normalizedTarget = removeDiacritics(targetStr);

  // Quick check for full phrase match
  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  // Token-by-token match (all words from search query must be present in target)
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  return tokens.every(token => normalizedTarget.includes(token));
}
