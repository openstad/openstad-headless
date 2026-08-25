// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  detectEnvironment,
  mapQuestionType,
  pushFormError,
  pushFormStart,
  pushFormStep,
  pushFormSubmit,
  pushQuestionInteract,
} from './gtm-datalayer';

describe('gtm-datalayer', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  describe('detectEnvironment', () => {
    it('returns the override when a valid value is provided', () => {
      expect(detectEnvironment('test')).toBe('test');
      expect(detectEnvironment('acc')).toBe('acc');
      expect(detectEnvironment('prod')).toBe('prod');
    });

    it('returns "prod" when no override is provided', () => {
      expect(detectEnvironment()).toBe('prod');
    });

    it('returns "prod" for invalid override values', () => {
      expect(detectEnvironment('invalid')).toBe('prod');
      expect(detectEnvironment('')).toBe('prod');
    });
  });

  describe('mapQuestionType', () => {
    it('maps open to textbox', () => {
      expect(mapQuestionType('open')).toBe('textbox');
    });

    it('maps multiplechoice to select_single', () => {
      expect(mapQuestionType('multiplechoice')).toBe('select_single');
    });

    it('maps multiple to select_multiple', () => {
      expect(mapQuestionType('multiple')).toBe('select_multiple');
    });

    it('maps scale with smileys to emoji_slider', () => {
      expect(mapQuestionType('scale', true)).toBe('emoji_slider');
    });

    it('maps scale without smileys to number_slider', () => {
      expect(mapQuestionType('scale', false)).toBe('number_slider');
    });

    it('maps swipe to keuzeswipe', () => {
      expect(mapQuestionType('swipe')).toBe('keuzeswipe');
    });

    it('maps images to beeldkiezer', () => {
      expect(mapQuestionType('images')).toBe('beeldkiezer');
    });

    it('passes through unknown types', () => {
      expect(mapQuestionType('dilemma')).toBe('dilemma');
    });
  });

  describe('pushFormStart', () => {
    it('pushes form_start event with correct structure', () => {
      pushFormStart({
        environment: 'prod',
        formId: 'fid123',
        formName: 'Test Enquete',
        displayType: 'standard',
        memberId: '456',
      });

      expect(window.dataLayer).toHaveLength(1);
      expect(window.dataLayer![0]).toEqual({
        event: 'form_start',
        environment: 'prod',
        form_provider: 'openstad',
        form_id: 'fid123',
        form_name: 'Test Enquete',
        display_type: 'standard',
        member_id: '456',
      });
    });

    it('omits member_id when not provided', () => {
      pushFormStart({
        environment: 'prod',
        formId: 'fid123',
        formName: 'Test',
        displayType: 'standard',
      });

      expect(window.dataLayer![0]).not.toHaveProperty('member_id');
    });
  });

  describe('pushFormStep', () => {
    it('pushes form_step event with step info', () => {
      pushFormStep({
        environment: 'prod',
        formId: 'fid123',
        formName: 'Test',
        displayType: 'standard',
        formStep: 2,
        formStepName: 'Persoonlijke gegevens',
        formStepTotal: 3,
        formStatus: 'in_progress',
      });

      expect(window.dataLayer![0]).toEqual({
        event: 'form_step',
        environment: 'prod',
        form_provider: 'openstad',
        form_id: 'fid123',
        form_name: 'Test',
        display_type: 'standard',
        form_step: 2,
        form_step_name: 'Persoonlijke gegevens',
        form_step_total: 3,
        form_status: 'in_progress',
      });
    });
  });

  describe('pushFormSubmit', () => {
    it('pushes form_submit event', () => {
      pushFormSubmit({
        environment: 'prod',
        formId: 'fid123',
        formName: 'Test',
        displayType: 'standard',
      });

      expect(window.dataLayer![0]).toEqual({
        event: 'form_submit',
        environment: 'prod',
        form_provider: 'openstad',
        form_id: 'fid123',
        form_name: 'Test',
        display_type: 'standard',
      });
    });
  });

  describe('pushQuestionInteract', () => {
    it('pushes question_interact event with question info', () => {
      pushQuestionInteract({
        environment: 'prod',
        formId: 'fid123',
        formName: 'Test',
        displayType: 'standard',
        formStep: 1,
        formStepName: 'Stap 1',
        formStepTotal: 2,
        formStatus: 'started',
        questionId: 'qid456',
        questionName: 'Wat vind je van je buurt?',
        questionType: 'textbox',
      });

      expect(window.dataLayer![0]).toMatchObject({
        event: 'question_interact',
        question_id: 'qid456',
        question_name: 'Wat vind je van je buurt?',
        question_type: 'textbox',
      });
    });
  });

  describe('pushFormError', () => {
    it('pushes form_error event with error details', () => {
      pushFormError({
        environment: 'prod',
        formId: 'fid123',
        formName: 'Test',
        displayType: 'standard',
        formStep: 1,
        formStepName: 'Stap 1',
        formStepTotal: 2,
        formStatus: 'started',
        questionId: 'qid456',
        questionName: 'Email',
        questionType: 'textbox',
        formErrorText: "Het veld 'Email' is verplicht",
        formErrorType: 'required_field',
      });

      expect(window.dataLayer![0]).toMatchObject({
        event: 'form_error',
        form_error_text: "Het veld 'Email' is verplicht",
        form_error_type: 'required_field',
      });
    });
  });
});
