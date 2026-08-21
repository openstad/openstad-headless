import {
  defaultAddressSearchTexts,
  renderFoundAddressText,
} from '@openstad-headless/lib/address-search-texts';
import { FormLabel, Paragraph } from '@utrecht/component-library-react';
import React, { useEffect, useState } from 'react';

export type AddressSearchResult = {
  postcode: string;
  huisnummer: string;
  straat: string;
  woonplaats: string;
  gemeente?: string;
  provincie?: string;
  latitude: string;
  longitude: string;
};

type Props = {
  zipCodeApiUrl: string;
  fieldKey: string;
  onResult: (result: AddressSearchResult | null) => void;
  foundText?: string;
  notFoundText?: string;
  errorText?: string;
};

const postcodePattern = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;

type SearchStatus = 'idle' | 'loading' | 'found' | 'notfound' | 'error';

export default function AddressSearch({
  zipCodeApiUrl,
  fieldKey,
  onResult,
  foundText,
  notFoundText,
  errorText,
}: Props) {
  const [postcode, setPostcode] = useState('');
  const [huisnummer, setHuisnummer] = useState('');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [foundAddress, setFoundAddress] = useState<AddressSearchResult | null>(
    null
  );

  useEffect(() => {
    const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    const cleanHuisnummer = huisnummer.trim();

    if (!postcodePattern.test(cleanPostcode) || cleanHuisnummer === '') {
      setStatus('idle');
      setFoundAddress(null);
      onResult(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setStatus('loading');

      fetch(
        `${zipCodeApiUrl}${cleanPostcode}/${encodeURIComponent(cleanHuisnummer)}`,
        { signal: controller.signal }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Address lookup failed with status ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const result = data?.results?.[0];
          if (!result) {
            setFoundAddress(null);
            setStatus('notfound');
            onResult(null);
            return;
          }

          const lat = parseFloat(result.latitude);
          const lng = parseFloat(result.longitude);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            setFoundAddress(result);
            setStatus('found');
            onResult(result);
          } else {
            setFoundAddress(null);
            setStatus('error');
            onResult(null);
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setStatus('error');
            setFoundAddress(null);
            onResult(null);
          }
        });
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [postcode, huisnummer]);

  return (
    <div className="address-search">
      <div className="address-search-fields">
        <div className="form-element address-search-postcode">
          <FormLabel htmlFor={`${fieldKey}_addressSearchPostcode`}>
            Postcode
          </FormLabel>
          <input
            type="text"
            id={`${fieldKey}_addressSearchPostcode`}
            className="utrecht-textbox utrecht-textbox--html-input"
            value={postcode}
            autoComplete="postal-code"
            onChange={(e) => setPostcode(e.target.value)}
          />
        </div>
        <div className="form-element address-search-huisnummer">
          <FormLabel htmlFor={`${fieldKey}_addressSearchHuisnummer`}>
            Huisnummer
          </FormLabel>
          <input
            type="text"
            id={`${fieldKey}_addressSearchHuisnummer`}
            className="utrecht-textbox utrecht-textbox--html-input"
            value={huisnummer}
            autoComplete="off"
            onChange={(e) => setHuisnummer(e.target.value)}
          />
        </div>
      </div>
      <div className="address-search-feedback" aria-live="polite">
        {status === 'loading' && <Paragraph>Adres zoeken...</Paragraph>}
        {status === 'found' && foundAddress && (
          <Paragraph>
            {renderFoundAddressText(
              foundText || defaultAddressSearchTexts.foundText,
              foundAddress
            )}
          </Paragraph>
        )}
        {status === 'notfound' && (
          <Paragraph>
            {notFoundText || defaultAddressSearchTexts.notFoundText}
          </Paragraph>
        )}
        {status === 'error' && (
          <Paragraph>
            {errorText || defaultAddressSearchTexts.errorText}
          </Paragraph>
        )}
      </div>
    </div>
  );
}
