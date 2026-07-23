export interface FormDialogConfig {
  title: string;
  message: string;
  boldMessage: string;
  accept: string;
  applying: string;
  error?: string;
  confirmColor: string;
  cancel: string;
  width?: string;
  oldSize: string;
}

export interface FormDialogResponse {
  applying: boolean;
  newSize: number;
}
