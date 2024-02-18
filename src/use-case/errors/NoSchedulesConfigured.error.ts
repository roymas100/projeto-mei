
// import { SentryError } from "./SentryError";

export class NoSchedulesConfigured extends Error {
    constructor() {
        super('No schedule configured.')
    }
}