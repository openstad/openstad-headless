import type { BaseProps } from '../../../types/base-props';
import type { ProjectSettingProps } from '../../../types/project-setting-props';
import type { MapPropsType } from '../types/index';

export type BaseMapWidgetProps = BaseProps &
  ProjectSettingProps & {
    resourceId?: string;
  } & MapPropsType;
