import { loadWidget } from '@openstad-headless/lib/load-widget';
import useInterval from '@rooks/use-interval';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Paragraph } from "@utrecht/component-library-react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  parseISO,
} from 'date-fns';
import { useEffect, useState } from 'react';
import './date-countdown-bar.css';

import React from 'react';

export type DateCountdownBarWidgetProps = {
  beforeText?: string;
  afterText?: string;
  date: string;
  direction?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
};

function DateCountdownBar({
  beforeText = '',
  date,
  afterText = '',
  direction = 'horizontal',
  showLabels = true,
  showHours = true,
  showMinutes = true,
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

  const renderAmount = (e: string) => {
    return e.split('').map((item, index) => <span className="amount-item" key={index}><span>{item}</span></span>);
  };

  return (
    <div className={`osc date-countdown-bar-container --${direction}`}>
      {beforeTextParam.length > 0 ? (
        <Paragraph className="osc-countdown-bar-text --end">{beforeTextParam}</Paragraph>
      ) : null}

      <div className="osc-countdown-bar-nr-container">
        <div className="osc-countdown-bar-nr-left">
          <Paragraph>
            <span className="nr-left-title amount">{renderAmount(padNumber(timeLeft.days))}</span>
            {showLabels && (
              <span className="nr-left-label">Dagen</span>
            )}
          </Paragraph>
        </div>
        {showHours && (
          <div className="osc-countdown-bar-nr-left">
            <Paragraph>
              <span className="nr-left-title amount">{renderAmount(padNumber(timeLeft.hours))}</span>
              {showLabels && (
                <span className="nr-left-label">Uren</span>
              )}
            </Paragraph>
          </div>
        )}
        {showMinutes && (
          timeLeft.minutes > 0 ? (
            <div className="osc-countdown-bar-nr-left">
              <Paragraph>
                <span className="nr-left-title amount">{renderAmount(padNumber(timeLeft.minutes))}</span>
                {showLabels && (
                  <span className="nr-left-label">Minuten</span>
                )}
              </Paragraph>
            </div>
          ) : null
        )}
      </div>
      {afterTextParam.length > 0 ? (
        <Paragraph className="osc-countdown-bar-text --start">{afterTextParam}</Paragraph>
      ) : null}
    </div>
  );
}

DateCountdownBar.loadWidget = loadWidget;
export { DateCountdownBar };
