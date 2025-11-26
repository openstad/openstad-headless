import React from 'react';
import './index.css';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
type Filter = {
    tags: Array<number>;
    search: {
        text: string;
    };
    sort: string;
    page: number;
    pageSize: number;
    location: PostcodeAutoFillLocation;
};
export type PostcodeAutoFillLocation = {
    lat: string;
    lng: string;
    proximity?: number;
} | undefined;
type Props = {
    className?: string;
    dataStore: any;
    resources: any;
    onUpdateFilter?: (filter: Filter) => void;
    sorting: Array<{
        value: string;
        label: string;
    }>;
    displaySorting: boolean;
    defaultSorting: string;
    displaySearch: boolean;
    itemsPerPage?: number;
    displayTagFilters: boolean;
    tagGroups?: Array<{
        type: string;
        label?: string;
        multiple: boolean;
        projectId?: any;
    }>;
    tagsLimitation?: Array<number>;
    searchPlaceholder: string;
    resetText: string;
    applyText: string;
    showActiveTags?: boolean;
    preFilterTags?: Array<number>;
    displayLocationFilter?: boolean;
    displayCollapsibleFilter?: boolean;
};
export declare function Filters({ dataStore, resources, sorting, tagGroups, tagsLimitation, onUpdateFilter, className, showActiveTags, preFilterTags, displayCollapsibleFilter, ...props }: Props): React.JSX.Element | null;
export {};
