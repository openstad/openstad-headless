export function validateProjectNumber(projectNumber: string | string[] | undefined, allowZero: boolean = false): number | undefined {
  if (projectNumber === undefined || projectNumber === null) {
    return undefined;
  }

  let value = Array.isArray(projectNumber) ? projectNumber[0] : projectNumber;

  const parsedNumber = parseInt(value, 10);

  if (
    !Number.isInteger(parsedNumber)
    || parsedNumber < (allowZero ? 0 : 1)
  ) {
    return undefined;
  }

  return parsedNumber;
}

