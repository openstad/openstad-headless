'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateManifest = validateManifest;
/**
 * Validates a plugin manifest object.
 *
 * Checks required top-level fields and validates nested sections
 * (api.models, api.routes, api.middleware, widgets, admin.pages, admin.menuItems).
 */
function validateManifest(manifest) {
    const errors = [];
    // Required top-level fields
    if (!manifest || typeof manifest !== 'object') {
        return { valid: false, errors: ['Manifest must be a non-null object'] };
    }
    if (typeof manifest.name !== 'string' || !manifest.name) {
        errors.push('Missing or invalid required field: name (must be a non-empty string)');
    }
    if (typeof manifest.version !== 'string' || !manifest.version) {
        errors.push('Missing or invalid required field: version (must be a non-empty string)');
    }
    // Validate api section
    const api = manifest.api;
    if (api) {
        if (Array.isArray(api.models)) {
            api.models.forEach((model, i) => {
                if (!model.name) {
                    errors.push(`api.models[${i}]: missing required field "name"`);
                }
                if (!model.path) {
                    errors.push(`api.models[${i}]: missing required field "path"`);
                }
            });
        }
        if (Array.isArray(api.routes)) {
            api.routes.forEach((route, i) => {
                if (!route.method) {
                    errors.push(`api.routes[${i}]: missing required field "method"`);
                }
                if (!route.path) {
                    errors.push(`api.routes[${i}]: missing required field "path"`);
                }
                if (!route.handler) {
                    errors.push(`api.routes[${i}]: missing required field "handler"`);
                }
            });
        }
        if (Array.isArray(api.middleware)) {
            api.middleware.forEach((mw, i) => {
                if (!mw.path) {
                    errors.push(`api.middleware[${i}]: missing required field "path"`);
                }
            });
        }
    }
    // Validate widgets section
    const widgets = manifest.widgets;
    if (widgets) {
        const requiredWidgetKeys = [
            'packageName',
            'directory',
            'js',
            'css',
            'functionName',
            'componentName',
            'defaultConfig',
        ];
        Object.entries(widgets).forEach(([key, widget]) => {
            requiredWidgetKeys.forEach((reqKey) => {
                if (widget[reqKey] === undefined || widget[reqKey] === null) {
                    errors.push(`widgets["${key}"]: missing required field "${reqKey}"`);
                }
            });
        });
    }
    // Validate admin section
    const admin = manifest.admin;
    if (admin) {
        if (Array.isArray(admin.pages)) {
            admin.pages.forEach((page, i) => {
                if (!page.path) {
                    errors.push(`admin.pages[${i}]: missing required field "path"`);
                }
                // Runtime IIFE pages use componentName; build-time pages use componentPath + entry
                if (!page.componentName && !page.componentPath) {
                    errors.push(`admin.pages[${i}]: missing required field "componentName" or "componentPath"`);
                }
            });
        }
        if (Array.isArray(admin.menuItems)) {
            admin.menuItems.forEach((item, i) => {
                if (!item.label) {
                    errors.push(`admin.menuItems[${i}]: missing required field "label"`);
                }
                if (!item.href) {
                    errors.push(`admin.menuItems[${i}]: missing required field "href"`);
                }
            });
        }
    }
    if (errors.length > 0) {
        return { valid: false, errors };
    }
    return { valid: true };
}
//# sourceMappingURL=validate.js.map