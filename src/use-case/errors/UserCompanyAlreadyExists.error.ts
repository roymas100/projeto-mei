// import { SentryError } from "./SentryError";

export class UserCompanyAlreadyExists extends Error {
    constructor() {
        super('Is not possible to create two connections between an user and a company.')
    }
}