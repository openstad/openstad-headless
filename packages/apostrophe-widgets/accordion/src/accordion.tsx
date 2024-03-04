import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOMServer from 'react-dom/server';
import { Parser as HtmlToReactParser, ProcessNodeDefinitions } from 'html-to-react';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { AccordionProvider, Heading3, Heading4, Paragraph, Link, Strong } from "@utrecht/component-library-react";

interface Item {
  content: any;
  label: string;
};

function Accordion({ content, label }: Item) {
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
        return <Heading3>{children}</Heading3>;
      }
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'h4';
      },
      processNode: function (node, children, index) {
        return <Heading4>{children}</Heading4>;
      }
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'p';
      },
      processNode: function (node, children, index) {
        return <Paragraph>{children}</Paragraph>;
      }
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'a';
      },
      processNode: function (node, children, index) {
        return <Link href={node.attribs.href} target={node.attribs.target}>{children}</Link>;
      }
    },
    {
      shouldProcessNode: function (node) {
        return node && node.name && node.name === 'strong';
      },
      processNode: function (node, children, index) {
        return <Strong>{children}</Strong>;
      }
    },
    {
      // Anything else
      shouldProcessNode: function (node) {
        return true;
      },
      processNode: processNodeDefinitions.processDefaultNode
    }
  ];
  const htmlToReactParser = new HtmlToReactParser();
  const reactComponent = htmlToReactParser.parseWithInstructions(htmlInput, isValidNode,
    processingInstructions);
  const reactHtml = ReactDOMServer.renderToStaticMarkup(reactComponent).split('<div>')[1].split('</div>')[0];


  return (
    <AccordionProvider
      sections={[
        {
          body: <div dangerouslySetInnerHTML={{ __html: reactHtml }} />,
          expanded: false,
          label: label
        }
      ]}
    />
  )
}

Accordion.loadWidgetOnElement = function (this: any, container: HTMLElement, props: any) {
  const Component = this;

  if (container) {
    const root = createRoot(container);
    root.render(<Component {...props} />);
  }
};

export { Accordion };
