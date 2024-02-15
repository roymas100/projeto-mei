// import { SentryError } from "./SentryError";

export class ScheduleTypeError extends Error {
    constructor() {
        super('To patch recurrency_type, it must send new dates.')
    }
}