export interface DelayDialogConfig {
  title: string;
  message: string;
  accept: string;
  applying: string;
  error?: string;
  confirmColor: string;
  cancel: string;
  width?: string;
  hours?: string;
}

export enum DELAY_DIALOG_RESP {
  CANCEL = 'cancel',
  ACCEPT = 'accept',
}
