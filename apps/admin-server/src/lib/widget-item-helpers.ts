export function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

// Keeps the item's own id type; a generated id is always a string.
type WithId<T> = T & {
  id: 'id' extends keyof T ? NonNullable<T['id' & keyof T]> | string : string;
};

export function withId<T extends object>(item: T): WithId<T> {
  const { id } = item as { id?: unknown };
  return (id ? item : { ...item, id: generateId() }) as WithId<T>;
}
