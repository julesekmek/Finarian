/**
 * Date utility functions for Edge Functions
 * Handles date generation, formatting, and weekend filling logic
 */

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Generate all dates from start to end (inclusive)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date strings in YYYY-MM-DD format
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  // Validate dates
  if (isNaN(current.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  if (current > end) {
    throw new Error('Start date must be before or equal to end date');
  }

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Historical data point interface
 */
export interface HistoricalDataPoint {
  date: string; // YYYY-MM-DD
  price: number;
}

/**
 * Fill weekends with the last known weekday price (forward fill)
 * This ensures continuous data for charting and calculations
 * 
 * @param data - Array of historical data points (typically weekdays only)
 * @param fillToDate - Optional target date to fill up to (defaults to last data point)
 * @returns Array with all dates filled, including weekends
 */
export function forwardFillWeekends(
  data: HistoricalDataPoint[],
  fillToDate?: string
): HistoricalDataPoint[] {
  if (data.length === 0) {
    return [];
  }

  // Create a map for quick lookup
  const priceMap = new Map<string, number>();
  data.forEach((d) => priceMap.set(d.date, d.price));

  // Determine date range
  const startDate = data[0].date;
  let endDate = data[data.length - 1].date;

  // Extend to fillToDate if provided and later than last data point
  if (fillToDate && fillToDate > endDate) {
    endDate = fillToDate;
  }

  // Generate all dates in range
  const allDates = generateDateRange(startDate, endDate);
  const filled: HistoricalDataPoint[] = [];
  let lastKnownPrice = data[0].price;

  for (const date of allDates) {
    if (priceMap.has(date)) {
      // Weekday with actual data
      lastKnownPrice = priceMap.get(date)!;
      filled.push({ date, price: lastKnownPrice });
    } else {
      // Weekend or missing data: use last known price
      filled.push({ date, price: lastKnownPrice });
    }
  }

  return filled;
}

/**
 * Round a number to specified decimal places
 */
export function roundToDecimals(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
