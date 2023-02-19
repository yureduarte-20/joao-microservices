export class TimeOutError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "Timeout Error"
    }
}