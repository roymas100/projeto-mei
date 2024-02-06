// import { SentryError } from "./SentryError";

export class UserAlreadyExists extends Error {
    constructor() {
        super('User already exists.')
    }
}