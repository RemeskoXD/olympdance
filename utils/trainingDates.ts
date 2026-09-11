import { School } from '../types';

export interface FirstTrainingDateInfo {
  dateStr: string | null;
  formatted: string;
  isSet: boolean;
  withWeekday?: string;
}

/**
 * Returns the first training date for a given school.
 * If not set or empty, returns formatted: "Připravuje se" and isSet: false.
 */
export const getFirstTrainingDate = (school?: School | null): FirstTrainingDateInfo => {
  if (!school || !school.trainingDates || !Array.isArray(school.trainingDates)) {
    return {
      dateStr: null,
      formatted: 'Připravuje se',
      isSet: false,
    };
  }

  const filledDates = school.trainingDates.filter(Boolean);
  if (filledDates.length === 0 || !filledDates[0]) {
    return {
      dateStr: null,
      formatted: 'Připravuje se',
      isSet: false,
    };
  }

  const firstDateStr = filledDates[0].trim();
  if (!firstDateStr) {
    return {
      dateStr: null,
      formatted: 'Připravuje se',
      isSet: false,
    };
  }

  try {
    const [year, month, day] = firstDateStr.split('-').map(Number);
    if (year && month && day) {
      const dateObj = new Date(year, month - 1, day, 12, 0, 0);
      const formatted = `${day}. ${month}. ${year}`;
      const weekday = dateObj.toLocaleDateString('cs-CZ', { weekday: 'long' });
      return {
        dateStr: firstDateStr,
        formatted,
        isSet: true,
        withWeekday: `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${formatted}`,
      };
    }
  } catch {
    // fallback if parsing fails
  }

  return {
    dateStr: firstDateStr,
    formatted: firstDateStr,
    isSet: true,
  };
};

/**
 * Helper to format an ISO date string (YYYY-MM-DD) into readable Czech
 */
export const formatCzechDateString = (dateStr: string, includeWeekday: boolean = false): string => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (year && month && day) {
      if (includeWeekday) {
        const dateObj = new Date(year, month - 1, day, 12, 0, 0);
        return dateObj.toLocaleDateString('cs-CZ', {
          weekday: 'short',
          day: 'numeric',
          month: 'numeric',
          year: 'numeric'
        });
      }
      return `${day}. ${month}. ${year}`;
    }
  } catch {
    // ignore
  }
  return dateStr;
};
