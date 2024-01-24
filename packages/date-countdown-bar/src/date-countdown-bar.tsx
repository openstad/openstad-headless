import 'remixicon/fonts/remixicon.css';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import React, { useEffect, useState } from 'react';
import './date-countdown-bar.css';
import { differenceInDays, parse } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { Spacer, Card } from '@openstad-headless/ui/src';

export type DateCountdownBarWidgetProps = {
  beforeText?: string;
  afterText?: string;
  date: string;
};

function DateCountdownBar({
  beforeText = '',
  date,
  afterText = '',
}: DateCountdownBarWidgetProps) {
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const urlParams = new URLSearchParams(window.location.search);
  const [dateParam] = useState<string>(urlParams.get('date') || date);
  const [beforeTextParam] = useState<string>(urlParams.get('beforeText') || beforeText);
  const [afterTextParam] = useState<string>(urlParams.get('afterText') || afterText);

  useEffect(() => {
    if (dateParam) {
      try {
        const zone = 'Europe/Berlin';
        const parsedDate = parse(
          dateParam,
          'dd-mm-yyyy',
          zonedTimeToUtc(new Date(), zone)
        );

        const givenDate = zonedTimeToUtc(parsedDate, zone);
        givenDate.setHours(0, 0, 0, 0);

        const currentDate = zonedTimeToUtc(new Date(), zone);
        currentDate.setHours(0, 0, 0, 0);

        const difference = differenceInDays(givenDate, currentDate);
        setDaysLeft(difference < 0 ? 0 : difference);
      } catch (e) {
        console.error('Calculating the difference in days failed');
      }
    }
  }, [dateParam]);

  return (
    <div className="osc date-countdown-bar-container">
      {beforeTextParam.length > 0 ? (
        <>
          <p>{beforeTextParam}</p>
          <Spacer />
        </>
      ) : null}

      <>
        {Array.from(
          daysLeft > 10
            ? daysLeft.toString()
            : daysLeft.toString().padStart(2, '0')
        ).map((nr) => (
          <>
          <Card>
            <p>{nr}</p>
          </Card>
          </>
        ))}
      </>
      {afterTextParam.length > 0 ? (
        <>
          <Spacer />
          <p>{afterTextParam}</p>
        </>
      ) : null}
    </div>
  );
}

DateCountdownBar.loadWidget = loadWidget;
export { DateCountdownBar };
