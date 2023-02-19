export default class TimeOutError extends Error {
    constructor(msg: string) {
      super(msg);
      this.name = "Timeout Error"
    }
  }