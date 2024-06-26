import React from 'react';
import { createRoot } from 'react-dom/client';

import "./share-links.css";

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { LinkSocial, Heading4 } from "@utrecht/component-library-react";

interface Item {
  title: string;
}

function ShareLinks({ title }: Item) {
  return (
    <div className="share-links">
      <Heading4>{title}</Heading4>
      <div className="link-container">
        <LinkSocial
          external
          href={'http://www.facebook.com/share.php?u=' + encodeURIComponent(location.href)}
          target="_blank"
          title={'Facebook'}
        >
          <i className='icon --facebook'></i>
        </LinkSocial>

        <LinkSocial
          external
          href={'https://twitter.com/intent/tweet?text=' + encodeURIComponent(location.href)}
          target="_blank"
          title={'Twitter'}
        >
          <i className='icon --twitter'></i>
        </LinkSocial>

        <LinkSocial
          external
          href={'mailto:?subject=' + document.title + '&body=' + encodeURIComponent(location.href)}
          title={'Mail'}
        >
          <i className='icon --mail'></i>
        </LinkSocial>

        <LinkSocial
          external
          href={'https://api.whatsapp.com/send?phone=&text=' + encodeURIComponent(location.href) + '&source=&data='}
          target="_blank"
          title={'Whatsapp'}
        >
          <i className='icon --whatsapp'></i>
        </LinkSocial>

        <LinkSocial
          external
          href={'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(location.href)}
          target="_blank"
          title={'LinkedIn'}
        >
          <i className='icon --linkedin'></i>
        </LinkSocial>

        <LinkSocial
          external
          title={'Copy link'}
          onClick={() => {
            navigator.clipboard.writeText(location.href);
          }}
          onKeyDown={(e) => {
            if(e.key === 'Enter') {
              navigator.clipboard.writeText(location.href);
            }
          }}
          className='copy-link'
          tabIndex={0}
        >
          <i className='icon --url'></i>
        </LinkSocial>
      </div>
    </div>
  );

};

ShareLinks.loadWidgetOnElement = function (this: any, container: HTMLElement, props: any) {
  const Component = this;

  if (container) {
    const root = createRoot(container);
    root.render(<Component {...props} />);
  }
};

export { ShareLinks };