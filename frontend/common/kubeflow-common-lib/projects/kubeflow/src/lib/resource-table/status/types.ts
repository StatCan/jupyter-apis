export enum STATUS_TYPE {
  READY = 'ready',
  WAITING = 'waiting',
  WARNING = 'warning',
  ERROR = 'error',
  UNAVAILABLE = 'unavailable',
  UNINITIALIZED = 'uninitialized',
  TERMINATING = 'terminating',
  STOPPED = 'stopped',
  MOUNTED = 'attached',
  UNMOUNTED = 'unattached',
  DELETING = 'deleting,'
}

export interface Status {
  phase: string;
  state: string;
  message: string;
  key: { key:string; params?: object};
}
