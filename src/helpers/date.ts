export type DateParts = {
  day: number;
  month: number;
  year: number;
};

const pad = (value: number): string => String(value).padStart(2, "0");

const isValidDateParts = ({ day, month, year }: DateParts): boolean => {
  if (year < 1000 || year > 9999) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day;
};

const normalizeYear = (value: number): number => {
  if (value >= 1000) return value;
  if (value >= 0 && value < 100) return 2000 + value;
  return value;
};

const tryParseParts = (value?: string | Date | null): DateParts | null => {
  if (value == null) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return { day: value.getUTCDate(), month: value.getUTCMonth() + 1, year: value.getUTCFullYear() };
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const danish = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (danish) {
    const day = Number(danish[1]);
    const month = Number(danish[2]);
    const year = normalizeYear(Number(danish[3]));
    const parts: DateParts = { day, month, year };
    return isValidDateParts(parts) ? parts : null;
  }

  const iso = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const parts: DateParts = { day, month, year };
    return isValidDateParts(parts) ? parts : null;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const parts: DateParts = {
      day: parsed.getUTCDate(),
      month: parsed.getUTCMonth() + 1,
      year: parsed.getUTCFullYear(),
    };
    return isValidDateParts(parts) ? parts : null;
  }

  return null;
};

export const DANISH_DATE_PLACEHOLDER = "dd/mm/yyyy";
export const DANISH_DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;

export const formatDateForDisplay = (value?: string | Date | null): string => {
  const parts = tryParseParts(value);
  if (!parts) return "";
  return `${pad(parts.day)}/${pad(parts.month)}/${parts.year}`;
};

export const toApiDateString = (value?: string | Date | null): string | null => {
  const parts = tryParseParts(value);
  if (!parts) return null;
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
};

export const toDateFromInput = (value?: string | Date | null): Date | null => {
  const parts = tryParseParts(value);
  if (!parts) return null;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
};

export const isValidDanishDateString = (value: string): boolean => {
  if (!value) return false;
  const parts = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!parts) return false;
  const day = Number(parts[1]);
  const month = Number(parts[2]);
  const year = Number(parts[3]);
  return isValidDateParts({ day, month, year });
};
