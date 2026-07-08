'use strict';

const { makeReportTool } = require('./make-report-tool');
const {
  dateFrom,
  dateTo,
  status,
  page,
  pageSize,
  widgetIdOptional,
  widgetIdRequired,
} = require('./shared-params');

// Curated, one tool per reporting endpoint — NOT a generic "call any URL"
// tool. Best practice for OpenAPI-derived MCP tools is to keep the tool
// surface small and explicit rather than a 1:1 passthrough (see the MCP
// research memo in the reporting-api-standards plan): a generic tool would
// reintroduce the exact credential/scope risk this server exists to avoid.
const RECORD_PARAMS = { dateFrom, dateTo, page, pageSize };
const RECORD_PARAMS_WITH_STATUS = { ...RECORD_PARAMS, status };

const TOOLS = [
  makeReportTool({
    name: 'reporting_resources',
    description: 'List resources for this project.',
    path: '/resources',
    paramsShape: RECORD_PARAMS,
  }),
  makeReportTool({
    name: 'reporting_votes',
    description: 'List votes for this project.',
    path: '/votes',
    paramsShape: RECORD_PARAMS,
  }),
  makeReportTool({
    name: 'reporting_comments',
    description: 'List comments for this project.',
    path: '/comments',
    paramsShape: RECORD_PARAMS,
  }),
  makeReportTool({
    name: 'reporting_enquiries',
    description:
      'List enquiry submissions (submissions on an enquete widget) for this project.',
    path: '/enquiries',
    paramsShape: RECORD_PARAMS_WITH_STATUS,
  }),
  makeReportTool({
    name: 'reporting_projects',
    description: "Get this token's own project.",
    path: '/projects',
    paramsShape: RECORD_PARAMS,
  }),
  makeReportTool({
    name: 'reporting_submissions',
    description:
      'List form submissions, with answer fields flattened per opted-in field.',
    path: '/submissions',
    paramsShape: { ...RECORD_PARAMS_WITH_STATUS, widgetId: widgetIdOptional },
  }),
  makeReportTool({
    name: 'reporting_submissions_fields',
    description:
      'Describe the opted-in fields exposed by reporting_submissions for one form.',
    path: '/submissions/fields',
    paramsShape: { widgetId: widgetIdRequired },
  }),
  makeReportTool({
    name: 'reporting_choice_guides',
    description: 'List choice-guide definitions for this project.',
    path: '/choice-guides',
    paramsShape: RECORD_PARAMS,
  }),
  makeReportTool({
    name: 'reporting_choice_guide_questions',
    description:
      'List choice-guide question rows, flattened from the guide widget config.',
    path: '/choice-guide-questions',
    paramsShape: { widgetId: widgetIdOptional },
  }),
  makeReportTool({
    name: 'reporting_choice_guide_results',
    description:
      'List choice-guide results, with answers flattened per opted-in field.',
    path: '/choice-guide-results',
    paramsShape: { ...RECORD_PARAMS, widgetId: widgetIdOptional },
  }),
  makeReportTool({
    name: 'reporting_users_anonymized',
    description:
      'List pseudonymized participant rows across every data source.',
    path: '/users/anonymized',
    paramsShape: { page, pageSize },
  }),
  makeReportTool({
    name: 'reporting_users_aggregates',
    description: 'Get unique-participant counts across every data source.',
    path: '/users/aggregates',
    paramsShape: {},
  }),
];

module.exports = { TOOLS };
