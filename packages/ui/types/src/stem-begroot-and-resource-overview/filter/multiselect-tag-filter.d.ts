import React from 'react';
type Props = {
    dataStore: any;
    tagType: string;
    placeholder?: string;
    selected?: number[];
    onUpdateFilter?: (filter: any, label?: string, forceSelected?: boolean) => void;
    onlyIncludeIds?: number[];
    tagGroupProjectId?: any;
    preFilterTags?: Array<number>;
    parentStopUsingDefaultValue?: boolean;
};
declare const MultiSelectTagFilter: ({ dataStore, tagType, onUpdateFilter, selected, onlyIncludeIds, preFilterTags, parentStopUsingDefaultValue, ...props }: Props) => false | React.JSX.Element;
export { MultiSelectTagFilter };
