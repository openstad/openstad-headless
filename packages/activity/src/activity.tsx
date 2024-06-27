import { loadWidget } from '@openstad-headless/lib/load-widget';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { Paragraph, ButtonLink, Heading } from '@utrecht/component-library-react';
import React from 'react';
import './activity.css';

export type ActivityProps = {
  currentTitle?: string;
  otherTitle?: string;
  noActivityTextCurrent?: string;
  noActivityTextOther?: string;
  currentSite?: Array<any>;
  otherSites?: Array<any>;
  truncate?: number;
};

function Activity({
  currentSite,
  otherSites,
  currentTitle,
  otherTitle,
  truncate = 80,
  noActivityTextCurrent,
  noActivityTextOther,
  ...props
}: ActivityProps) {

  console.log(currentSite)

  const listItem = (data, key) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(data.date);

    const truncatedDescription = data.description.length > truncate ? `${data.description.substring(0, truncate)}...` : data.description;
    return (
      <li key={key} className='activity__item'>
        <Heading level={3} className='activity__header'>{data.title} <span className='activity__header--label'>{data.label}</span></Heading>
        <Paragraph className='activity__description'>{truncatedDescription}</Paragraph>
        <div>
          <Paragraph className='activity__siteTitle'>{data.site}</Paragraph>
          <Paragraph className='activity__date'>{date.toLocaleDateString("nl-NL", options)}</Paragraph>
        </div>
      </li>
    )
  }

  const noActivity = (text) => {
    return (
      <li className='no-activity'>
        <Paragraph>{text}</Paragraph>
      </li>
    )
  }

  return (
    <section className="user-activity">

      <div>
        <Heading level={2}>{currentTitle ? currentTitle : 'Activiteit op deze website'}</Heading>

        <ul className="user-acivity__list">

          {!currentSite && (
            noActivity( noActivityTextCurrent ? noActivityTextCurrent : 'U heeft geen activiteit op deze website.')
          )}

          {currentSite && (
            currentSite.map((item, key) => (
              listItem(item, key)
            ))
          )}
        </ul>
      </div>

      <div>
        <Heading level={2}>{otherTitle ? otherTitle : 'Activiteit op andere websites'}</Heading>
        <ul className="user-acivity__list">

          {!otherSites && (
            noActivity( noActivityTextOther ? noActivityTextOther : 'U heeft geen activiteit op andere websites.')
          )}

          {otherSites && (
            otherSites.map((item, key) => (
              listItem(item, key)
            ))
          )}
        </ul>
      </div>

    </section>
  );
}

Activity.loadWidget = loadWidget;
export { Activity };
