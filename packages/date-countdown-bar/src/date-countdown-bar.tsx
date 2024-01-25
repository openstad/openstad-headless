import 'remixicon/fonts/remixicon.css';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import React, { useEffect, useState } from 'react';
import './date-countdown-bar.css';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  parse,
  isValid,
} from 'date-fns';
import useInterval from '@rooks/use-interval';

import { zonedTimeToUtc } from 'date-fns-tz';
import { Spacer } from '@openstad-headless/ui/src';

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
  const zone = 'Europe/Berlin';

  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [hoursLeft, setHoursLeft] = useState<number>(0);
  const [minutesLeft, setMinutesLeft] = useState<number>(0);

  const [parsedDate, setParsedDate] = useState<Date>();

  const urlParams = new URLSearchParams(window.location.search);
  const [dateParam] = useState<string>(urlParams.get('date') || date);
  const [beforeTextParam] = useState<string>(
    urlParams.get('beforeText') || beforeText
  );
  const [afterTextParam] = useState<string>(
    urlParams.get('afterText') || afterText
  );

  // Parse the received datestring
  useEffect(() => {
    const parsedDate = parse(
      dateParam,
      'dd-MM-yyyy',
      zonedTimeToUtc(new Date(), zone)
    );

    if (isValid(parsedDate)) {
      setParsedDate(parsedDate);
    }
  }, [dateParam]);

  // First time render
  useEffect(() => {
    if (parsedDate) {
      calculateTime(parsedDate);
    }
  }, [parsedDate]);

  // Every second update the calculated days, hours and minutes
  useInterval(
    () => {
      if (parsedDate) {
        calculateTime(parsedDate);
      }
    },
    60000,
    true
  );

  const calculateTime = (date: Date): void => {
    try {
      const givenDate = zonedTimeToUtc(date, zone);
      const currentDate = zonedTimeToUtc(new Date(), zone);

      const daysDifference = differenceInDays(givenDate, currentDate);
      setDaysLeft(Math.max(0, daysDifference));

      const hoursDifference =
        differenceInHours(givenDate, currentDate, {
          roundingMethod: 'ceil',
        }) % 24;
      setHoursLeft(Math.max(0, hoursDifference));

      const minutesDifference =
        differenceInMinutes(givenDate, currentDate, {
          roundingMethod: 'ceil',
        }) % 60;
      setMinutesLeft(Math.max(0, minutesDifference));
    } catch (e) {
      console.error('Calculating the difference in days failed');
    }
  };

  const padNumber = (nr: number): string => {
    return nr > 10 ? nr.toString() : nr.toString().padStart(2, '0');
  };

  return (
    <div className="osc date-countdown-bar-container">
      {beforeTextParam.length > 0 ? (
        <>
          <p className="osc-countdown-bar-text">{beforeTextParam}</p>
          <Spacer />
        </>
      ) : null}

      <>
        <div className="osc-countdown-bar-nr-left">
          <p className="nr-left-title">{padNumber(daysLeft)}</p>
          <p className="nr-left-label">Dagen</p>
        </div>

        <div className="osc-countdown-bar-nr-left">
          <p className="nr-left-title">{padNumber(hoursLeft)}</p>
          <p className="nr-left-label">Uren</p>
        </div>

        {minutesLeft > 0 ? (
          <div className="osc-countdown-bar-nr-left">
            <p className="nr-left-title">{padNumber(minutesLeft)}</p>
            <p className="nr-left-label">Minuten</p>
          </div>
        ) : null}
      </>
      {afterTextParam.length > 0 ? (
        <>
          <Spacer />
          <p className="osc-countdown-bar-text">{afterTextParam}</p>
        </>
      ) : null}
    </div>
  );
}

DateCountdownBar.loadWidget = loadWidget;
export { DateCountdownBar };
