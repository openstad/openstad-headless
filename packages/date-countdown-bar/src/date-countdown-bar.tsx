import { loadWidget } from '@openstad-headless/lib/load-widget';
import useInterval from '@rooks/use-interval';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  parseISO,
} from 'date-fns';
import { useEffect, useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import './date-countdown-bar.css';

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

  const [selectedDateISO, setDateISO] = useState<string>(date || '');

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
    if (dateParam?.length > 0) {
      try {
        setDateISO(dateParam);
      } catch (e) {
        console.error(`Setting the given date: ${dateParam} failed`);
      }
    }
  }, [dateParam]);

  // Set the time left, used for the first time
  useEffect(() => {
    if (selectedDateISO) {
      calculateTime(selectedDateISO);
    }
  }, [selectedDateISO]);

  // Every second update the calculated days, hours and minutes
  useInterval(
    () => {
      if (selectedDateISO) {
        calculateTime(selectedDateISO);
      }
    },
    60000,
    true
  );

  // Calculate the time left for the day/hour/minutes until the given date
  const calculateTime = (eventDate: string): void => {
    // const today = new Date().toISOString().replace();
    const startDate: Date = new Date();
    const endDate: Date = parseISO(eventDate);

    const daysDifference = differenceInDays(endDate, startDate);
    const hoursDifference = differenceInHours(endDate, startDate) % 24;
    const minutesDifference = differenceInMinutes(endDate, startDate) % 60;

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
