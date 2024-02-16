
// import { SentryError } from "./SentryError";

export class ItemDoesNotExists extends Error {
    constructor() {
        super('Item does not exists on table.')
    }
}