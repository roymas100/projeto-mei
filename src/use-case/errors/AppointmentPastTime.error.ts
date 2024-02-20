// import { SentryError } from "./SentryError";

export class AppointmentPastTime extends Error {
    constructor() {
        super('Can not make appointment of past time.')
    }
}