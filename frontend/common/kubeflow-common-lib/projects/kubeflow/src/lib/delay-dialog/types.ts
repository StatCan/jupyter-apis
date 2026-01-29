export interface DelayDialogConfig {
  title: string;
  message: string;
  accept: string;
  applying: string;
  error?: string;
  confirmColor: string;
  maxDelayAuthorized: number;
  delayChoosen: number;
  cancel: string;
  width?: string;
}

export enum DELAY_DIALOG_RESP {
  CANCEL = 'cancel',
  ACCEPT = 'accept', 
}
