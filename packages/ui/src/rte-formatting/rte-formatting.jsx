import '@utrecht/component-library-css';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Link,
  OrderedList,
  OrderedListItem,
  Paragraph,
  Strong,
  UnorderedList,
  UnorderedListItem,
} from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import {
  Parser as HtmlToReactParser,
  ProcessNodeDefinitions,
} from 'html-to-react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

function unwrapSingleRootDiv(content) {
  if (typeof content !== 'string') return content;
  const trimmed = content.trim();
  if (!trimmed) return trimmed;

  if (
    typeof document === 'undefined' ||
    typeof document.createElement !== 'function'
  ) {
    return content;
  }

  const template = document.createElement('template');
  template.innerHTML = trimmed;

  const meaningfulNodes = Array.from(template.content.childNodes).filter(
    (node) => {
      return (
        node.nodeType !== 3 ||
        (node.textContent && node.textContent.trim() !== '')
      );
    }
  );

  if (meaningfulNodes.length !== 1) return content;

  const root = meaningfulNodes[0];
  if (root.nodeType !== 1 || root.nodeName.toLowerCase() !== 'div')
    return content;

  return root.innerHTML;
}

function convertTextDivsToParagraphs(content) {
  if (typeof content !== 'string' || !content) return content;
  if (
    typeof document === 'undefined' ||
    typeof document.createElement !== 'function'
  ) {
    return content;
  }

  const template = document.createElement('template');
  template.innerHTML = content;

  const blockTags = new Set([
    'address',
    'article',
    'aside',
    'blockquote',
    'details',
    'dialog',
    'div',
    'dl',
    'dt',
    'dd',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hgroup',
    'hr',
    'li',
    'main',
    'menu',
    'nav',
    'ol',
    'p',
    'pre',
    'section',
    'table',
    'tbody',
    'thead',
    'tfoot',
    'tr',
    'td',
    'th',
    'ul',
  ]);

  const divs = Array.from(template.content.querySelectorAll('div'));
  divs.forEach((divEl) => {
    if (divEl.attributes.length > 0) return;

    const hasNestedBlock = Array.from(divEl.children).some((child) => {
      const tag = child.tagName.toLowerCase();
      return tag !== 'br' && blockTags.has(tag);
    });
    if (hasNestedBlock) return;

    const p = document.createElement('p');
    while (divEl.firstChild) p.appendChild(divEl.firstChild);
    divEl.replaceWith(p);
  });

  const paragraphs = Array.from(template.content.querySelectorAll('p'));
  paragraphs.forEach((paragraph) => {
    if (!paragraph.classList.contains('utrecht-paragraph')) {
      paragraph.classList.add('utrecht-paragraph');
    }
  });

  return template.innerHTML;
}

export default function RenderContent(content, options = {}) {
  const { unwrapSingleRootDiv: shouldUnwrapSingleRootDiv = false } = options;
  const htmlInput = `<div>${content || ''}</div>`;

  const isValidNode = function () {
    return true;
  };

  // Order matters. Instructions are processed in the order they're defined
  const processNodeDefinitions = new ProcessNodeDefinitions();
  const processingInstructions = [
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'h1';
      },
      processNode: function (node, children, index) {
        return <Heading1 key={index}>{children}</Heading1>;
      },
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'h2';
      },
      processNode: function (node, children, index) {
        return <Heading2 key={index}>{children}</Heading2>;
      },
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'h3';
      },
      processNode: function (node, children, index) {
        return <Heading3 key={index}>{children}</Heading3>;
      },
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'h4';
      },
      processNode: function (node, children, index) {
        return <Heading4 key={index}>{children}</Heading4>;
      },
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'p';
      },
      processNode: function (node, children, index) {
        return <Paragraph key={index}>{children}</Paragraph>;
      },
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'a';
      },
      processNode: function (node, children, index) {
        return (
          <Link
            key={index}
            href={node.attribs.href}
            target={node.attribs.target}>
            {children}
          </Link>
        );
      },
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'strong';
      },
      processNode: function (node, children, index) {
        return <Strong key={index}>{children}</Strong>;
      },
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'ol';
      },
      processNode: function (node, children, index) {
        return <OrderedList key={index}>{children}</OrderedList>;
      },
    },
    {
      shouldProcessNode: function (node) {
        return (
          node && node.name && node.name === 'li' && node.parent.name === 'ol'
        );
      },
      processNode: function (node, children, index) {
        return <OrderedListItem key={index}>{children}</OrderedListItem>;
      },
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'ul';
      },
      processNode: function (node, children, index) {
        return <UnorderedList key={index}>{children}</UnorderedList>;
      },
    },
    {
      shouldProcessNode: function (node) {
        return (
          node && node.name && node.name === 'li' && node.parent.name === 'ul'
        );
      },
      processNode: function (node, children, index) {
        return <UnorderedListItem key={index}>{children}</UnorderedListItem>;
      },
    },
    {
      shouldProcessNode: function (node) {
        return true;
      },
      processNode: processNodeDefinitions.processDefaultNode,
    },
  ];
  const htmlToReactParser = new HtmlToReactParser();
  const reactComponent = htmlToReactParser.parseWithInstructions(
    htmlInput,
    isValidNode,
    processingInstructions
  );
  const rendered = ReactDOMServer.renderToStaticMarkup(reactComponent);
  const output =
    rendered.startsWith('<div>') && rendered.endsWith('</div>')
      ? rendered.slice(5, -6)
      : rendered;

  if (!shouldUnwrapSingleRootDiv) return output;

  const unwrapped = unwrapSingleRootDiv(output);
  return convertTextDivsToParagraphs(unwrapped);
}
