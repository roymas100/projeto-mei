
// import { SentryError } from "./SentryError";

export class IntervalBeforeStart extends Error {
    constructor() {
        super('Interval can not start before shift starts.')
    }
}