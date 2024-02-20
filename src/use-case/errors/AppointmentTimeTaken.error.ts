// import { SentryError } from "./SentryError";

export class AppointmentTimeTaken extends Error {
    constructor() {
        super('Appointment time is taken.')
    }
}