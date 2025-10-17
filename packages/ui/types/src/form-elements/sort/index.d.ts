import { FC } from "react";
import "./sort.css";
type OptionTitle = {
    key: string;
};
type Option = {
    titles?: OptionTitle[];
};
export type SortFieldProps = {
    options?: Option[];
    title?: string;
    description?: string;
    onSort?: (sorted: Option[]) => void;
    fieldKey: string;
    type?: string;
    defaultValue?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
    onChange?: (e: {
        name: string;
        value: any;
    }, triggerSetLastKey?: boolean) => void;
    prevPageText?: string;
    nextPageText?: string;
};
declare const SortField: FC<SortFieldProps>;
export default SortField;
