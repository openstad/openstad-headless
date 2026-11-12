import React from 'react';
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
export default function AddressSearch({ zipCodeApiUrl, fieldKey, onResult, foundText, notFoundText, errorText, }: Props): React.JSX.Element;
export {};
