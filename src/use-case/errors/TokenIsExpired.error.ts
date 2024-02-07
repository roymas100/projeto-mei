// import { SentryError } from "./SentryError";

export class TokenIsExpired extends Error {
    constructor() {
        super('Token is expired.')
    }
}