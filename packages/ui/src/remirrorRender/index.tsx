import React, { useState, useEffect } from 'react';
import { useRemirror, Remirror, ThemeProvider } from '@remirror/react';
import { BoldExtension, ItalicExtension, UnderlineExtension, BulletListExtension, OrderedListExtension } from 'remirror/extensions';
import {
  Paragraph
} from '@utrecht/component-library-react';


// Below is the code to render remirror as parsed html content
const handleError = (errors: any) => {
  console.error('Error processing content:', errors);
  return {
    type: 'doc',
    content: [],
  };
};

const extensions = () => [
  new BoldExtension({}),
  new ItalicExtension({}),
  new UnderlineExtension({}),
  new BulletListExtension({}),
  new OrderedListExtension({}),
];

export const remirrorRender = (value: any, type: string) => {
  const [textareaContent, setTextareaContent] = useState<any>(null);
  useEffect(() => {
    if (value !== undefined && typeof value === 'string') {
      try {
        const parsedValue = JSON.parse(value);
        setTextareaContent(parsedValue.textarea);
      } catch (e) {
        setTextareaContent(value);
      }
    } else {
      setTextareaContent(value);
    }
  }, [value]);

  const { manager, state } = useRemirror({
    extensions: extensions,
    onError: handleError,
    stringHandler: 'html',
    content: {
      type: 'doc',
      content: [],
    },
  });

  useEffect(() => {
    if (textareaContent !== null && typeof textareaContent !== 'string' && manager.view) {
      manager.view.updateState(
        manager.createState({
          content: {
            type: 'doc',
            content: textareaContent,
          },
        })
      );
    }
  }, [textareaContent, manager]);

  return (
    typeof textareaContent !== 'string' ? (
      <ThemeProvider>
        <Remirror
          manager={manager}
          state={state}
          onChange={(p) => { }}
          editable={false}
        />
      </ThemeProvider>
    ) : (
      type === 'paragraph' ? <Paragraph>{textareaContent}</Paragraph> : <Paragraph><strong>{textareaContent}</strong></Paragraph>
    )
  );
};



// Below is the code to render remirror content as a string
function combineTextStrings(parsedValue: { [key: string]: any }): string {
  let combinedText = '';

  for (const key in parsedValue) {
    if (key === 'text' && typeof parsedValue[key] === 'string') {
      combinedText += parsedValue[key];
    } else if (typeof parsedValue[key] === 'object' && parsedValue[key] !== null) {
      combinedText += combineTextStrings(parsedValue[key]);
    }
  }

  return combinedText;
}

export const remirrorCombineText = (content: any) => {

  if (typeof content === 'string' && content !== null) {
    try {
      const parsedValue = JSON.parse(content);
      if (parsedValue.textarea !== undefined) {
        return combineTextStrings(parsedValue.textarea)
      }
    } catch (e) {
      return content
    }
  } else {
    return content

  }
}