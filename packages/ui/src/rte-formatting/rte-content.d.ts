import * as React from 'react';

export interface RteContentProps {
  content: any;
  inlineComponent?: React.ElementType;
  unwrapSingleRootDiv?: boolean;
  forceInline?: boolean;
}

export declare function hasBlockLevelContent(html?: string): boolean;

export declare function InlineParagraph(
  props: React.HTMLAttributes<HTMLSpanElement>
): React.JSX.Element;

declare const RteContent: React.FC<RteContentProps>;
export default RteContent;
