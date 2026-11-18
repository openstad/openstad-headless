/** Undefined, null, '', false, [] and objects that hold only those. */
export function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null || value === '' || value === false)
    return true;
  if (Array.isArray(value)) return value.length === 0;
  if (isPlainObject(value)) return Object.values(value).every(isEmptyValue);
  return false;
}

export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function sameNumber(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'string' && b.trim() !== '')
    return Number(b) === a;
  if (typeof b === 'number' && typeof a === 'string' && a.trim() !== '')
    return Number(a) === b;
  return false;
}

function compare(a: unknown, b: unknown, emptyIsUnset: boolean): boolean {
  if (a === b) return true;
  if ((a === undefined || a === null) && (b === undefined || b === null))
    return true;
  if (emptyIsUnset && isEmptyValue(a) && isEmptyValue(b)) return true;
  if (sameNumber(a, b)) return true;
  if (a instanceof Date || b instanceof Date) {
    const ta = a instanceof Date ? a.toISOString() : a;
    const tb = b instanceof Date ? b.toISOString() : b;
    return ta === tb;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length &&
      a.every((item, i) => compare(item, b[i], emptyIsUnset))
    );
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of Array.from(keys)) {
      if (!compare(a[key], b[key], emptyIsUnset)) return false;
    }
    return true;
  }
  return false;
}

/** Draft equality: null and undefined, a number and its text, a date and its ISO text are equal. */
export function looseEqual(a: unknown, b: unknown): boolean {
  return compare(a, b, false);
}

/** As looseEqual, and '', false and [] count as unset (form pages). */
export function looseFormEqual(a: unknown, b: unknown): boolean {
  return compare(a, b, true);
}
