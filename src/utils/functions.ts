import dayjs from 'dayjs';

export function removeUndefinedValuesFromPayload(payload): any {
  return Object.entries(payload).reduce((acc, [key, value]) => {
    const valueIsNotUndefined = value !== undefined;
    const valueIsNotAnEmptyString =
      typeof value === 'string' ? value.trim() !== '' : true;
    if (valueIsNotUndefined && valueIsNotAnEmptyString) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function isValidDate(date: string): boolean {
  return dayjs(date).isValid();
}
