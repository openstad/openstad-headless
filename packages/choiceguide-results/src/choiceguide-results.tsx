import React, {useEffect, useState} from 'react';
import {ChoiceGuideResultsProps} from "./props.js";
import {loadWidget} from '@openstad-headless/lib/load-widget';
import {ChoiceGuideSidebar} from "../../choiceguide/src/includes/sidebar.js";
import './style.css';
import {InitializeWeights} from "../../choiceguide/src/parts/init-weights.js";
import {FormValue} from "@openstad-headless/form/src/form";
import {ChoiceOptions, WeightOverview} from "../../choiceguide/src/props";
import DataStore from "@openstad-headless/data-store/src";
import ChoiceItem from "../../choiceguide/src/includes/sidebarItem";
import {calculateScoreForItem} from "../../choiceguide/src/parts/scoreUtils";

function ChoiceGuideResults(props: ChoiceGuideResultsProps) {
    const [weights, setWeights] = useState<WeightOverview>({});
    const [answers, setAnswers] = useState<{ [key: string]: FormValue }>({});

    const datastore: any = new DataStore({
        projectId: props.projectId,
        api: props.api,
    });

    const {data: choiceGuideWidget} = datastore.useWidget({
        projectId: props.projectId,
        widgetId: props.choiceguideWidgetId,
    });

    const {choiceGuide, items, choiceOption, widgetId} = choiceGuideWidget?.config || {};

    useEffect(() => {
        if (!items || items.length === 0 || !choiceOption) return;
        const hiddenFields = answers?.hiddenFields as string[] || [];

        const initialWeights = InitializeWeights(items, choiceOption?.choiceOptions, choiceGuide?.choicesType || 'default', hiddenFields);

        setWeights(initialWeights);
    }, [items, choiceOption, answers]);

    useEffect(() => {
        if (!props.choiceguideWidgetId) return;
        const localStorageAnswers = localStorage.getItem(`choiceguide-${props.projectId}-${props.choiceguideWidgetId}`);

        try {
            if (localStorageAnswers) {
                setAnswers(JSON.parse(localStorageAnswers));
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const hideScores = props?.hideScores === true && props?.displayAsFeaturedOnly === true;
    const [bestScoredChoiceOptions, setBestScoredChoiceOptions] = useState<ChoiceOptions[]>([]);

    useEffect(() => {
        if (!props?.displayAsFeaturedOnly || !items?.length || !choiceOption?.choiceOptions || !weights) return;

        const choiceType = choiceGuide?.choicesType || 'default'

        let bestItems: ChoiceOptions[] = [];
        let bestScore = 0;

        if (choiceType === 'plane') {
            const planeScore = calculateScoreForItem(
                choiceOption?.choiceOptions,
                answers,
                weights,
                choiceType,
                [],
                items
            );

            const options = choiceOption.choiceOptions;

            const planeConditions = [
                {condition: planeScore.x <= 50 && planeScore.y > 50, option: options[0]},
                {condition: planeScore.x > 50 && planeScore.y > 50, option: options[1]},
                {condition: planeScore.x <= 50 && planeScore.y <= 50, option: options[2]},
                {condition: planeScore.x > 50 && planeScore.y <= 50, option: options[3]},
            ];

            bestItems = planeConditions.find(({condition}) => condition)?.option
                ? [planeConditions.find(({condition}) => condition)?.option]
                : [];
        } else {
            choiceOption?.choiceOptions.forEach((option: ChoiceOptions) => {

                const itemScore = calculateScoreForItem(
                    option,
                    answers,
                    weights,
                    choiceType,
                    [],
                    items
                );

                if (itemScore.x > bestScore) {
                    bestScore = itemScore.x;
                    bestItems = [option];
                } else if (itemScore.x === bestScore) {
                    bestItems.push(option);
                }
            });
        }

        setBestScoredChoiceOptions(bestItems);
    }, [props, answers, weights, items]);

    return (choiceGuideWidget.length === 0 || !choiceGuideWidget?.config)
        ? (<p>Laden...</p>)
        : (
            <div className="osc">
                <div className="osc-choiceguide-results-container">
                    {!hideScores && (
                        <ChoiceGuideSidebar
                            {...choiceGuide}
                            choiceOptions={choiceOption?.choiceOptions}
                            weights={weights}
                            answers={answers}
                            widgetId={widgetId}
                            hiddenFields={answers?.hiddenFields || []}
                            displayTitle={props?.displayTitle}
                            displayDescription={props?.displayDescription}
                            displayImage={props?.displayImage}
                        />
                    )}
                </div>

                {props?.displayAsFeaturedOnly === true && (
                    <div className="osc-choiceguide-result-featured">
                        {(bestScoredChoiceOptions || []).map((bestOption, index) => (
                            <ChoiceItem
                                key={index}
                                choiceOption={bestOption}
                                answers={answers}
                                weights={weights}
                                choicesType={'default'}
                                displayTitle={true}
                                displayDescription={true}
                                displayImage={true}
                                displayScore={false}
                            />
                        ))}
                    </div>
                )}

            </div>
        );
}

ChoiceGuideResults.loadWidget = loadWidget;
export {ChoiceGuideResults};
