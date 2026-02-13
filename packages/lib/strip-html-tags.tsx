export function stripHtmlTags(input: string): string {
  let previous: string;
  do {
    previous = input;
    input = input.replace(/<[^>]*>?/gm, '');
  } while (input !== previous);
  return input;
}
