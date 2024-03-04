import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Parser as HtmlToReactParser, ProcessNodeDefinitions } from 'html-to-react';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading3, Heading4, Paragraph, Link, Strong } from "@utrecht/component-library-react";

export default function RenderContent(content) {
  const htmlInput = `<div>${content}</div>`;

  const isValidNode = function () {
    return true;
  };

  // Order matters. Instructions are processed in the order they're defined
  const processNodeDefinitions = new ProcessNodeDefinitions();
  const processingInstructions = [
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'h3';
      },
      processNode: function (node, children, index) {
        return <Heading3 >{children}</Heading3>;
      }
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'h4';
      },
      processNode: function (node, children, index) {
        return <Heading4 key={index}>{children}</Heading4>;
      }
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'p';
      },
      processNode: function (node, children, index) {
        return <Paragraph key={index}>{children}</Paragraph>;
      }
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'a';
      },
      processNode: function (node, children, index) {
        return <Link key={index} href={node.attribs.href} target={node.attribs.target}>{children}</Link>;
      }
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'strong';
      },
      processNode: function (node, children, index) {
        return <Strong key={index}>{children}</Strong>;
      }
    },
    {
      shouldProcessNode: function (node) {
        return true;
      },
      processNode: processNodeDefinitions.processDefaultNode
    }
  ];
  const htmlToReactParser = new HtmlToReactParser();
  const reactComponent = htmlToReactParser.parseWithInstructions(htmlInput, isValidNode,
    processingInstructions);

  return ReactDOMServer.renderToStaticMarkup(reactComponent).split('<div>')[1].split('</div>')[0]
}
