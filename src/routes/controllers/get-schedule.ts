import { t } from "elysia";
import { makeGetSchedule } from "../../use-case/factories/makeGetSchedule";
import { Unauthorized } from "../../use-case/errors/Unauthorized.error";

export const getScheduleParamsSchema = t.Object({
    company_id: t.String()
})

interface GetScheduleParams {
    user_id: string | null,
    params: {
        company_id: string
    }
}

export async function getSchedule({
    user_id,
    params: { company_id }
}: GetScheduleParams) {
    if (!user_id) {
        throw new Unauthorized()
    }

    const patchSchedule = makeGetSchedule()

    const { schedules } = await patchSchedule.execute({
        user_company_user_id: user_id,
        user_company_company_id: company_id
    })

    return { schedules }

}