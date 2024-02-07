// import { SentryError } from "./SentryError";

export class TokenDoesNotMatch extends Error {
    constructor() {
        super('Token does not match.')
    }
}