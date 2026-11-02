import nunjucks from 'nunjucks';
import { afterEach, describe, expect, it } from 'vitest';

const { createTemplateEnv, toPlainData } = require('./template-env');

const CANARY = 'globalThis.__templateEnvCanary = true; return 1';

// Each template tries to reach `Function` (or call a context method) along a
// different route. Rendering may throw or produce empty output, but the
// payload must never run.
const escapeAttempts = [
  `{{ range.constructor("${CANARY}")() }}`,
  `{{ "".constructor.constructor("${CANARY}")() }}`,
  `{{ (1).constructor("${CANARY}")() }}`,
  `{{ [1]["constr" + "uctor"]["constr" + "uctor"]("${CANARY}")() }}`,
  `{{ constructor.getOwnPropertyDescriptor(constructor.getPrototypeOf(toString), "constructor").value("${CANARY}")() }}`,
  `{{ __lookupGetter__("__proto__")().constructor("${CANARY}")() }}`,
  `{{ valueOf().env.filters.safe.constructor("${CANARY}")() }}`,
  `{{ user.sequelize.query("select 1") }}`,
  `{{ user.destroy() }}`,
  `{% include "../../package.json" %}`,
  `{% import "../../package.json" as pkg %}`,
  `{% extends "../../package.json" %}`,
  // Bare-name routes: Object.prototype members and a rewired prototype chain.
  `{% set __proto__ = constructor %}{{ constructor("${CANARY}")() }}`,
  `{% set __proto__ = constructor %}{% set fn = constructor %}{{ fn("${CANARY}")() }}`,
  `{{ constructor("${CANARY}")() }}`,
  `{{ valueOf().env.filters.safe("${CANARY}") }}`,
  `{% set obj = valueOf() %}{{ obj.env.filters.safe.constructor("${CANARY}")() }}`,
  // Loop variables bypass member lookup; iterables must not yield functions.
  `{% for k, v in valueOf().env.filters %}{% set __proto__ = v %}{{ constructor("${CANARY}")() }}{% endfor %}`,
  `{% for k, v in user %}{{ v("${CANARY}") }}{% endfor %}`,
  `{% for v in list %}{{ v("${CANARY}") }}{% endfor %}`,
];

function attemptRender(env, template, data) {
  try {
    return env.renderString(template, data);
  } catch (err) {
    return err;
  }
}

describe('createTemplateEnv', () => {
  afterEach(() => {
    delete globalThis.__templateEnvCanary;
  });

  it.each(escapeAttempts)('does not execute %s', (template) => {
    const env = createTemplateEnv();
    const user = {
      sequelize: { query: () => (globalThis.__templateEnvCanary = true) },
      destroy: () => (globalThis.__templateEnvCanary = true),
    };
    const list = [() => (globalThis.__templateEnvCanary = true)];
    attemptRender(env, template, { user, list });
    expect(globalThis.__templateEnvCanary).toBeUndefined();
  });

  it('never returns a function from a member lookup', () => {
    const env = createTemplateEnv();
    expect(
      env.renderString('{{ user.destroy }}', { user: { destroy() {} } })
    ).toBe('');
    expect(env.renderString('{{ title.toUpperCase }}', { title: 'x' })).toBe(
      ''
    );
  });

  it('still renders ordinary template syntax', () => {
    const env = createTemplateEnv();
    const out = env.renderString(
      '{% set a = "x" %}{% if a %}{{ a | upper }}{% endif %}' +
        '{% for i in list %}{{ i }}{% endfor %} ' +
        '{{ project.config.resources.title }} {{ list.length }} ' +
        '{{ logo or ((imagePath or "") + "/logo.png") }}',
      {
        list: [1, 2],
        project: { config: { resources: { title: 'T' } } },
        imagePath: '/img',
      }
    );
    expect(out).toBe('X12 T 2 /img/logo.png');
  });

  it('still iterates plain objects and keeps set variables', () => {
    const env = createTemplateEnv();
    const out = env.renderString(
      '{% set greeting = "Hi" %}{% for k, v in tags %}{{ greeting }} {{ k }}={{ v }};{% endfor %}' +
        '{% for item in items %}{{ item.name }}{% endfor %}',
      { tags: { a: 1, b: 'x' }, items: [{ name: 'n1' }, { name: 'n2' }] }
    );
    expect(out).toBe('Hi a=1;Hi b=x;n1n2');
  });

  it('leaves other environments in the process untouched', () => {
    const plain = new nunjucks.Environment([]);
    expect(plain.renderString('{{ s.toUpperCase() }}', { s: 'ok' })).toBe('OK');
  });

  it('restores normal lookups after a render that throws', () => {
    const env = createTemplateEnv();
    attemptRender(env, '{{ user.destroy() }}', { user: { destroy() {} } });
    const plain = new nunjucks.Environment([]);
    expect(plain.renderString('{{ s.toUpperCase() }}', { s: 'ok' })).toBe('OK');
  });
});

describe('toPlainData', () => {
  it('strips Sequelize instances down to their attributes', () => {
    const instance = {
      sequelize: {},
      get: ({ plain }) => (plain ? { id: 1, title: 'T' } : null),
      destroy: () => {},
    };
    const plain = toPlainData({
      resource: instance,
      resources: [instance],
      redirectUrl: 'https://example.org',
      nested: { keep: true },
    });
    expect(plain).toEqual({
      resource: { id: 1, title: 'T' },
      resources: [{ id: 1, title: 'T' }],
      redirectUrl: 'https://example.org',
      nested: { keep: true },
    });
    expect(plain.resource.destroy).toBeUndefined();
    expect(plain.resource.sequelize).toBeUndefined();
  });
});
