import type { ScheduleRepository } from "../../repositories/schedule.repository"
import { ItemDoesNotExists } from "../errors/ItemDoesNotExists.error"

export class DeleteSchedule {
    private scheduleRepository: ScheduleRepository

    constructor({ scheduleRepository }: { scheduleRepository: ScheduleRepository }) {
        this.scheduleRepository = scheduleRepository
    }

    async execute(id: string) {

        const schedule = await this.scheduleRepository.findById(id)

        if (!schedule) {
            throw new ItemDoesNotExists()
        }

        await this.scheduleRepository.delete(id)

        return { schedule }
    }
}