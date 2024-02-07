// import { SentryError } from "./SentryError";

export class CancellationGraceTimeFormat extends Error {
    constructor() {
        super('Correct the cancellation grace time to the format: 00:00:00')
    }
}