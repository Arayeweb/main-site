import { describe, expect, it } from 'vitest';
import {
  formatJalaliDate,
  formatJalaliDateTime,
  isoDateToJalali,
  jalaliToIsoDate,
  toGregorian,
  toJalali,
} from '@/lib/jalali';

describe('jalali', () => {
  it('converts known Gregorian ↔ Jalali pairs', () => {
    // 2026-07-24 → 1405-05-02
    expect(toJalali(2026, 7, 24)).toEqual({ jy: 1405, jm: 5, jd: 2 });
    expect(toGregorian(1405, 5, 2)).toEqual({ gy: 2026, gm: 7, gd: 24 });
  });

  it('round-trips ISO date through jalali parts', () => {
    const iso = '2026-07-24';
    const parts = isoDateToJalali(iso);
    expect(parts).toEqual({ jy: 1405, jm: 5, jd: 2 });
    expect(jalaliToIsoDate(parts!.jy, parts!.jm, parts!.jd)).toBe(iso);
  });

  it('formats display dates in Jalali', () => {
    expect(formatJalaliDate('2026-07-24T12:00:00')).toBe('1405/05/02');
    expect(formatJalaliDateTime('2026-07-24T09:05:00')).toMatch(/^1405\/05\/02، 09:05$/);
  });

  it('returns dash for empty values', () => {
    expect(formatJalaliDate(null)).toBe('—');
    expect(formatJalaliDateTime(undefined)).toBe('—');
  });
});
