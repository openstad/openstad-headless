export function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

export function withId(item: any) {
  return item.id ? item : { ...item, id: generateId() };
}
