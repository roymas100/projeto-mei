import { t } from "elysia";
import { makeAddSchedule } from "../../use-case/factories/makeAddSchedule";
import { $Enums } from "@prisma/client";

const intervals = [
    {
        name: 'Lunch',
        start: '12:00:00',
        duration: '01:00:00'
    }
]

export const addScheduleParamsSchema = t.Object({
    company_id: t.String()
})

export const addScheduleBodySchema = t.Object({
    start_of_shift: t.String({
        examples: ['00:00:00'],
        error: 'Bad request'
    }),
    end_of_shift: t.String({
        examples: ['00:00:00'],
        error: 'Bad request'
    }),
    duration_per_appointment: t.String({
        examples: ['00:00:00'],
        error: 'Bad request'
    }),
    recurrency_type: t.Enum($Enums.RECURRENCY_TYPE),
    dates: t.String({
        examples: ['03/24/1999;11/24/2000'],
        error: 'Bad request'
    }),
    name: t.String({
        examples: ['Schedule title'],
        error: 'Bad request'
    }),
    user_company_company_id: t.String({
        error: 'Bad request'
    }),
    user_company_user_id: t.String({
        error: 'Bad request'
    }),
    priority: t.Optional(t.Number({
        examples: ['1', '2'],
        error: 'Bad request'
    })),
    intervals: t.String({
        examples: [JSON.stringify(intervals)],
        error: 'Bad request'
    }),
})

interface AddScheduleParams {
    user_id: string | null
    params: {
        company_id: string
    },
    body: {
        dates: string,
        duration_per_appointment: string,
        end_of_shift: string,
        intervals: string,
        name: string,
        recurrency_type: $Enums.RECURRENCY_TYPE,
        start_of_shift: string,
        priority?: number
    }
}

export async function addSchedule({
    user_id,
    params: {
        company_id
    },
    body: {
        dates,
        duration_per_appointment,
        end_of_shift,
        intervals,
        name, priority,
        recurrency_type,
        start_of_shift
    }
}: AddScheduleParams) {
    if (!user_id) {
        throw new Error('Unauthorized.')
    }


    const addSchedule = makeAddSchedule()

    const parseIntervals = JSON.parse(intervals)

    const { schedule } = await addSchedule.execute({
        dates,
        duration_per_appointment,
        end_of_shift,
        intervals: parseIntervals,
        name,
        recurrency_type,
        start_of_shift,
        user_company_company_id: company_id,
        user_company_user_id: user_id,
        priority
    })

    return { schedule }
}