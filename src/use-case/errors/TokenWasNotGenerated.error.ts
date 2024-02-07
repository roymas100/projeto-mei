// import { SentryError } from "./SentryError";

export class TokenWasNotGenerated extends Error {
    constructor() {
        super('Authentication token was not generated.')
    }
}