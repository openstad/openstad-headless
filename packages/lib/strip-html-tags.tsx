const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const MAX_CODE_POINT = 0x10ffff;

function fromCodePoint(codePoint: number, original: string): string {
  if (!Number.isInteger(codePoint) || codePoint < 0) {
    return original;
  }

  if (codePoint > MAX_CODE_POINT) {
    return original;
  }

  return String.fromCodePoint(codePoint);
}

function decodeHtmlEntities(input: string): string {
  return input.replace(
    /&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi,
    (match, entity: string) => {
      const lowered = entity.toLowerCase();

      if (lowered.startsWith('#x')) {
        return fromCodePoint(parseInt(entity.slice(2), 16), match);
      }

      if (lowered.startsWith('#')) {
        return fromCodePoint(parseInt(entity.slice(1), 10), match);
      }

      return NAMED_ENTITIES[lowered] ?? match;
    }
  );
}

export function stripHtmlTags(input: string): string {
  let previous: string;
  do {
    previous = input;
    input = input.replace(/<[^>]*>?/gm, '');
  } while (input !== previous);
  return decodeHtmlEntities(input);
}
