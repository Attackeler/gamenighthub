const defaultDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const defaultTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const monthYearFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
});

export const formatDateDisplay = (value: Date) => defaultDateFormatter.format(value);

export const formatTimeDisplay = (value: Date) => defaultTimeFormatter.format(value);

export const formatMonthYear = (value: Date) => monthYearFormatter.format(value);

export const padTwoDigits = (value: number) => value.toString().padStart(2, '0');

export const startOfDay = (value: Date) => {
  const result = new Date(value);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const isSameDay = (a: Date, b: Date) =>
  startOfDay(a).getTime() === startOfDay(b).getTime();
