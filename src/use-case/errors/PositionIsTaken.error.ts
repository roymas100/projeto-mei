
// import { SentryError } from "./SentryError";

export class PositionIsTaken extends Error {
    constructor() {
        super('This priority is already taken. Try to send an elevated position.')
    }
}