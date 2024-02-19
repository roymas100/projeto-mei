// import { SentryError } from "./SentryError";

export class Unauthorized extends Error {
    constructor() {
        super('Unauthorized.')
    }
}