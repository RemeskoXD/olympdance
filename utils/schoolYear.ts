/**
 * Utility functions for automatic school year calculations.
 * In the Czech Republic, the school year changes every year on September 1st (1. 9.).
 */

export interface SchoolYearInfo {
  startYear: number;
  endYear: number;
  full: string; // e.g. "2026/2027"
  short: string; // e.g. "2026/27"
  semester: 1 | 2;
}

/**
 * Returns the current school year based on the provided date (defaults to now).
 * Before September 1st (Jan 1 - Aug 31): School year is (Year-1)/Year (e.g. in May 2026 -> 2025/2026)
 * From September 1st (Sep 1 - Dec 31): School year is Year/(Year+1) (e.g. on Sep 1, 2026 -> 2026/2027)
 */
export function getSchoolYearInfo(currentDate: Date = new Date()): SchoolYearInfo {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 = Jan, 8 = Sep, 11 = Dec

  // If month is September (8) or later in the year, we are in the new school year (year / year+1)
  const isNewSchoolYear = month >= 8;

  const startYear = isNewSchoolYear ? year : year - 1;
  const endYear = isNewSchoolYear ? year + 1 : year;

  // 1st semester: September (8) through January (0)
  // 2nd semester: February (1) through August (7)
  const semester: 1 | 2 = (month >= 8 || month === 0) ? 1 : 2;

  const full = `${startYear}/${endYear}`;
  const short = `${startYear}/${String(endYear).slice(-2)}`;

  return {
    startYear,
    endYear,
    full,
    short,
    semester,
  };
}

/**
 * Get formatted school year string (e.g. "2026/2027" or "2026/27")
 */
export function getCurrentSchoolYear(format: 'full' | 'short' = 'full', date?: Date): string {
  const info = getSchoolYearInfo(date);
  return format === 'full' ? info.full : info.short;
}

/**
 * Generates the dynamic banner label for Hero component
 * e.g. "Nábor nových členů na školní rok 2026/2027" or "Nábor nových členů 2. pol. školního roku 2026/2027"
 */
export function getHeroEnrollmentText(date?: Date): string {
  const info = getSchoolYearInfo(date);
  if (info.semester === 2) {
    return `Nábor nových členů 2. pol. školního roku ${info.full}`;
  }
  return `Nábor nových členů na školní rok ${info.full}`;
}
