// import { SentryError } from "./SentryError";

export class TimeIsNotAvailable extends Error {
    constructor() {
        super('This time is not available to make appointment.')
    }
}