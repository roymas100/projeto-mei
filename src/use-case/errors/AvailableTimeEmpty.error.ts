// import { SentryError } from "./SentryError";

export class AvailableTimeEmpty extends Error {
    constructor() {
        super('Warning. List is empty probably because there are intervals overwriting shift.')
    }
}