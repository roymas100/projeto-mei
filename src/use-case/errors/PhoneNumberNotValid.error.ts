// import { SentryError } from "./SentryError";

export class PhoneNumberNotValid extends Error {
    constructor() {
        super('Phone number not valid.')
    }
}