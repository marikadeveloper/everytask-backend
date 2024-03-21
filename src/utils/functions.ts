import dayjs from 'dayjs';

export function removeUndefinedValuesFromPayload(payload): any {
  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function isValidDate(date: string): boolean {
  return dayjs(date).isValid();
}
