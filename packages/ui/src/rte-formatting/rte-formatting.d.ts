export interface RenderContentOptions {
  unwrapSingleRootDiv?: boolean;
  headingBaseLevel?: number;
}

export declare function unwrapSingleRootDiv(content: string): string;

declare function RenderContent(
  content: any,
  options?: RenderContentOptions
): string;

export default RenderContent;
