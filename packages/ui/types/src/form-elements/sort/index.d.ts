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
};
declare const SortField: FC<SortFieldProps>;
export default SortField;
