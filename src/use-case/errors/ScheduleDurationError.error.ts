
// import { SentryError } from "./SentryError";

export class ScheduleDurationError extends Error {
    constructor() {
        super('Duration of session can not take more time than duration of start of shift and end of shift.')
    }
}