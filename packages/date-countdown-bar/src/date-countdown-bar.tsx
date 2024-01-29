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
  const zone = 'Europe/Amsterdam';

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  }>({ days: 0, hours: 0, minutes: 0 });

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
    if(dateParam?.length > 0) {
      try {
        const parsedDate = parse(
          dateParam,
          'dd-MM-yyyy',
          zonedTimeToUtc(new Date(), zone)
        );

        setParsedDate(parsedDate);
      } catch (e) {
        console.error(`Parsing the given date ${dateParam} failed`);
      }
    }
  }, [dateParam]);

  // Set the time left, used for the first time
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

  // Calculate the time left for the day/hour/minutes until the given date
  const calculateTime = (date: Date): void => {
    const givenDate = zonedTimeToUtc(date, zone);
    const currentDate = zonedTimeToUtc(new Date(), zone);
    const daysDifference = differenceInDays(givenDate, currentDate);

    const hoursDifference =
      differenceInHours(givenDate, currentDate, {
        roundingMethod: 'ceil',
      }) % 24;

    const minutesDifference =
      differenceInMinutes(givenDate, currentDate, {
        roundingMethod: 'ceil',
      }) % 60;

    setTimeLeft({
      days: Math.max(0, daysDifference),
      hours: Math.max(0, hoursDifference),
      minutes: Math.max(0, minutesDifference),
    });
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
          <p className="nr-left-title">{padNumber(timeLeft.days)}</p>
          <p className="nr-left-label">Dagen</p>
        </div>

        <div className="osc-countdown-bar-nr-left">
          <p className="nr-left-title">{padNumber(timeLeft.hours)}</p>
          <p className="nr-left-label">Uren</p>
        </div>

        {timeLeft.minutes > 0 ? (
          <div className="osc-countdown-bar-nr-left">
            <p className="nr-left-title">{padNumber(timeLeft.minutes)}</p>
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
