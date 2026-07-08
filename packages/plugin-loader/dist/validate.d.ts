export interface ValidationResult {
    valid: boolean;
    errors?: string[];
}
/**
 * Validates a plugin manifest object.
 *
 * Checks required top-level fields and validates nested sections
 * (api.models, api.routes, api.middleware, widgets, admin.pages, admin.menuItems).
 */
export declare function validateManifest(manifest: Record<string, unknown> | null | undefined): ValidationResult;
//# sourceMappingURL=validate.d.ts.map