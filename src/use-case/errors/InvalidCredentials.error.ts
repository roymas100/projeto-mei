
// import { SentryError } from "./SentryError";

export class InvalidCredentials extends Error {
    constructor() {
        super('Invalid Credentials')
    }
}