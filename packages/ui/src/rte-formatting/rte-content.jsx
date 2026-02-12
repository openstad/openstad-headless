import React from 'react';
import { Parser as HtmlToReactParser } from 'html-to-react';
import RenderContent from './rte-formatting';

const BLOCK_TAG_PATTERN = /<(address|article|aside|blockquote|details|dialog|div|dl|dt|dd|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hgroup|hr|li|main|menu|nav|ol|p|pre|section|table|tbody|thead|tfoot|tr|td|th|ul)\b/i;

const parser = new HtmlToReactParser();

function parseChildren(html) {
  const wrapped = parser.parse(`<div>${html || ''}</div>`);
  return wrapped?.props?.children || null;
}

export function hasBlockLevelContent(html) {
  return BLOCK_TAG_PATTERN.test(html || '');
}

function flattenToInlineHtml(html) {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    return html;
  }

  const template = document.createElement('template');
  template.innerHTML = html || '';

  const blockSelector = 'address,article,aside,blockquote,details,dialog,div,dl,dt,dd,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,hr,li,main,menu,nav,ol,p,pre,section,table,tbody,thead,tfoot,tr,td,th,ul';
  const blocks = Array.from(template.content.querySelectorAll(blockSelector));

  blocks.forEach((block) => {
    const fragment = document.createDocumentFragment();
    while (block.firstChild) {
      fragment.appendChild(block.firstChild);
    }
    block.replaceWith(fragment);
  });

  return template.innerHTML;
}

export default function RteContent({
  content,
  inlineComponent: InlineComponent,
  unwrapSingleRootDiv = false,
  forceInline = false,
}) {
  const html = RenderContent(content, { unwrapSingleRootDiv });
  const hasBlock = hasBlockLevelContent(html);

  if (InlineComponent && (forceInline || !hasBlock)) {
    const inlineHtml = forceInline ? flattenToInlineHtml(html) : html;
    return <InlineComponent dangerouslySetInnerHTML={{ __html: inlineHtml }} />;
  }

  return <>{parseChildren(html)}</>;
}
