/**
 * Utility functions for automatic school year and camp season calculations.
 * In the Czech Republic, the school year changes every year on September 1st (1. 9.).
 * Summer camp season switches to the upcoming year every year on August 28th (28. 8.).
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

/**
 * Returns the active summer camp season year.
 * Every year on or after August 28th, the season transitions to the next year's summer camp.
 * E.g.
 * - On or after August 28, 2026 -> 2027
 * - On or after August 28, 2027 -> 2028
 */
export function getCampSeasonYear(currentDate: Date = new Date()): number {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed: 0 = Jan, 7 = Aug, 8 = Sep
  const day = currentDate.getDate();

  // If on or after August 28th
  if (month > 7 || (month === 7 && day >= 28)) {
    return year + 1;
  }
  return year;
}

/**
 * Format a camp date string dynamically so that any hardcoded year matches the active season year.
 * e.g. "13.7. - 17.7. 2026" -> "13.7. - 17.7. 2027" (when active season year is 2027)
 */
export function formatCampDate(dateStr: string, currentDate?: Date): string {
  if (!dateStr) return '';
  const targetYear = getCampSeasonYear(currentDate);
  // Replace any 4-digit 202x or 203x with the target season year
  return dateStr.replace(/20[2-3]\d/g, String(targetYear));
}

/**
 * Formats a variable symbol for camps to reflect the active season year (e.g. 2027001).
 */
export function formatCampVariableSymbol(vs?: string, currentDate?: Date): string {
  if (!vs) return '';
  const targetYear = getCampSeasonYear(currentDate);
  return vs.replace(/^20[2-3]\d/, String(targetYear));
}

