export interface RenderContentOptions {
  unwrapSingleRootDiv?: boolean;
}

declare function RenderContent(content: any, options?: RenderContentOptions): string;

export default RenderContent;
