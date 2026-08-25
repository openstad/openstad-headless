export interface EditFieldProps<T extends {}> {
  updateConfig: (changedValues: T) => void | Promise<boolean>;
  onFieldChanged: (key: string, value: any) => void;
}
