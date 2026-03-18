import { ValidationResult } from './validate';
export { ValidationResult };
export interface PluginManifest {
    name: string;
    version: string;
    packageName?: string;
    config?: Record<string, unknown>;
    api?: PluginApiSection;
    admin?: PluginAdminSection;
    widgets?: Record<string, PluginWidgetDefinition>;
    cms?: Record<string, unknown>;
}
export interface PluginApiSection {
    models?: Array<{
        name: string;
        path: string;
    }>;
    routes?: Array<{
        method: string;
        path: string;
        handler: string;
    }>;
    middleware?: Array<{
        path: string;
        position?: string;
        priority?: number;
    }>;
    migrations?: {
        directory: string;
    };
    envVars?: string[];
}
export interface PluginAdminSection {
    bundle?: {
        js: string;
        css?: string;
    };
    pages?: Array<{
        path: string;
        componentName: string;
        label?: string;
    }>;
    menuItems?: Array<{
        label: string;
        href: string;
        role?: string;
    }>;
}
export interface PluginWidgetDefinition {
    packageName: string;
    directory: string;
    js: string | string[];
    css: string | string[];
    functionName: string;
    componentName: string;
    defaultConfig: Record<string, unknown>;
    name?: string;
    description?: string;
    image?: string;
    adminBundle?: {
        js: string;
        componentName: string;
    };
}
export interface PluginEntry {
    name?: string;
    packageName?: string;
    package?: string;
    enabled: boolean;
    config?: Record<string, unknown>;
}
//# sourceMappingURL=index.d.ts.map