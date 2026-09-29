export class NotificationManager {
  private showToastFn: (msg: string, isError?: boolean) => void;

  constructor(showToastFn: (msg: string, isError?: boolean) => void) {
    this.showToastFn = showToastFn;
  }

  showToast(msg: string, isError = false): void {
    this.showToastFn(msg, isError);
  }
}
