/**
 * Generic type declarations for plugin modules.
 *
 * Plugin components are auto-discovered from manifests at runtime,
 * so we use wildcard patterns to accept any plugin package path.
 * No manual module declarations needed per plugin.
 */

declare module '*/admin/pages/*' {
  import type { ComponentType } from 'react';
  const Component: ComponentType<any>;
  export default Component;
}

declare module '*/admin/widgets/*' {
  import type { ComponentType } from 'react';
  const Component: ComponentType<any>;
  export default Component;
}
