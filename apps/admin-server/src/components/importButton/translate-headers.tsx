import { reverseKeyMap } from "@/lib/keyMap";

export const translateHeaders = (row: Record<string, any>) => {
  const translated: Record<string, any> = {};
  Object.keys(row).forEach((value) => {
    const backendKey = reverseKeyMap[value] || value;
    translated[backendKey] = row[value];
  });
  return translated;
};