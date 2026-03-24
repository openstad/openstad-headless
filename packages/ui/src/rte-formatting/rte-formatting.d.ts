export interface RenderContentOptions {
  unwrapSingleRootDiv?: boolean;
}

export function unwrapSingleRootDiv(content: string): string;

declare function RenderContent(
  content: any,
  options?: RenderContentOptions
): string;

export default RenderContent;
