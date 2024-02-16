
// import { SentryError } from "./SentryError";

export class UserCompanyDoesNotExists extends Error {
    constructor() {
        super('User without company connection.')
    }
}