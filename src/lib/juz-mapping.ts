// Mushaf Madinah Juz-Page mapping
export const JUZ_PAGE_MAP: Record<number, { start: number; end: number; pages: number }> = {
  1: { start: 1, end: 21, pages: 21 },
  2: { start: 22, end: 41, pages: 20 },
  3: { start: 42, end: 61, pages: 20 },
  4: { start: 62, end: 81, pages: 20 },
  5: { start: 82, end: 101, pages: 20 },
  6: { start: 102, end: 121, pages: 20 },
  7: { start: 122, end: 141, pages: 20 },
  8: { start: 142, end: 161, pages: 20 },
  9: { start: 162, end: 181, pages: 20 },
  10: { start: 182, end: 201, pages: 20 },
  11: { start: 202, end: 221, pages: 20 },
  12: { start: 222, end: 241, pages: 20 },
  13: { start: 242, end: 261, pages: 20 },
  14: { start: 262, end: 281, pages: 20 },
  15: { start: 282, end: 301, pages: 20 },
  16: { start: 302, end: 321, pages: 20 },
  17: { start: 322, end: 341, pages: 20 },
  18: { start: 342, end: 361, pages: 20 },
  19: { start: 362, end: 381, pages: 20 },
  20: { start: 382, end: 401, pages: 20 },
  21: { start: 402, end: 421, pages: 20 },
  22: { start: 422, end: 441, pages: 20 },
  23: { start: 442, end: 461, pages: 20 },
  24: { start: 462, end: 481, pages: 20 },
  25: { start: 482, end: 501, pages: 20 },
  26: { start: 502, end: 521, pages: 20 },
  27: { start: 522, end: 541, pages: 20 },
  28: { start: 542, end: 561, pages: 20 },
  29: { start: 562, end: 581, pages: 20 },
  30: { start: 582, end: 604, pages: 23 },
};

export const LINES_PER_PAGE = 15;

/** Calculate total lines from page/line range */
export function calculateTotalLines(fromPage: number, fromLine: number, toPage: number, toLine: number): number {
  return (toLine - fromLine + 1) + ((toPage - fromPage) * LINES_PER_PAGE);
}

/** Validate page is within juz range */
export function isPageInJuz(page: number, juzId: number): boolean {
  const juz = JUZ_PAGE_MAP[juzId];
  if (!juz) return false;
  return page >= juz.start && page <= juz.end;
}

/** Get page range for a juz */
export function getJuzPageRange(juzId: number): { start: number; end: number } | null {
  return JUZ_PAGE_MAP[juzId] || null;
}

/** Convert total lines to pages */
export function linesToPages(totalLines: number): number {
  return Math.round((totalLines / LINES_PER_PAGE) * 10) / 10;
}

/** Convert total pages to approximate juz */
export function pagesToJuz(totalPages: number): number {
  return Math.round((totalPages / 20) * 10) / 10;
}
