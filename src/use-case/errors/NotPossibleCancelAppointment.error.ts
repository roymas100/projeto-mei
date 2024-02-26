
// import { SentryError } from "./SentryError";

export class NotPossibleCancelAppointment extends Error {
    constructor() {
        super('It is not possible to cancel close to the appointment.')
    }
}