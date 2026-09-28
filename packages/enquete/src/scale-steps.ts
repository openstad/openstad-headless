// Helpers for the steps of a scale question.
//
// A scale question renders as a tickmark slider. What the steps look like is
// an exclusive choice: plain numbers, the fixed set of five smileys, or a
// custom list where every step carries its own text and/or image. Items saved
// before this option existed have no scaleDisplay; they keep behaving exactly
// as before via the showSmileys flag.
import { Item, ScaleStepConfig } from './types/enquete-props';

export type ScaleConfig = Pick<
  Item,
  | 'scaleDisplay'
  | 'scaleStepCount'
  | 'scaleSteps'
  | 'showSmileys'
  | 'defaultValue'
>;

export const DEFAULT_SCALE_STEP_COUNT = 5;
export const MIN_SCALE_STEPS = 2;
export const MAX_SCALE_STEPS = 10;

export const SMILEY_SCALE_STEP_COUNT = DEFAULT_SCALE_STEP_COUNT;

export type ScaleDisplay = 'numbers' | 'smileys' | 'custom';

export type ScaleFieldOption = {
  value: string;
  label: string;
  image?: { url: string; alt: string };
};

export type ScaleChoice = {
  value: string;
  label: string;
  trigger: string;
};

export function getScaleDisplay(item: ScaleConfig): ScaleDisplay {
  if (item.scaleDisplay) return item.scaleDisplay;
  return item.showSmileys ? 'smileys' : 'numbers';
}

export function getScaleStepCount(item: ScaleConfig): number {
  const display = getScaleDisplay(item);

  if (display === 'custom') {
    return Math.max(item.scaleSteps?.length || 0, MIN_SCALE_STEPS);
  }

  if (display === 'numbers') {
    const count = Number(item.scaleStepCount);
    return Number.isInteger(count) &&
      count >= MIN_SCALE_STEPS &&
      count <= MAX_SCALE_STEPS
      ? count
      : DEFAULT_SCALE_STEP_COUNT;
  }

  return SMILEY_SCALE_STEP_COUNT;
}

export function getScaleDefaultStep(
  item: ScaleConfig,
  stepCount: number
): string {
  const configured = Number(item.defaultValue);

  if (
    Number.isInteger(configured) &&
    configured >= 1 &&
    configured <= stepCount
  ) {
    return String(configured);
  }

  return Math.ceil(stepCount / 2).toString();
}

export function buildScaleChoices(stepCount: number): ScaleChoice[] {
  return Array.from({ length: stepCount }, (_, index) => {
    const value = String(index + 1);
    return { value, label: value, trigger: `scale-${value}` };
  });
}

export function buildCustomScaleFieldOptions(
  steps: ScaleStepConfig[] | undefined
): ScaleFieldOption[] {
  const options: ScaleFieldOption[] = (steps || []).map((step, index) => ({
    value: String(index + 1),
    label: step.label || '',
    image: step.imageUrl
      ? { url: step.imageUrl, alt: step.imageAlt || '' }
      : undefined,
  }));

  while (options.length < MIN_SCALE_STEPS) {
    const value = String(options.length + 1);
    options.push({ value, label: value, image: undefined });
  }

  return options;
}
