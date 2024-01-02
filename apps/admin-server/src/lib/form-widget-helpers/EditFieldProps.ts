export interface EditFieldProps<T extends {}> {
  updateConfig: (changedValues: T) => void;
  onFieldChanged: (key: string, value: any) => void;
}
