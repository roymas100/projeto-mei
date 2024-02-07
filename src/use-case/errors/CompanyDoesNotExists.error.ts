// import { SentryError } from "./SentryError";

export class CompanyDoesNotExists extends Error {
    constructor() {
        super('Company does not exists.')
    }
}