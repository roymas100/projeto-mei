import { t } from "elysia";
import { makeAddSchedule } from "../../use-case/factories/makeAddSchedule";
import { $Enums } from "@prisma/client";
import { makePatchSchedule } from "../../use-case/factories/makePatchSchedule";

const intervals = [
    {
        name: 'Lunch',
        start: '12:00:00',
        duration: '01:00:00'
    }
]

export const patchScheduleParamsSchema = t.Object({
    schedule_id: t.String(),
    company_id: t.String()
})

export const patchScheduleBodySchema = t.Object({
    start_of_shift: t.Optional(t.String({
        examples: ['00:00:00'],
        error: 'Bad request'
    })),
    end_of_shift: t.Optional(t.String({
        examples: ['00:00:00'],
        error: 'Bad request'
    })),
    duration_per_appointment: t.Optional(t.String({
        examples: ['00:00:00'],
        error: 'Bad request'
    })),
    recurrency_type: t.Optional(t.Enum($Enums.RECURRENCY_TYPE)),
    dates: t.Optional(t.String({
        examples: ['03/24/1999;11/24/2000'],
        error: 'Bad request'
    })),
    name: t.Optional(t.String({
        examples: ['Schedule title'],
        error: 'Bad request'
    })),
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
    intervals: t.Optional(t.String({
        examples: [JSON.stringify(intervals)],
        error: 'Bad request'
    })),
})

interface PatchScheduleParams {
    params: {
        schedule_id: string
    },
    body: {
        dates?: string,
        duration_per_appointment?: string,
        end_of_shift?: string,
        intervals?: string,
        name?: string,
        recurrency_type?: $Enums.RECURRENCY_TYPE,
        start_of_shift?: string,
        user_company_company_id: string,
        user_company_user_id: string,
        priority?: number
    }
}

export async function patchSchedule({
    params: {
        schedule_id
    },
    body: {
        dates,
        duration_per_appointment,
        end_of_shift,
        intervals,
        name,
        priority,
        recurrency_type,
        start_of_shift,
        user_company_company_id,
        user_company_user_id,

    }
}: PatchScheduleParams) {
    const patchSchedule = makePatchSchedule()

    const parseIntervals = intervals ? JSON.parse(intervals) : undefined

    const { schedule } = await patchSchedule.execute({
        id: schedule_id,
        dates,
        duration_per_appointment,
        end_of_shift,
        intervals: parseIntervals,
        name,
        recurrency_type,
        start_of_shift,
        user_company_company_id,
        user_company_user_id,
        priority
    })

    return { schedule }

}