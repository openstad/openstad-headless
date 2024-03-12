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

  console.log('https://api.whatsapp.com/send?phone=&text='+ encodeURIComponent(location.href)+'&source=&data=')
  return (
    <div>
      <Heading4>{title}</Heading4>
      <LinkSocial
        external
        href={'http://www.facebook.com/share.php?u=' + encodeURIComponent(location.href)}
        title={'Facebook'}
      >
        <i className='icon --facebook'></i>
      </LinkSocial>

      <LinkSocial
        external
        href={'https://twitter.com/intent/tweet?text=' + encodeURIComponent(location.href)}
        title={'Twitter'}
      >
        <i className='icon --twitter'></i>
      </LinkSocial>

      <LinkSocial
        external
        href={'mailto:?subject='+document.title+'&body=' + encodeURIComponent(location.href)}
        title={'Mail'}
      >
        <i className='icon --mail'></i>
      </LinkSocial>

      <LinkSocial
        external
        href={'https://api.whatsapp.com/send?phone=&text='+ encodeURIComponent(location.href)+'&source=&data='}
        title={'Whatsapp'}
      >
        <i className='icon --whatsapp'></i>
      </LinkSocial>
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