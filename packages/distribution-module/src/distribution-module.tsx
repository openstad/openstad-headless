// @ts-ignore
import React from 'react';
import './distribution-module.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import {loadWidget} from '@openstad-headless/lib/load-widget';
import {
    Banner,
    Button, Icon,
    Spacer,
} from '@openstad-headless/ui/src';
import {ProjectSettingProps, BaseProps} from '@openstad-headless/types';
import toast, {Toaster} from 'react-hot-toast';
import Form from "@openstad-headless/form/src/form";
import {
    Paragraph,
    Heading2,
    Heading3,
} from '@utrecht/component-library-react';

export type DistributionModuleProps =
    BaseProps &
    ProjectSettingProps & {
    widgetId?: number;
    afterSubmitUrl?: string;
    title?: string;
    description?: string;
    items?: Array<Item>;
    total: number;
    choice: "budget" | "points";
    pointsTotalText?: string;
    pointsLeftoverText?: string;
    budgetTotalText?: string;
    budgetLeftoverText?: string;
    budgetErrorTitle?: string;
    budgetErrorMessage?: string;
    pointsErrorTitle?: string;
    pointsErrorMessage?: string;
    prependText?: string;
    appendText?: string;
};

export type Item = {
    trigger: string;
    title?: string;
    key: string;
    description?: string;
    placeholder?: string;
};

function DistributionModule(props: DistributionModuleProps) {
    const notifyCreate = () =>
        toast.success('DistributionModule ingediend', {position: 'bottom-center'});

    const datastore = new DataStore(props);

    const {create: createSubmission} = datastore.useSubmissions({
        projectId: props.projectId,
    });

    const [distributeLeft, setDistributeLeft] = React.useState(props.total || 0);

    async function onSubmit(formData: any) {
        const result = await createSubmission(formData, props.widgetId);

        if (result) {
            if (props.afterSubmitUrl) {
                location.href = props.afterSubmitUrl.replace("[id]", result.id)
            } else {
                notifyCreate();
            }
        }
    }

    if (props.items) {
        props.items = props.items.map((item) => {
            const choice = props.choice === 'budget';
            const prepend = choice ? props.prependText : '';
            const append = !choice ? props.appendText : '';

            return {
                ...item,
                type: 'number',
                fieldKey: item.title || item.description,
                prepend,
                append,
                format: choice,
            };
        });
    }

    const valuesChanged = (values: { [p: string]: string }) => {
        const checkIfValuesAreNotEmpty = Object.values(values).filter((value: string) => value !== '');

        if (checkIfValuesAreNotEmpty.length === 0) {
            setDistributeLeft(props.total);
            return;
        }

        const total = props.total;
        const valuesTotal = Object.values(values).reduce((acc: number, value: string) => {
            return acc + parseInt(value || "0")
        }, 0);

        const left = total - valuesTotal;

        setDistributeLeft(left);
    }

    return (
        <div className="osc">
            <div className="osc-distribution-modules-item-content">
                {props.title && <Heading2>{props.title}</Heading2>}
                <div className="osc-distribution-modules-item-description">
                    {props.description && (
                        <Paragraph>{props.description}</Paragraph>
                    )}
                </div>

                <div className={`osc-distribution-modules-content`}>
                    {props.choice === 'points' && (
                        <>
                            <div className={`osc-distribution-modules-content__points`}>
                                <div className={`osc-distribution-modules-content__points__remaining`}>
                                    <Paragraph>{props.pointsTotalText}</Paragraph>
                                    <Paragraph>{props.total || 0} <span className={'append'}>{props.appendText}</span>
                                    </Paragraph>
                                </div>
                                <div className={`osc-distribution-modules-content__points__leftover`}>
                                    <Paragraph>{props.pointsLeftoverText}</Paragraph>
                                    <Paragraph>{distributeLeft} <span className={'append'}>{props.appendText}</span>
                                    </Paragraph>
                                </div>
                            </div>
                            <div className={`osc-distribution-modules-content__points__error`}>
                                {(distributeLeft < 0 && (props.pointsErrorTitle || props.pointsErrorMessage)) && (
                                    <Banner
                                        big={true}
                                    >
                                        {props.pointsErrorTitle && (<Heading3>{props.pointsErrorTitle}</Heading3>)}
                                        {props.pointsErrorMessage && (<Paragraph dangerouslySetInnerHTML={{__html: props.pointsErrorMessage}}/>)}
                                    </Banner>
                                )}
                            </div>
                        </>
                    )}
                    {props.choice === 'budget' && (
                        <>
                            <div className={`osc-distribution-modules-content__budget`}>
                                <div className={`osc-distribution-modules-content__budget__remaining`}>
                                    <Paragraph>{props.budgetTotalText}</Paragraph>
                                    <Paragraph><span className={'prepend'}>{props.prependText}</span> {props.total || 0}
                                    </Paragraph>
                                </div>
                                <div className={`osc-distribution-modules-content__budget__leftover`}>
                                    <Paragraph>{props.budgetLeftoverText}</Paragraph>
                                    <Paragraph><span className={'prepend'}>{props.prependText}</span> {distributeLeft}
                                    </Paragraph>
                                </div>
                            </div>
                            <div className={`osc-distribution-modules-content__budget__error`}>
                                {(distributeLeft < 0 && (props.budgetErrorTitle || props.budgetErrorMessage)) && (
                                    <Banner
                                        big={true}
                                    >
                                        {props.budgetErrorTitle && (<Heading3>{props.budgetErrorTitle}</Heading3>)}
                                        {props.budgetErrorMessage && (<Paragraph dangerouslySetInnerHTML={{__html: props.budgetErrorMessage}}/>)}
                                    </Banner>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <Form
                    fields={props.items || []}
                    submitHandler={onSubmit}
                    title=""
                    submitText="Versturen"
                    getValuesOnChange={valuesChanged}
                    submitDisabled={distributeLeft !== 0}
                    {...props}
                />
            </div>

            <Toaster/>
        </div>
    );
}

DistributionModule.loadWidget = loadWidget;
export {DistributionModule};
