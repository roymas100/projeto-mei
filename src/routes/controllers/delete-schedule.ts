import { t } from "elysia";
import { makeDeleteSchedule } from "../../use-case/factories/makeDeleteSchedule";

export const deleteScheduleParamsSchema = t.Object({
    schedule_id: t.String()
})

interface DeleteScheduleParams {
    user_id: string | null,
    params: {
        schedule_id: string
    }
}

export async function deleteSchedule({
    user_id,
    params: { schedule_id }
}: DeleteScheduleParams) {
    if (!user_id) {
        throw new Error('Unauthorized.')
    }

    const deleteSchedule = makeDeleteSchedule()

    const { schedule } = await deleteSchedule.execute(schedule_id)

    return { schedule }

}