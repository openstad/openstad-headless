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
import Form from "@openstad-headless/form/src/form";
import {
    Paragraph,
    Heading2,
    Heading3,
    Heading6,
} from '@utrecht/component-library-react';
import hasRole from '../../lib/has-role';
import NotificationService from "../../lib/NotificationProvider/notification-service";
import NotificationProvider from "../../lib/NotificationProvider/notification-provider";

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
    formVisibility?: string;
    showProgress?: boolean;
};

export type Item = {
    trigger: string;
    title?: string;
    key: string;
    description?: string;
    placeholder?: string;
};

function DistributionModule(props: DistributionModuleProps) {
    const notifyCreate = () => NotificationService.addNotification("Verdeling ingediend", "success");

    const datastore = new DataStore(props);

    const {create: createSubmission} = datastore.useSubmissions({
        projectId: props.projectId,
    });

    const {
        data: currentUser
    } = datastore.useCurrentUser({ ...props });

    const formOnlyVisibleForUsers = !!props.formVisibility && props.formVisibility === 'users';

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
            const isBudget = props.choice === 'budget';
            const prepend = isBudget ? props.prependText : '';
            const append = !isBudget ? props.appendText : '';

            return {
                ...item,
                type: 'number',
                fieldKey: item.title || item.description,
                prepend,
                append,
                format: true,
                disabled: !hasRole(currentUser, 'member') && formOnlyVisibleForUsers,
            };
        });
    }

    const valuesChanged = (values: { [p: string]: string | [] | Record<number, never> }) => {
        const checkIfValuesAreNotEmpty = Object.values(values).filter((value): value is string => typeof value === "string" && value !== "");

        if (checkIfValuesAreNotEmpty.length === 0) {
            setDistributeLeft(props.total);
            return;
        }

        const total = props.total;
        const valuesTotal = checkIfValuesAreNotEmpty.reduce((acc: number, value) => acc + parseInt(value || "0"), 0);

        const left = total - valuesTotal;

        setDistributeLeft(left);
    }

    const formatNumber = (num: string | number) => {
        return (num + '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <div className="osc">
            <div className={`osc-distribution-modules-item-content ${(formOnlyVisibleForUsers && !hasRole(currentUser, 'member')) ? 'visible-disabled' : ''}`}>
                {props.title && <Heading2>{props.title}</Heading2>}
                <div className="osc-distribution-modules-item-description">
                    {props.description && (
                        <Paragraph>{props.description}</Paragraph>
                    )}
                </div>

                <div className={`osc-distribution-modules-content`}>
                    {props.choice === 'points' && (
                        <>
                            <div className={`osc-distribution-modules-content-container`}>
                                <div className={`osc-distribution-modules-content__remaining`}>
                                    <Paragraph>{props.pointsTotalText}</Paragraph>
                                    <Paragraph>{formatNumber(props.total || 0)} <span className={'append'}>{props.appendText}</span>
                                    </Paragraph>
                                </div>
                                <div className={`osc-distribution-modules-content__leftover`}>
                                    <Paragraph>{props.pointsLeftoverText}</Paragraph>
                                    <Paragraph>{formatNumber(distributeLeft)} <span className={'append'}>{props.appendText}</span>
                                    </Paragraph>
                                </div>
                            </div>

                            {props.showProgress && (
                              <progress
                                className={`osc-distribution-modules-content__progress`}
                                value={props.total - distributeLeft}
                                max={props.total}
                              />
                            )}

                            <div className={`osc-distribution-modules-content__error`}>
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
                            <div className={`osc-distribution-modules-content-container`}>
                                <div className={`osc-distribution-modules-content__remaining`}>
                                    <Paragraph>{props.budgetTotalText}</Paragraph>
                                    <Paragraph><span className={'prepend'}>{props.prependText}</span> {formatNumber(props.total || 0)}
                                    </Paragraph>
                                </div>
                                <div className={`osc-distribution-modules-content__leftover`}>
                                    <Paragraph>{props.budgetLeftoverText}</Paragraph>
                                    <Paragraph><span className={'prepend'}>{props.prependText}</span> {formatNumber(distributeLeft)}
                                    </Paragraph>
                                </div>
                            </div>

                            {props.showProgress && (
                              <progress
                                className={`osc-distribution-modules-content__progress`}
                                value={props.total - distributeLeft}
                                max={props.total}
                              />
                            )}

                            <div className={`osc-distribution-modules-content__error`}>
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

                {
                  (formOnlyVisibleForUsers && !hasRole(currentUser, 'member')) && (
                    <>
                        <Banner className="big">
                            <Heading6>Inloggen om deel te nemen.</Heading6>
                            <Spacer size={1} />
                            <Button
                              type="button"
                              onClick={() => {
                                  document.location.href = props.login?.url || '';
                              }}>
                                Inloggen
                            </Button>
                        </Banner>
                        <Spacer size={2} />
                    </>
                  )
                }

                <Form
                    {...props}
                    fields={props.items || []}
                    submitHandler={onSubmit}
                    title=""
                    submitText="Versturen"
                    getValuesOnChange={valuesChanged}
                    submitDisabled={distributeLeft !== 0}
                />
            </div>

            <NotificationProvider />
        </div>
    );
}

DistributionModule.loadWidget = loadWidget;
export {DistributionModule};
