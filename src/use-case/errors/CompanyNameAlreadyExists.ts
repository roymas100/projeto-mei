// import { SentryError } from "./SentryError";

export class CompanyNameAlreadyExists extends Error {
    constructor() {
        super('Cannot create company with same name.')
    }
}