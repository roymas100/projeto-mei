
// import { SentryError } from "./SentryError";

export class DateFormatIncompatible extends Error {
    constructor() {
        super('Date format is not compatible with reccurency type.')
    }
}