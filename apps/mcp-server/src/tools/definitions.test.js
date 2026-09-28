import { describe, expect, it } from 'vitest';

const { TOOLS } = require('./definitions');

describe('reporting tool definitions', () => {
  it('registers exactly one curated tool per reporting endpoint (12), no generic passthrough', () => {
    expect(TOOLS).toHaveLength(12);
    expect(TOOLS.map((t) => t.name)).toEqual([
      'reporting_resources',
      'reporting_votes',
      'reporting_comments',
      'reporting_enquiries',
      'reporting_projects',
      'reporting_submissions',
      'reporting_submissions_fields',
      'reporting_choice_guides',
      'reporting_choice_guide_questions',
      'reporting_choice_guide_results',
      'reporting_users_anonymized',
      'reporting_users_aggregates',
    ]);
  });

  it('every tool has a description and maps to a reporting API path', () => {
    for (const tool of TOOLS) {
      expect(tool.description).toEqual(expect.any(String));
      expect(tool.description.length).toBeGreaterThan(0);
      expect(typeof tool.handler).toBe('function');
    }
  });

  it('requires widgetId for reporting_submissions_fields, but not for reporting_submissions', () => {
    const fields = TOOLS.find((t) => t.name === 'reporting_submissions_fields');
    const submissions = TOOLS.find((t) => t.name === 'reporting_submissions');
    expect(fields.inputSchema.widgetId.isOptional()).toBe(false);
    expect(submissions.inputSchema.widgetId.isOptional()).toBe(true);
  });

  it('only exposes a status filter on endpoints backed by a model with a status column', () => {
    const withStatus = ['reporting_enquiries', 'reporting_submissions'];
    for (const tool of TOOLS) {
      const hasStatus = Object.prototype.hasOwnProperty.call(
        tool.inputSchema,
        'status'
      );
      expect(hasStatus).toBe(withStatus.includes(tool.name));
    }
  });
});
