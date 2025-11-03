import React, {FC, useEffect, useState} from "react";
import {
  Fieldset,
  FieldsetLegend,
  Checkbox,
  FormFieldDescription,
  AccordionProvider,
  Table,
  TableRow,
  TableCell,
  TableHeaderCell,
  TableBody,
  TableHeader, RadioButton,
  FormField,
  FormLabel,
  Paragraph,
} from "@utrecht/component-library-react";
import { Spacer } from '@openstad-headless/ui/src';
import { Matrix } from "@openstad-headless/enquete/src/types/enquete-props";
import './matrix.css';
import { FormValue } from "@openstad-headless/form/src/form";

export type MatrixFieldProps = {
    title: string;
    overrideDefaultValue?: FormValue;
    description?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    type?: string;
    onChange?: (e: {name: string, value: string | Record<number, never> | [] | string[]}, triggerSetLastKey?: boolean) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    maxChoices?: string,
    randomId?: string;
    fieldInvalid?: boolean;
    matrixMultiple?: boolean;
    matrix?: Matrix;
    defaultValue?: string;
    fieldOptions?: { value: string; label: string }[];
    nextPageText?: string;
    prevPageText?: string;
}

const MatrixField: FC<MatrixFieldProps> = ({
       title,
       description,
       fieldRequired = false,
       fieldKey,
       onChange,
       disabled = false,
       showMoreInfo = false,
       moreInfoButton = 'Meer informatie',
       moreInfoContent = '',
       infoImage = '',
       maxChoices = '',
       randomId= '',
       fieldInvalid= false,
       matrix= {
           columns: [],
           rows: [],
       },
       matrixMultiple = false,
       overrideDefaultValue,
}) => {
    const initialValue = Array.isArray(overrideDefaultValue) ? overrideDefaultValue as string[] : [];
    const [selectedChoices, setSelectedChoices] = useState<string[]>(initialValue);

    const maxChoicesNum = parseInt(maxChoices, 10) || 0;
    const maxReached = maxChoicesNum > 0 && selectedChoices.length >= maxChoicesNum;

    useEffect(() => {
        if (onChange) {
            onChange({
                name: fieldKey,
                value: selectedChoices
            });
        }
    } , [ JSON.stringify(selectedChoices) ]);

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    const handleChoiceChange = (value: string, rowId: string): void => {
        const removeSelectedRadio = !matrixMultiple && selectedChoices.find((choice) => choice.startsWith(rowId));
        const removeSelectedCheckbox = matrixMultiple && selectedChoices.includes(value);

        let newSelectedChoices = [...selectedChoices];
        if (removeSelectedRadio) {
            newSelectedChoices = newSelectedChoices.filter((choice) => !choice.startsWith(rowId));
            newSelectedChoices.push(value);
        } else if (removeSelectedCheckbox) {
            newSelectedChoices = newSelectedChoices.filter((choice) => choice !== value);
        } else {
            newSelectedChoices.push(value);
        }

        setSelectedChoices(newSelectedChoices);
    };

    return (
        <div className="question">
          <Fieldset
            role="group"
            aria-invalid={fieldInvalid}
            aria-describedby={`${randomId}_error`}
          >

            {title && (
              <FieldsetLegend dangerouslySetInnerHTML={{ __html: title }} />
            )}

            {description &&
                <>
                    <FormFieldDescription dangerouslySetInnerHTML={{__html: description}}/>
                    <Spacer size={.5}/>
                </>
            }

            {showMoreInfo && (
              <>
                <AccordionProvider
                  sections={[
                    {
                      headingLevel: 3,
                      body: <HtmlContent html={moreInfoContent}/>,
                      expanded: undefined,
                      label: moreInfoButton,
                    }
                  ]}
                />
                <Spacer size={1.5}/>
              </>
            )}

            {infoImage && (
              <figure className="info-image-container">
                <img src={infoImage} alt=""/>
                <Spacer size={.5}/>
              </figure>
            )}

            <Table role="presentation" data-columns={matrix?.columns?.length || 0} data-rows={matrix?.rows?.length || 0}>
              <TableHeader role="presentation">
                <TableRow>
                  <TableHeaderCell key={`column--1`}></TableHeaderCell>

                  {matrix?.columns?.map((column, index) =>
                    <TableHeaderCell key={`column-${index}`}>
                      <span className="column-text">{column?.text || ''}</span>
                    </TableHeaderCell>
                  )}

                </TableRow>
              </TableHeader>
              <TableBody>

                {matrix?.rows?.map((row, ri) =>
                  <TableRow>
                    <TableCell key={`row-${ri}`}>
                      <span className="row-text">{row?.text || ''}</span>
                    </TableCell>

                    {matrix?.columns?.map((column, ci) => {
                      const cellIndex = column?.trigger && row?.trigger ? `${row?.trigger}_${column?.trigger}` : `${ri}_${ci}`;
                      const rowIndex = row?.trigger || ri.toString();
                      const type = matrixMultiple ? 'checkbox' : 'radio';

                      return (
                        <TableCell key={`cell-${cellIndex}`}>
                          <FormField type={type}>
                            <Paragraph className={`utrecht-form-field__label utrecht-form-field__label--${type}`}>
                              <FormLabel htmlFor={`${fieldKey}_${cellIndex}`} type={type} className="--label-grid">
                                { matrixMultiple ? (
                                  <>
                                    <Checkbox
                                      className="utrecht-form-field__input"
                                      id={`${fieldKey}_${cellIndex}`}
                                      name={`${fieldKey}_${rowIndex}`}
                                      value={cellIndex}
                                      required={fieldRequired}
                                      checked={selectedChoices.includes(cellIndex)}
                                      onChange={() => handleChoiceChange(cellIndex, rowIndex)}
                                      disabled={disabled || (maxReached && !selectedChoices.includes(cellIndex))}
                                    />
                                    <span className="cell-text">{column?.text || ''}</span>
                                  </>
                                ) : (
                                  <>
                                    <RadioButton
                                      className="utrecht-form-field__input"
                                      id={`${fieldKey}_${cellIndex}`}
                                      name={`${fieldKey}_${rowIndex}`}
                                      value={cellIndex}
                                      required={fieldRequired}
                                      onChange={() => handleChoiceChange(cellIndex, rowIndex)}
                                      disabled={disabled}
                                      checked={selectedChoices.includes(cellIndex)}
                                    />
                                    <span className="cell-text">{column?.text || ''}</span>
                                  </>
                                )}
                              </FormLabel>
                            </Paragraph>
                          </FormField>
                        </TableCell>
                      )}
                    )}

                  </TableRow>
                )}

              </TableBody>
            </Table>

          </Fieldset>
        </div>
    );
};

export default MatrixField;
