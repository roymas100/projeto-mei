import { t } from "elysia";
import { makeGetAvailableTimes } from "../../use-case/factories/makeGetAvailableTimes";
import { format } from "date-fns";
import { Unauthorized } from "../../use-case/errors/Unauthorized.error";

export const getAvailableTimesParamsSchema = t.Object({
    company_id: t.String()
})

export const getAvailableTimesQuerySchema = t.Object({
    date: t.Optional(t.String({
        examples: [format(new Date(), 'MM/dd/yyyy')],
        error: 'Bad request',
        format: "date",
        default: format(new Date(), 'MM/dd/yyyy')
    })),
})

interface GetAvailableTimesParams {
    user_id: string | null,
    query: {
        date?: string
    },
    params: {
        company_id: string
    },
}

export async function getAvailableTimes({
    user_id,
    params: {
        company_id
    },
    query: {
        date = format(new Date(), 'MM/dd/yyyy')
    }
}: GetAvailableTimesParams) {
    if (!user_id) {
        throw new Unauthorized()
    }

    const getAvailableTimes = makeGetAvailableTimes()

    const { times } = await getAvailableTimes.execute({
        company_id,
        date,
        user_id
    })

    return { times }

}