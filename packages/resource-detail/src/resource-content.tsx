
import React, { useState, useEffect } from 'react';

import { BoldExtension, ItalicExtension, UnderlineExtension, BulletListExtension, OrderedListExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { RemirrorJSON } from 'remirror';

const handleError = (errors: any): RemirrorJSON => {
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



export const resourceContent = (value: any) => {
  if(value !== undefined) {
    if (typeof value === 'string') {
      try {
        const parsedValue = JSON.parse(value);
        if (parsedValue.textarea !== undefined) {

          const { manager, state } = useRemirror({
            extensions: extensions,
            onError: handleError,
            stringHandler: 'html',
            content: {
                type: 'doc',
                content: JSON.parse(value).textarea,
            },
        });
      
        return (
            <div className="w-full">
                <ThemeProvider>
                    <Remirror
                        manager={manager}
                        state={state}
                        onChange={(p) => { }}
                        editable={false}
                    />
                </ThemeProvider>
            </div>
        )

        }
    } catch (e) {
        return value;
    }
    }
  }
};

