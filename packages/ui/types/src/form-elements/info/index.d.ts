import { FC } from "react";
import { FormValue } from "@openstad-headless/form/src/form";
export type InfoFieldProps = {
    overrideDefaultValue?: FormValue;
    title?: string;
    description?: string;
    fieldKey?: string;
    type?: string;
    image?: string;
    imageAlt?: string;
    imageDescription?: string;
    infoBlockStyle?: string;
    infoBlockShareButton?: boolean;
    infoBlockExtraButton?: string;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    defaultValue?: string;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
};
declare const InfoField: FC<InfoFieldProps>;
export default InfoField;
