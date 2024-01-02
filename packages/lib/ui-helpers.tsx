export function elipsize(value: string, maxLength: number) {
  if (value.length > maxLength) {
    return value.substring(0, maxLength) + '...';
  }
  return value;
}
