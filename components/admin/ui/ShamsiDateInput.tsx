'use client';

import { useMemo } from 'react';
import {
  defaultJalaliYearOptions,
  isoDateToJalali,
  JALALI_MONTH_OPTIONS,
  jalaliMonthLength,
  jalaliToIsoDate,
  toJalali,
} from '@/lib/jalali';

interface ShamsiDateInputProps {
  value: string;
  onChange: (isoDate: string) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
}

/**
 * انتخابگر تاریخ شمسی — مقدار value/onChange به صورت YYYY-MM-DD میلادی
 * (سازگار با API و فیلدهای قبلی type="date")
 */
export function ShamsiDateInput({
  value,
  onChange,
  className = '',
  disabled = false,
  id,
}: ShamsiDateInputProps) {
  const today = useMemo(() => {
    const n = new Date();
    return toJalali(n.getFullYear(), n.getMonth() + 1, n.getDate());
  }, []);

  const parts = isoDateToJalali(value) ?? { jy: today.jy, jm: today.jm, jd: today.jd };
  const years = useMemo(() => defaultJalaliYearOptions(parts.jy), [parts.jy]);
  const daysInMonth = jalaliMonthLength(parts.jy, parts.jm);

  function touchIfEmpty() {
    if (!value) {
      onChange(jalaliToIsoDate(today.jy, today.jm, today.jd));
    }
  }

  function emit(jy: number, jm: number, jd: number) {
    const max = jalaliMonthLength(jy, jm);
    const safeDay = Math.min(jd, max);
    onChange(jalaliToIsoDate(jy, jm, safeDay));
  }

  const selectClass =
    'border border-slate-200 rounded-lg px-2 py-2 text-sm bg-white disabled:opacity-50';

  return (
    <div id={id} className={`grid grid-cols-3 gap-2 ${className}`} dir="rtl">
      <select
        aria-label="روز"
        disabled={disabled}
        className={selectClass}
        value={parts.jd}
        onFocus={touchIfEmpty}
        onChange={(e) => emit(parts.jy, parts.jm, Number(e.target.value))}
      >
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        aria-label="ماه"
        disabled={disabled}
        className={selectClass}
        value={parts.jm}
        onFocus={touchIfEmpty}
        onChange={(e) => emit(parts.jy, Number(e.target.value), parts.jd)}
      >
        {JALALI_MONTH_OPTIONS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <select
        aria-label="سال"
        disabled={disabled}
        className={selectClass}
        value={parts.jy}
        onFocus={touchIfEmpty}
        onChange={(e) => emit(Number(e.target.value), parts.jm, parts.jd)}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
