
// import { SentryError } from "./SentryError";

export class StartAfterEnd extends Error {
    constructor() {
        super('Start of the shift can not be after end of the shift.')
    }
}