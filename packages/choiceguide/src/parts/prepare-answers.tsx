import {WeightOverview} from '../props';
import {FormValue} from "@openstad-headless/form/src/form.js";

export const prepareAnwers = (values: { [p: string]: FormValue }, weights: WeightOverview) => {

  console.log( 'Start' );
  console.log( values );
  console.log( weights );
  console.log( 'End' );

  return weights;
};