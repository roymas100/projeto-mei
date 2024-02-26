import { t } from "elysia";
import { makeAddSchedule } from "../../use-case/factories/makeAddSchedule";
import { $Enums } from "@prisma/client";
import { makePatchSchedule } from "../../use-case/factories/makePatchSchedule";
import { makeMakeAppointment } from "../../use-case/factories/makeMakeAppointment";

export const makeAppointmentParamsSchema = t.Object({
})

export const makeAppointmentBodySchema = t.Object({
    phone: t.String({
        examples: ['00:00:00'],
        error: 'Bad request'
    }),
    name: t.String({
        examples: ['00:00:00'],
        error: 'Bad request'
    }),
    time: t.Date({
        examples: ['00:00:00'],
        error: 'Bad request'
    }),
    title: t.String({
        examples: ['Schedule title'],
        error: 'Bad request'
    }),
    user_company_company_id: t.String({
        error: 'Bad request'
    }),
    user_company_user_id: t.String({
        error: 'Bad request'
    }),
})

interface MakeAppointmentParams {
    body: {
        name: string,
        phone: string,
        time: Date,
        title: string,
        user_company_company_id: string,
        user_company_user_id: string
    }
}

export async function makeAppointment({
    body: {
        name,
        phone,
        time,
        title,
        user_company_company_id,
        user_company_user_id

    }
}: MakeAppointmentParams) {
    const makeAppointment = makeMakeAppointment()

    const { appointment } = await makeAppointment.execute({
        name,
        phone,
        time,
        title,
        user_company_company_id,
        user_company_user_id
    })

    return { appointment }

}